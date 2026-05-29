"use server";

import { and, eq, isNull } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";

import { defineAction } from "@/server/action";
import { events } from "@/server/db/schema";

export const createEventSchema = z.object({
  code: z.string().min(1).max(16),
  name: z.string().min(1).max(120),
  venue: z.string().min(1).max(160),
  budgetTotal: z.number().int().nonnegative().default(0),
  sponsorTarget: z.number().int().nonnegative().default(0),
  registrationsTarget: z.number().int().nonnegative().default(0),
  isCompetition: z.boolean().default(false),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

export const createEvent = defineAction({
  name: "event.create",
  input: createEventSchema,
  permission: "event.create",
  async handler({ session, tx, audit, emit }, input) {
    const [row] = await tx
      .insert(events)
      .values({
        orgId: session.orgId,
        code: input.code,
        name: input.name,
        venue: input.venue,
        budgetTotal: input.budgetTotal,
        sponsorTarget: input.sponsorTarget,
        registrationsTarget: input.registrationsTarget,
        isCompetition: input.isCompetition,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      })
      .returning();
    if (!row) throw new Error("Failed to create event");

    await audit({ action: "event.create", targetType: "event", targetId: row.id, after: row });
    await emit({ type: "event.created", payload: { eventId: row.id, code: row.code } });

    updateTag(`org:${session.orgId}:events`);
    return { event: row };
  },
});

export const updateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  venue: z.string().min(1).max(160).optional(),
  status: z.enum(["Planning", "Live", "Completed"]).optional(),
  budgetTotal: z.number().int().nonnegative().optional(),
  sponsorTarget: z.number().int().nonnegative().optional(),
  registrationsTarget: z.number().int().nonnegative().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

export const updateEvent = defineAction({
  name: "event.update",
  input: updateEventSchema,
  permission: "event.update",
  async handler({ tx, audit }, { id, ...patch }) {
    const before = await tx.query.events.findFirst({ where: eq(events.id, id) });
    if (!before) throw new Error("Event not found");

    const [after] = await tx
      .update(events)
      .set(patch)
      .where(eq(events.id, id))
      .returning();

    await audit({ action: "event.update", targetType: "event", targetId: id, before, after });
    updateTag(`event:${id}`);
    return { event: after };
  },
});

export const archiveEventSchema = z.object({ id: z.string().uuid() });

export const archiveEvent = defineAction({
  name: "event.archive",
  input: archiveEventSchema,
  permission: "event.archive",
  async handler({ session, tx, audit, emit }, { id }) {
    const [after] = await tx
      .update(events)
      .set({ archivedAt: new Date(), status: "Completed" })
      .where(and(eq(events.id, id), isNull(events.archivedAt)))
      .returning();
    if (!after) throw new Error("Event not found or already archived");

    await audit({ action: "event.archive", targetType: "event", targetId: id, after });
    await emit({ type: "event.archived", payload: { eventId: id } });
    updateTag(`org:${session.orgId}:events`);
    return { event: after };
  },
});
