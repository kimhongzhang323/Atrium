"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { dbAdmin } from "@/server/db/client";
import { domainEvents, events, registrations } from "@/server/db/schema";
import { err, ok, type Result } from "@/lib/result";

/**
 * Public event registration. Unauthenticated by design, so it cannot use
 * `defineAction` (no session). Uses the privileged `dbAdmin` connection but
 * only ever writes a registration row scoped to the org that owns the event.
 *
 * TODO(stage5): front with Vercel BotID + captcha and a rate limiter before
 * this is exposed on a public route.
 */

const registerSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
});

export async function registerForEvent(
  raw: unknown,
): Promise<Result<{ registrationId: string }>> {
  try {
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) return err({ code: "VALIDATION", message: "Invalid input" });

    const event = await dbAdmin.query.events.findFirst({ where: eq(events.id, parsed.data.eventId) });
    if (!event || event.archivedAt) {
      return err({ code: "NOT_FOUND", message: "Event not open for registration" });
    }

    const registrationId = await dbAdmin.transaction(async (tx) => {
      const [reg] = await tx
        .insert(registrations)
        .values({
          orgId: event.orgId,
          eventId: event.id,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
        })
        .onConflictDoNothing({ target: [registrations.eventId, registrations.email] })
        .returning();
      if (!reg) throw new Error("ALREADY_REGISTERED");

      await tx.insert(domainEvents).values({
        orgId: event.orgId,
        eventType: "registration.created",
        payload: { registrationId: reg.id, eventId: event.id },
      });
      return reg.id;
    });

    return ok({ registrationId });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_REGISTERED") {
      return err({ code: "CONFLICT", message: "This email is already registered for the event" });
    }
    console.error("[public-registration:registerForEvent]", e);
    return err({ code: "INTERNAL", message: "Something went wrong" });
  }
}
