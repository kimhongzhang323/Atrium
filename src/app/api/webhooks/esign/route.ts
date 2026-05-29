import { createHmac, timingSafeEqual } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";

import { dbAdmin } from "@/server/db/client";
import { auditLog, domainEvents, signatureRequests, signatureStatusEnum } from "@/server/db/schema";

type SignatureStatus = (typeof signatureStatusEnum.enumValues)[number];

/**
 * E-signature provider webhook (Dropbox Sign / Adobe Sign).
 *
 * Cross-tenant by nature — there is no session — so it resolves the org from
 * the signature request matched by providerRequestId, then writes via dbAdmin.
 *
 * Security:
 *   - HMAC-SHA256 over the *raw* body is verified (constant-time) against
 *     `x-esign-signature` using ESIGN_WEBHOOK_SECRET before any DB access.
 *     Replace with the exact provider header/scheme at integration time
 *     (Dropbox Sign: hash of event_time+event_type; Adobe Sign: client-id + HMAC).
 *   - Idempotency: provider event id is recorded in domain_events; duplicates
 *     are acknowledged without re-applying the state change.
 */

const PROVIDER_STATUS: Record<string, SignatureStatus> = {
  signature_request_sent: "sent",
  signature_request_signed: "partial",
  signature_request_all_signed: "completed",
  signature_request_declined: "declined",
  signature_request_expired: "expired",
};

function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.ESIGN_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  let b: Buffer;
  try {
    b = Buffer.from(header, "hex");
  } catch {
    return false;
  }
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get("x-esign-signature"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const event = body as {
    event_id?: string;
    event_type?: string;
    provider_request_id?: string;
  };
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

  const eventId = event.event_id ?? `${providerRequestId}:${event.event_type}`;

  await dbAdmin.transaction(async (tx) => {
    // Idempotency guard: skip if this exact provider event was already applied.
    const seen = await tx.query.domainEvents.findFirst({
      where: and(
        eq(domainEvents.orgId, request.orgId),
        eq(domainEvents.eventType, "signature.webhook"),
        sql`${domainEvents.payload}->>'eventId' = ${eventId}`,
      ),
    });
    if (seen) return;

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
    await tx.insert(domainEvents).values({
      orgId: request.orgId,
      eventType: "signature.webhook",
      payload: { eventId, requestId: request.id, status },
    });
  });

  return Response.json({ ok: true });
}
