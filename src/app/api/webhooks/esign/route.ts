import { eq } from "drizzle-orm";

import { dbAdmin } from "@/server/db/client";
import { auditLog, signatureRequests, signatureStatusEnum } from "@/server/db/schema";

type SignatureStatus = (typeof signatureStatusEnum.enumValues)[number];

/**
 * E-signature provider webhook (Dropbox Sign / Adobe Sign).
 *
 * Cross-tenant by nature — there is no session — so it resolves the org from
 * the signature request matched by providerRequestId, then writes via dbAdmin.
 *
 * TODO(stage5): verify the provider's webhook signature (HMAC) before trusting
 * the payload; make the handler idempotent on provider event id.
 */

const PROVIDER_STATUS: Record<string, SignatureStatus> = {
  signature_request_sent: "sent",
  signature_request_signed: "partial",
  signature_request_all_signed: "completed",
  signature_request_declined: "declined",
  signature_request_expired: "expired",
};

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const event = body as { event_type?: string; provider_request_id?: string };
  const providerRequestId = event.provider_request_id;
  const status = event.event_type ? PROVIDER_STATUS[event.event_type] : undefined;
  if (!providerRequestId || !status) {
    return Response.json({ error: "unrecognized event" }, { status: 422 });
  }

  const request = await dbAdmin.query.signatureRequests.findFirst({
    where: eq(signatureRequests.providerRequestId, providerRequestId),
  });
  if (!request) {
    return Response.json({ error: "request not found" }, { status: 404 });
  }

  await dbAdmin.transaction(async (tx) => {
    const [after] = await tx
      .update(signatureRequests)
      .set({ status, completedAt: status === "completed" ? new Date() : null })
      .where(eq(signatureRequests.id, request.id))
      .returning();
    await tx.insert(auditLog).values({
      orgId: request.orgId,
      action: "signature.webhook",
      targetType: "signature_request",
      targetId: request.id,
      before: request,
      after,
    });
  });

  return Response.json({ ok: true });
}
