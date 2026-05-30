import { z } from "zod";

export const markNotificationReadSchema = z.object({ id: z.string().uuid() });

export const dismissSignalSchema = z.object({ id: z.string().uuid() });

export const setNotificationPreferenceSchema = z.object({
  eventType: z.string().min(1).max(80),
  inApp: z.boolean().default(true),
  email: z.boolean().default(false),
});
