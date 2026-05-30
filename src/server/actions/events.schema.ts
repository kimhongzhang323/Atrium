import { z } from "zod";

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

export const archiveEventSchema = z.object({ id: z.string().uuid() });
