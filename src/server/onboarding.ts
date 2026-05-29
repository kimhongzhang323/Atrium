"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/server/auth";
import { dbAdmin } from "@/server/db/client";
import { invitations, organizations, orgMembers, users } from "@/server/db/schema";
import { AppError, err, ok, type Result } from "@/lib/result";

/**
 * Bootstrap actions that legitimately cannot run inside `withTenantTx`:
 * the acting user has no org yet (createOrganization) or is joining a
 * *different* org than their session is scoped to (acceptInvitation).
 *
 * These use the privileged `dbAdmin` connection (BYPASSRLS). Each is tightly
 * guarded so it only ever writes rows belonging to the authenticated user:
 *   - createOrganization: only when the user has no org.
 *   - acceptInvitation: only when the invitation's email matches the session.
 */

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "org";
}

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

const createOrgSchema = z.object({ name: z.string().min(2).max(120) });

export async function createOrganization(
  raw: unknown,
): Promise<Result<{ orgId: string }>> {
  try {
    const parsed = createOrgSchema.safeParse(raw);
    if (!parsed.success) {
      return err({ code: "VALIDATION", message: "Invalid input" });
    }
    const session = await auth();
    if (!session?.user) return err({ code: "UNAUTHENTICATED", message: "Sign in required" });

    const me = await dbAdmin.query.users.findFirst({ where: eq(users.id, session.user.id) });
    if (!me) return err({ code: "NOT_FOUND", message: "User not found" });
    if (me.orgId) return err({ code: "CONFLICT", message: "You already belong to an organization" });

    const orgId = await dbAdmin.transaction(async (tx) => {
      const slug = `${slugify(parsed.data.name)}-${session.user.id.slice(0, 6)}`;
      const [org] = await tx
        .insert(organizations)
        .values({ name: parsed.data.name, slug, createdBy: session.user.id })
        .returning();
      if (!org) throw new Error("Failed to create organization");

      await tx
        .update(users)
        .set({ orgId: org.id, role: "director", initials: initialsOf(me.name || me.email) })
        .where(eq(users.id, session.user.id));
      await tx.insert(orgMembers).values({ orgId: org.id, userId: session.user.id, role: "director" });
      return org.id;
    });

    return ok({ orgId });
  } catch (e) {
    if (e instanceof AppError) return err(e.toJSON());
    console.error("[onboarding:createOrganization]", e);
    return err({ code: "INTERNAL", message: "Something went wrong" });
  }
}

const acceptInviteSchema = z.object({ token: z.string().min(8) });

export async function acceptInvitation(
  raw: unknown,
): Promise<Result<{ orgId: string }>> {
  try {
    const parsed = acceptInviteSchema.safeParse(raw);
    if (!parsed.success) {
      return err({ code: "VALIDATION", message: "Invalid input" });
    }
    const session = await auth();
    if (!session?.user) return err({ code: "UNAUTHENTICATED", message: "Sign in required" });

    const invite = await dbAdmin.query.invitations.findFirst({
      where: eq(invitations.token, parsed.data.token),
    });
    if (!invite || invite.status !== "pending") {
      return err({ code: "NOT_FOUND", message: "Invitation not found or already used" });
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      return err({ code: "CONFLICT", message: "Invitation has expired" });
    }
    if (invite.email.toLowerCase() !== (session.user.email ?? "").toLowerCase()) {
      return err({ code: "FORBIDDEN", message: "This invitation was issued to a different email" });
    }

    await dbAdmin.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ orgId: invite.orgId, role: invite.role, dept: invite.dept })
        .where(eq(users.id, session.user.id));
      await tx
        .insert(orgMembers)
        .values({ orgId: invite.orgId, userId: session.user.id, role: invite.role, dept: invite.dept })
        .onConflictDoNothing();
      await tx
        .update(invitations)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(and(eq(invitations.id, invite.id), eq(invitations.status, "pending")));
    });

    return ok({ orgId: invite.orgId });
  } catch (e) {
    if (e instanceof AppError) return err(e.toJSON());
    console.error("[onboarding:acceptInvitation]", e);
    return err({ code: "INTERNAL", message: "Something went wrong" });
  }
}
