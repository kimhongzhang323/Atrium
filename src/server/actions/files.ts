"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";

import { defineAction } from "@/server/action";
import { AppError } from "@/lib/result";
import { fileLinks, filePermissions } from "@/server/db/schema";

export const linkDriveFileSchema = z.object({
  driveFileId: z.string().min(1),
  driveMimeType: z.string().min(1),
  name: z.string().min(1).max(240),
  eventId: z.string().uuid().optional(),
  classification: z.enum(["public", "internal", "restricted", "confidential"]).default("internal"),
});

export const linkDriveFile = defineAction({
  name: "file.link",
  input: linkDriveFileSchema,
  permission: "file.link",
  async handler({ session, tx, audit, emit }, input) {
    const [row] = await tx
      .insert(fileLinks)
      .values({
        orgId: session.orgId,
        driveFileId: input.driveFileId,
        driveMimeType: input.driveMimeType,
        name: input.name,
        eventId: input.eventId,
        classification: input.classification,
        ownerUserId: session.userId,
      })
      .returning();
    if (!row) throw new Error("Failed to link file");

    await audit({ action: "file.link", targetType: "file", targetId: row.id, after: row });
    await emit({ type: "file.linked", payload: { fileLinkId: row.id, driveFileId: row.driveFileId } });
    updateTag(`org:${session.orgId}:files`);
    return { file: row };
  },
});

export const grantFilePermissionSchema = z.object({
  fileLinkId: z.string().uuid(),
  principalType: z.enum(["user", "role", "dept"]),
  principalId: z.string().min(1),
  access: z.enum(["view", "comment", "edit", "sign"]),
  expiresAt: z.coerce.date().optional(),
});

export const grantFilePermission = defineAction({
  name: "file.grant",
  input: grantFilePermissionSchema,
  permission: "file.grant",
  async handler({ session, tx, audit, emit }, input) {
    const file = await tx.query.fileLinks.findFirst({ where: eq(fileLinks.id, input.fileLinkId) });
    if (!file) throw new AppError({ code: "NOT_FOUND", message: "File not found" });

    const [perm] = await tx
      .insert(filePermissions)
      .values({
        orgId: session.orgId,
        fileLinkId: input.fileLinkId,
        principalType: input.principalType,
        principalId: input.principalId,
        access: input.access,
        grantedBy: session.userId,
        expiresAt: input.expiresAt,
      })
      .returning();

    await audit({ action: "file.grant", targetType: "file", targetId: input.fileLinkId, after: perm });
    // Stage 6 consumer mirrors this grant to Google Drive via the Drive API.
    await emit({ type: "file.permission.granted", payload: { fileLinkId: input.fileLinkId, permissionId: perm?.id } });
    updateTag(`file:${input.fileLinkId}:permissions`);
    return { permission: perm };
  },
});

export const revokeFilePermissionSchema = z.object({ permissionId: z.string().uuid() });

export const revokeFilePermission = defineAction({
  name: "file.revoke",
  input: revokeFilePermissionSchema,
  permission: "file.revoke",
  async handler({ tx, audit, emit }, { permissionId }) {
    const perm = await tx.query.filePermissions.findFirst({ where: eq(filePermissions.id, permissionId) });
    if (!perm) throw new AppError({ code: "NOT_FOUND", message: "Permission not found" });

    await tx.delete(filePermissions).where(eq(filePermissions.id, permissionId));

    await audit({ action: "file.revoke", targetType: "file", targetId: perm.fileLinkId, before: perm });
    await emit({ type: "file.permission.revoked", payload: { fileLinkId: perm.fileLinkId, permissionId } });
    updateTag(`file:${perm.fileLinkId}:permissions`);
    return { ok: true };
  },
});
