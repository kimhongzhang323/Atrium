"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { eventMembers } from "@/server/db/schema";

import { addEventMemberSchema, removeEventMemberSchema } from "./event-members.schema";

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
