import { z } from "zod";

export const linkDriveFileSchema = z.object({
  driveFileId: z.string().min(1),
  driveMimeType: z.string().min(1),
  name: z.string().min(1).max(240),
  eventId: z.string().uuid().optional(),
  classification: z.enum(["public", "internal", "restricted", "confidential"]).default("internal"),
});

export const grantFilePermissionSchema = z.object({
  fileLinkId: z.string().uuid(),
  principalType: z.enum(["user", "role", "dept"]),
  principalId: z.string().min(1),
  access: z.enum(["view", "comment", "edit", "sign"]),
  expiresAt: z.coerce.date().optional(),
});

export const revokeFilePermissionSchema = z.object({ permissionId: z.string().uuid() });
