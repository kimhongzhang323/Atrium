import { z } from "zod";

const STAGE_VALUES = ["prospect", "contacted", "proposal", "committed", "declined"] as const;

export const createSponsorSchema = z.object({
  name: z.string().min(1).max(160),
  eventId: z.string().uuid().optional(),
  tier: z.string().max(40).optional(),
  amountTarget: z.number().int().nonnegative().default(0),
  ownerId: z.string().uuid().optional(),
});

export const logSponsorInteractionSchema = z.object({
  sponsorId: z.string().uuid(),
  kind: z.string().min(1).max(40),
  note: z.string().min(1).max(4000),
});

export const moveSponsorStageSchema = z.object({
  sponsorId: z.string().uuid(),
  stage: z.enum(STAGE_VALUES),
  amountSecured: z.number().int().nonnegative().optional(),
});
