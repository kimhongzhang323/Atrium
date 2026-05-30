"use server";

import { randomBytes } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { departments, invitations, orgMembers, users } from "@/server/db/schema";

import {
  assignDepartmentSchema,
  assignRoleSchema,
  createDepartmentSchema,
  inviteMemberSchema,
  removeMemberSchema,
} from "./org-admin.schema";

export const inviteMember = defineAction({
  name: "org.invite",
  input: inviteMemberSchema,
  permission: "org.invite",
  async handler({ session, tx, audit, emit }, { email, role, dept }) {
    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const [row] = await tx
      .insert(invitations)
      .values({
        orgId: session.orgId,
        email,
        role,
        dept,
        token,
        invitedBy: session.userId,
        expiresAt,
      })
      .returning();
    if (!row) throw new Error("Failed to create invitation");

    await audit({ action: "org.invite", targetType: "invitation", targetId: row.id, after: { email, role } });
    await emit({ type: "member.invited", payload: { invitationId: row.id, email, token } });
    return { invitation: row };
  },
});

export const assignRole = defineAction({
  name: "org.assign_role",
  input: assignRoleSchema,
  permission: "org.assign_role",
  async handler({ session, tx, audit }, { userId, role }) {
    const before = await tx.query.users.findFirst({ where: eq(users.id, userId) });
    if (!before) throw new Error("User not found in this org");

    const [after] = await tx.update(users).set({ role }).where(eq(users.id, userId)).returning();
    await tx
      .update(orgMembers)
      .set({ role })
      .where(and(eq(orgMembers.orgId, session.orgId), eq(orgMembers.userId, userId)));

    await audit({ action: "org.assign_role", targetType: "user", targetId: userId, before, after });
    updateTag(`user:${userId}`);
    return { user: after };
  },
});

export const assignDepartment = defineAction({
  name: "org.assign_dept",
  input: assignDepartmentSchema,
  permission: "org.assign_dept",
  async handler({ session, tx, audit }, { userId, dept }) {
    const before = await tx.query.users.findFirst({ where: eq(users.id, userId) });
    if (!before) throw new Error("User not found in this org");

    const [after] = await tx.update(users).set({ dept }).where(eq(users.id, userId)).returning();
    await tx
      .update(orgMembers)
      .set({ dept })
      .where(and(eq(orgMembers.orgId, session.orgId), eq(orgMembers.userId, userId)));

    await audit({ action: "org.assign_dept", targetType: "user", targetId: userId, before, after });
    updateTag(`user:${userId}`);
    return { user: after };
  },
});

export const createDepartment = defineAction({
  name: "org.create_dept",
  input: createDepartmentSchema,
  permission: "org.create_dept",
  async handler({ session, tx, audit }, { code, name, color }) {
    const [row] = await tx
      .insert(departments)
      .values({ orgId: session.orgId, code, name, color })
      .returning();
    if (!row) throw new Error("Failed to create department");

    await audit({ action: "org.create_dept", targetType: "department", targetId: row.id, after: row });
    updateTag(`org:${session.orgId}:departments`);
    return { department: row };
  },
});

export const removeMember = defineAction({
  name: "org.remove_member",
  input: removeMemberSchema,
  permission: "org.remove_member",
  async handler({ session, tx, audit }, { userId }) {
    if (userId === session.userId) {
      throw new Error("You cannot remove yourself");
    }
    await tx
      .delete(orgMembers)
      .where(and(eq(orgMembers.orgId, session.orgId), eq(orgMembers.userId, userId)));

    await audit({ action: "org.remove_member", targetType: "user", targetId: userId, after: { removed: true } });
    return { ok: true };
  },
});
