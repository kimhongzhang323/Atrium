import { z } from "zod";

const ROLE_VALUES = [
  "director", "vice_director", "secretary", "treasurer",
  "dept_head", "protocol", "committee",
] as const;
const DEPT_VALUES = ["SPR", "PnP", "PUB", "LOGI", "MM", "TECH"] as const;

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLE_VALUES).default("committee"),
  dept: z.enum(DEPT_VALUES).optional(),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLE_VALUES),
});

export const assignDepartmentSchema = z.object({
  userId: z.string().uuid(),
  dept: z.enum(DEPT_VALUES).nullable(),
});

export const createDepartmentSchema = z.object({
  code: z.string().min(1).max(16),
  name: z.string().min(1).max(80),
  color: z.string().max(16).optional(),
});

export const removeMemberSchema = z.object({ userId: z.string().uuid() });
