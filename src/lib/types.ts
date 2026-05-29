export type DeptId = "SPR" | "PnP" | "PUB" | "LOGI" | "MM" | "TECH";

export type RoleId =
  | "director"
  | "vice_director"
  | "secretary"
  | "treasurer"
  | "dept_head"
  | "protocol"
  | "committee";

export type Permission =
  // nav (UI filtering)
  | "view:dashboard"
  | "view:events"
  | "view:tasks"
  | "view:timeline"
  | "view:org"
  | "view:team"
  | "view:sponsors"
  | "view:budget"
  | "view:invoices"
  | "view:approvals"
  | "view:reports"
  | "view:files"
  | "view:draw"
  | "view:registration"
  // profile / org
  | "profile.update"
  | "org.create"
  | "org.invite"
  | "org.assign_role"
  | "org.assign_dept"
  | "org.create_dept"
  | "org.remove_member"
  // Stage 2 — events & tasks
  | "event.create"
  | "event.update"
  | "event.archive"
  | "event.member.add"
  | "task.create"
  | "task.update"
  | "task.assign"
  | "task.comment"
  // Stage 4 — money
  | "sponsor.create"
  | "sponsor.log"
  | "sponsor.move_stage"
  | "budget.create"
  | "invoice.submit"
  | "invoice.approve"
  | "invoice.reject"
  | "payment.record"
  // Stage 5 — operations
  | "checkin.create"
  | "draw.run"
  | "inventory.move"
  | "file.link"
  | "file.grant"
  | "file.revoke"
  | "signature.request"
  | "signature.manage"
  // Stage 6 — intelligence
  | "signal.dismiss";

export interface Role {
  id: RoleId;
  label: string;
  color: string;
  permissions: ReadonlyArray<Permission>;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  role: RoleId;
  dept?: DeptId;
  email: string;
}

export interface Dept {
  id: DeptId;
  name: string;
  color: string;
}

export interface Event {
  id: string;
  code: string;
  name: string;
  status: "Planning" | "Live" | "Completed";
  daysLeft: number;
  venue: string;
  isCompetition?: boolean;
  budget: { total: number; committed: number };
  sponsorTarget: number;
  sponsorSecured: number;
  registrations: { current: number; target: number };
}

export interface Task {
  id: string;
  title: string;
  dept: DeptId;
  status: "Backlog" | "In Progress" | "Review" | "Done";
  owner: string;
  due: string;
}

export interface Approval {
  id: string;
  title: string;
  stage: string;
  final: boolean;
}

export interface Invoice {
  id: string;
  vendor: string;
  amount: number;
  status: "Pending" | "Approved" | "Paid";
}

export interface Claim {
  id: string;
  claimant: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
}
