import type { Permission, Role, RoleId } from "./types";

const NAV_ALL: Permission[] = [
  "view:dashboard", "view:events", "view:tasks", "view:timeline",
  "view:org", "view:team", "view:sponsors", "view:budget",
  "view:invoices", "view:approvals", "view:reports", "view:files",
  "view:draw", "view:registration",
];

const EVENTS: Permission[] = [
  "event.create", "event.update", "event.archive", "event.member.add",
];
const TASKS: Permission[] = ["task.create", "task.update", "task.assign", "task.comment"];
const MONEY: Permission[] = [
  "sponsor.create", "sponsor.log", "sponsor.move_stage", "budget.create",
  "invoice.submit", "invoice.approve", "invoice.reject", "payment.record",
];
const OPS: Permission[] = [
  "checkin.create", "draw.run", "inventory.move",
  "file.link", "file.grant", "file.revoke",
  "signature.request", "signature.manage",
];
const ORG_ADMIN: Permission[] = [
  "org.create", "org.invite", "org.assign_role", "org.assign_dept",
  "org.create_dept", "org.remove_member",
];

const ALL: Permission[] = [
  ...NAV_ALL, "profile.update", ...ORG_ADMIN,
  ...EVENTS, ...TASKS, ...MONEY, ...OPS, "signal.dismiss",
];

export const ROLES: Record<RoleId, Role> = {
  director: {
    id: "director", label: "Director", color: "#1d4ed8",
    permissions: ALL,
  },
  vice_director: {
    id: "vice_director", label: "Vice Director", color: "#6b21a8",
    permissions: [
      ...NAV_ALL, "profile.update",
      "org.invite", "org.assign_dept",
      ...EVENTS, ...TASKS,
      "sponsor.create", "sponsor.log", "sponsor.move_stage",
      "budget.create", "invoice.submit",
      ...OPS, "signal.dismiss",
    ],
  },
  secretary: {
    id: "secretary", label: "Secretary", color: "#047857",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:approvals", "view:reports",
      "view:files", "view:registration", "view:draw",
      "profile.update",
      "task.create", "task.update", "task.assign", "task.comment",
      "event.member.add",
      "checkin.create", "draw.run",
      "file.link", "file.grant", "file.revoke",
      "signature.request", "signature.manage",
      "signal.dismiss",
    ],
  },
  treasurer: {
    id: "treasurer", label: "Treasurer", color: "#b25e00",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:sponsors", "view:budget",
      "view:invoices", "view:approvals", "view:reports", "view:files",
      "profile.update",
      "task.comment",
      "sponsor.create", "sponsor.log", "sponsor.move_stage",
      "budget.create", "invoice.submit", "invoice.approve",
      "invoice.reject", "payment.record",
      "signal.dismiss",
    ],
  },
  dept_head: {
    id: "dept_head", label: "Dept Head", color: "#075985",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:reports", "view:files",
      "view:draw", "view:registration", "view:budget", "view:sponsors",
      "profile.update",
      "task.create", "task.update", "task.assign", "task.comment",
      "sponsor.create", "sponsor.log",
      "invoice.submit", "file.link", "checkin.create", "inventory.move",
      "signal.dismiss",
    ],
  },
  protocol: {
    id: "protocol", label: "Protocol Team", color: "#be185d",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:org",
      "view:team", "view:files", "view:registration",
      "profile.update",
      "task.update", "task.comment", "checkin.create",
    ],
  },
  committee: {
    id: "committee", label: "Committee Member", color: "#6e6e73",
    permissions: [
      "view:dashboard", "view:events", "view:tasks", "view:timeline",
      "view:org", "view:team", "view:files", "view:draw",
      "profile.update", "task.comment",
    ],
  },
};

export function hasPermission(role: Role, perm: Permission): boolean {
  return role.permissions.includes(perm);
}
