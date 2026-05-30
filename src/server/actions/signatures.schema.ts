import { z } from "zod";

export const createSignatureRequestSchema = z.object({
  fileLinkId: z.string().uuid(),
  provider: z.enum(["dropbox_sign", "adobe_sign"]).default("dropbox_sign"),
  expiresAt: z.coerce.date().optional(),
  signers: z
    .array(
      z.object({
        userId: z.string().uuid().optional(),
        email: z.string().email().optional(),
        order: z.number().int().nonnegative().default(0),
      }),
    )
    .min(1)
    .max(20),
});

export const cancelSignatureRequestSchema = z.object({ requestId: z.string().uuid() });
