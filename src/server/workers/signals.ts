import { isNull } from "drizzle-orm";

import { dbAdmin } from "@/server/db/client";
import { aiSignals, eventSnapshots, events } from "@/server/db/schema";

/**
 * Rule-based AI Rail signals + daily KPI snapshots. v1 is deterministic; the
 * LLM swap-in (via Vercel AI Gateway) is deferred. Runs from daily cron over
 * every org via `dbAdmin`; each row carries its event's org_id.
 */

type EventRow = typeof events.$inferSelect;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

function fraction(part: number, whole: number): number {
  return whole <= 0 ? 1 : part / whole;
}

type Signal = {
  orgId: string;
  eventId: string;
  type: "risk" | "opportunity" | "nudge" | "comparison";
  severity: number;
  title: string;
  body: string;
  dedupeKey: string;
};

function evaluate(event: EventRow, now: Date): Signal[] {
  const out: Signal[] = [];
  if (!event.startsAt) return out;

  const totalDays = event.createdAt ? Math.max(1, daysBetween(event.createdAt, event.startsAt)) : 1;
  const elapsed = event.createdAt ? Math.max(0, daysBetween(event.createdAt, now)) : 0;
  const expectedPace = Math.min(1, elapsed / totalDays);

  const sponsorPace = fraction(event.sponsorSecured, event.sponsorTarget);
  if (event.sponsorTarget > 0 && sponsorPace < expectedPace - 0.15) {
    const behind = Math.round((expectedPace - sponsorPace) * 100);
    out.push({
      orgId: event.orgId,
      eventId: event.id,
      type: "risk",
      severity: behind > 30 ? 3 : 2,
      title: `${event.code} sponsorship behind pace`,
      body: `Sponsorship is ${behind}% behind the expected pace for day ${elapsed} of ${totalDays}.`,
      dedupeKey: `sponsor-pace:${event.id}`,
    });
  }

  const regPace = fraction(event.registrationsCurrent, event.registrationsTarget);
  if (event.registrationsTarget > 0 && regPace < expectedPace - 0.2) {
    out.push({
      orgId: event.orgId,
      eventId: event.id,
      type: "nudge",
      severity: 1,
      title: `${event.code} registrations lagging`,
      body: `Registrations at ${Math.round(regPace * 100)}% of target with ${Math.max(0, totalDays - elapsed)} days to go.`,
      dedupeKey: `reg-pace:${event.id}`,
    });
  }

  if (event.budgetTotal > 0 && event.budgetCommitted > event.budgetTotal) {
    out.push({
      orgId: event.orgId,
      eventId: event.id,
      type: "risk",
      severity: 3,
      title: `${event.code} over budget`,
      body: `Committed spend exceeds the total budget.`,
      dedupeKey: `over-budget:${event.id}`,
    });
  }

  return out;
}

export async function generateSignals(now = new Date()): Promise<{ created: number }> {
  const liveEvents = await dbAdmin.query.events.findMany({ where: isNull(events.archivedAt) });
  let created = 0;
  for (const event of liveEvents) {
    for (const signal of evaluate(event, now)) {
      await dbAdmin
        .insert(aiSignals)
        .values(signal)
        .onConflictDoUpdate({
          target: [aiSignals.orgId, aiSignals.dedupeKey],
          set: { severity: signal.severity, title: signal.title, body: signal.body, dismissedAt: null },
        });
      created++;
    }
  }
  return { created };
}

export async function snapshotEvents(now = new Date()): Promise<{ snapshots: number }> {
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const liveEvents = await dbAdmin.query.events.findMany({ where: isNull(events.archivedAt) });
  for (const event of liveEvents) {
    await dbAdmin
      .insert(eventSnapshots)
      .values({
        orgId: event.orgId,
        eventId: event.id,
        snapshotDate: day,
        kpis: {
          budgetTotal: event.budgetTotal,
          budgetCommitted: event.budgetCommitted,
          sponsorTarget: event.sponsorTarget,
          sponsorSecured: event.sponsorSecured,
          registrationsTarget: event.registrationsTarget,
          registrationsCurrent: event.registrationsCurrent,
        },
      })
      .onConflictDoNothing({ target: [eventSnapshots.eventId, eventSnapshots.snapshotDate] });
  }
  return { snapshots: liveEvents.length };
}
