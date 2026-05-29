"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";

import { defineAction } from "@/server/action";
import { eventMembers } from "@/server/db/schema";

export const addEventMemberSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum([
    "director", "vice_director", "secretary", "treasurer",
    "dept_head", "protocol", "committee",
  ]),
});

export const addEventMember = defineAction({
  name: "event.member.add",
  input: addEventMemberSchema,
  permission: "event.member.add",
  async handler({ session, tx, audit, emit }, { eventId, userId, role }) {
    const [row] = await tx
      .insert(eventMembers)
      .values({ orgId: session.orgId, eventId, userId, role })
      .onConflictDoUpdate({
        target: [eventMembers.eventId, eventMembers.userId],
        set: { role },
      })
      .returning();
    if (!row) throw new Error("Failed to add event member");

    await audit({ action: "event.member.add", targetType: "event", targetId: eventId, after: row });
    await emit({ type: "event.member.added", payload: { eventId, userId, role } });
    updateTag(`event:${eventId}`);
    return { member: row };
  },
});

export const removeEventMemberSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const removeEventMember = defineAction({
  name: "event.member.remove",
  input: removeEventMemberSchema,
  permission: "event.member.add",
  async handler({ tx, audit }, { eventId, userId }) {
    await tx
      .delete(eventMembers)
      .where(and(eq(eventMembers.eventId, eventId), eq(eventMembers.userId, userId)));

    await audit({ action: "event.member.remove", targetType: "event", targetId: eventId, after: { userId } });
    updateTag(`event:${eventId}`);
    return { ok: true };
  },
});
