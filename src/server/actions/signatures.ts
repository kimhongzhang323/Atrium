"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { AppError } from "@/lib/result";
import { fileLinks, signatureRequestSigners, signatureRequests } from "@/server/db/schema";

import { cancelSignatureRequestSchema, createSignatureRequestSchema } from "./signatures.schema";

export const createSignatureRequest = defineAction({
  name: "signature.request",
  input: createSignatureRequestSchema,
  permission: "signature.request",
  async handler({ session, tx, audit, emit }, input) {
    const file = await tx.query.fileLinks.findFirst({ where: eq(fileLinks.id, input.fileLinkId) });
    if (!file) throw new AppError({ code: "NOT_FOUND", message: "File not found" });

    const [request] = await tx
      .insert(signatureRequests)
      .values({
        orgId: session.orgId,
        fileLinkId: input.fileLinkId,
        requestedBy: session.userId,
        provider: input.provider ?? "dropbox_sign",
        status: "sent",
        expiresAt: input.expiresAt,
      })
      .returning();
    if (!request) throw new Error("Failed to create signature request");

    for (const signer of input.signers) {
      if (!signer.userId && !signer.email) {
        throw new AppError({ code: "VALIDATION", message: "Each signer needs a userId or email" });
      }
      await tx.insert(signatureRequestSigners).values({
        orgId: session.orgId,
        requestId: request.id,
        signerUserId: signer.userId,
        email: signer.email,
        order: signer.order,
      });
    }

    await audit({ action: "signature.request", targetType: "signature_request", targetId: request.id, after: request });
    // Stage 6 consumer calls the licensed e-sig provider API and stores providerRequestId.
    await emit({ type: "signature.requested", payload: { requestId: request.id, provider: request.provider } });
    updateTag(`file:${input.fileLinkId}:signatures`);
    return { request };
  },
});

export const cancelSignatureRequest = defineAction({
  name: "signature.cancel",
  input: cancelSignatureRequestSchema,
  permission: "signature.manage",
  async handler({ tx, audit, emit }, { requestId }) {
    const before = await tx.query.signatureRequests.findFirst({ where: eq(signatureRequests.id, requestId) });
    if (!before) throw new AppError({ code: "NOT_FOUND", message: "Request not found" });
    if (before.status === "completed") {
      throw new AppError({ code: "CONFLICT", message: "Cannot cancel a completed request" });
    }

    const [after] = await tx
      .update(signatureRequests)
      .set({ status: "expired" })
      .where(eq(signatureRequests.id, requestId))
      .returning();

    await audit({ action: "signature.cancel", targetType: "signature_request", targetId: requestId, before, after });
    await emit({ type: "signature.cancelled", payload: { requestId } });
    updateTag(`file:${before.fileLinkId}:signatures`);
    return { request: after };
  },
});
