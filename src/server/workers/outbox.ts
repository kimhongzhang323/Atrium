import { asc, eq, isNull, sql } from "drizzle-orm";

import { dbAdmin } from "@/server/db/client";
import { domainEvents, notifications } from "@/server/db/schema";

/**
 * Outbox consumer. Reads unprocessed `domain_events` and fans out side effects
 * (in-app notifications today; email + AI signal regeneration as they land).
 *
 * Runs in a trusted background context (Vercel Cron / Queue) with no session,
 * so it uses `dbAdmin`. Every write carries an explicit org_id taken from the
 * event row — RLS is bypassed but tenant scoping is preserved by construction.
 *
 * At-least-once: an event is marked processed only after its handler succeeds.
 */

type DomainEventRow = typeof domainEvents.$inferSelect;

async function dispatch(event: DomainEventRow): Promise<void> {
  const payload = (event.payload ?? {}) as Record<string, unknown>;

  switch (event.eventType) {
    case "task.assigned": {
      const ownerId = payload.ownerId as string | undefined;
      if (ownerId) {
        await dbAdmin.insert(notifications).values({
          orgId: event.orgId,
          userId: ownerId,
          title: "New task assigned",
          body: "You were assigned a task.",
          link: payload.taskId ? `/tasks/${payload.taskId as string}` : null,
        });
      }
      break;
    }
    case "invoice.fully_approved": {
      // Treasurer notification is created when the payment step is reached;
      // here we just acknowledge. Recipient resolution lands with Stage 6 email.
      break;
    }
    default:
      break;
  }
}

export async function processOutbox(limit = 100): Promise<{ processed: number; failed: number }> {
  const pending = await dbAdmin.query.domainEvents.findMany({
    where: isNull(domainEvents.processedAt),
    orderBy: [asc(domainEvents.createdAt)],
    limit,
  });

  let processed = 0;
  let failed = 0;
  for (const event of pending) {
    try {
      await dispatch(event);
      await dbAdmin
        .update(domainEvents)
        .set({ processedAt: new Date(), attempts: sql`${domainEvents.attempts} + 1` })
        .where(eq(domainEvents.id, event.id));
      processed++;
    } catch (e) {
      failed++;
      console.error(`[outbox] failed to process ${event.id} (${event.eventType})`, e);
      await dbAdmin
        .update(domainEvents)
        .set({ attempts: sql`${domainEvents.attempts} + 1` })
        .where(eq(domainEvents.id, event.id));
    }
  }
  return { processed, failed };
}
