import { z } from "zod";

export const checkInAttendeeSchema = z.object({ registrationId: z.string().uuid() });

export const runDrawSchema = z.object({
  eventId: z.string().uuid(),
  prizes: z.array(z.string().min(1).max(80)).min(1).max(50),
});

export const recordInventoryMovementSchema = z.object({
  itemId: z.string().uuid(),
  delta: z.number().int(),
  reason: z.string().min(1).max(120),
});
