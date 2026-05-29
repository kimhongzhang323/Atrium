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
  | "profile.update"
  | "org.invite"
  | "org.assign_role";

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
