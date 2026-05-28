import type { Permission, Role, RoleId } from "./types";

const ALL_PERMS: ReadonlyArray<Permission> = [
  "view:dashboard", "view:events", "view:tasks", "view:timeline",
  "view:org", "view:team", "view:sponsors", "view:budget",
  "view:invoices", "view:approvals", "view:reports", "view:files",
  "view:draw", "view:registration",
];

export const ROLES: Record<RoleId, Role> = {
  director: {
    id: "director", label: "Director", color: "#1d4ed8",
    permissions: ALL_PERMS,
  },
  vice_director: {
    id: "vice_director", label: "Vice Director", color: "#6b21a8",
    permissions: ALL_PERMS,
  },
  secretary: {
    id: "secretary", label: "Secretary", color: "#047857",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:approvals", "view:reports",
      "view:files", "view:registration",
    ],
  },
  treasurer: {
    id: "treasurer", label: "Treasurer", color: "#b25e00",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:sponsors", "view:budget",
      "view:invoices", "view:approvals", "view:reports", "view:files",
    ],
  },
  dept_head: {
    id: "dept_head", label: "Dept Head", color: "#075985",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:reports", "view:files",
      "view:draw", "view:registration",
    ],
  },
  protocol: {
    id: "protocol", label: "Protocol Team", color: "#be185d",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:org",
      "view:team", "view:files", "view:registration",
    ],
  },
  committee: {
    id: "committee", label: "Committee Member", color: "#6e6e73",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:files", "view:draw",
    ],
  },
};

export function hasPermission(role: Role, perm: Permission): boolean {
  return role.permissions.includes(perm);
}
