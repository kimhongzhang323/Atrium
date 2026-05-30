"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { aiSignals, notificationPreferences, notifications } from "@/server/db/schema";

import {
  dismissSignalSchema,
  markNotificationReadSchema,
  setNotificationPreferenceSchema,
} from "./notifications.schema";

export const markNotificationRead = defineAction({
  name: "notification.read",
  input: markNotificationReadSchema,
  async handler({ session, tx }, { id }) {
    const [row] = await tx
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.userId)))
      .returning();
    updateTag(`user:${session.userId}:notifications`);
    return { notification: row };
  },
});

export const dismissSignal = defineAction({
  name: "signal.dismiss",
  input: dismissSignalSchema,
  permission: "signal.dismiss",
  async handler({ session, tx, audit }, { id }) {
    const [row] = await tx
      .update(aiSignals)
      .set({ dismissedAt: new Date() })
      .where(eq(aiSignals.id, id))
      .returning();

    await audit({ action: "signal.dismiss", targetType: "ai_signal", targetId: id, after: row });
    updateTag(`org:${session.orgId}:signals`);
    return { signal: row };
  },
});

export const setNotificationPreference = defineAction({
  name: "notification.preference",
  input: setNotificationPreferenceSchema,
  async handler({ session, tx }, { eventType, inApp, email }) {
    const [row] = await tx
      .insert(notificationPreferences)
      .values({ orgId: session.orgId, userId: session.userId, eventType, inApp, email })
      .onConflictDoUpdate({
        target: [notificationPreferences.userId, notificationPreferences.eventType],
        set: { inApp, email },
      })
      .returning();
    return { preference: row };
  },
});
