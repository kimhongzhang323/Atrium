import { z } from "zod";

const DEPT_VALUES = ["SPR", "PnP", "PUB", "LOGI", "MM", "TECH"] as const;

export const createBudgetLineSchema = z.object({
  eventId: z.string().uuid(),
  category: z.string().min(1).max(80),
  description: z.string().max(400).default(""),
  dept: z.enum(DEPT_VALUES).optional(),
  amountPlanned: z.number().int().nonnegative().default(0),
});
