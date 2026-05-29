import { AppError } from "@/lib/result";
import { ROLES } from "@/lib/roles";
import type { Permission, RoleId } from "@/lib/types";

export function requirePermission(roleId: RoleId, perm: Permission): void {
  const role = ROLES[roleId];
  if (!role.permissions.includes(perm)) {
    throw new AppError({
      code: "FORBIDDEN",
      message: `Missing permission: ${perm}`,
    });
  }
}
