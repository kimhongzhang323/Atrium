"use server";

import { z } from "zod";

// eslint-disable-next-line local/require-define-action -- Stage 1 stub schema; Stage 2 co-locates this inside defineAction.
export const createEventSchema = z.object({
  code: z.string().min(2).max(8),
  name: z.string().min(2).max(80),
  venue: z.string().min(2).max(200),
  budgetTotal: z.number().int().nonnegative(),
  sponsorTarget: z.number().int().nonnegative(),
  registrationsTarget: z.number().int().nonnegative(),
  isCompetition: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// eslint-disable-next-line local/require-define-action -- Stage 1 stub; Stage 2 rewrites this via defineAction.
export async function createEvent(_input: CreateEventInput): Promise<never> {
  throw new Error(
    "createEvent is not implemented in Stage 1. It will be rewritten via defineAction in Stage 2 to run inside withTenantTx so RLS is enforced.",
  );
}
