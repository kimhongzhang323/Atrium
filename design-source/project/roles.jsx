// roles.jsx — Role-based access control

// Permission model:
// Each role has a set of permissions covering features (views) and abilities.
// "view:X" — can see view X in nav and access it
// "edit:X" — can edit data in X
// "approve:X" — can approve items in X
// "admin"  — superuser

const ROLES = {
  director: {
    id: "director",
    label: "Director",
    desc: "Full access · final approver",
    color: "var(--text)",
    permissions: "*", // wildcard
  },
  vice_director: {
    id: "vice_director",
    label: "Vice Director",
    desc: "Supervises departments · approves day-to-day",
    color: "var(--info)",
    permissions: [
      "view:dashboard","view:events","view:tasks","view:timeline","view:org","view:team",
      "view:sponsors","view:budget","view:invoices","view:approvals","view:reports","view:files","view:draw","view:registration",
      "edit:tasks","edit:timeline","edit:sponsors","approve:tasks","approve:approvals",
      "files:read:internal","files:read:public",
    ],
  },
  secretary: {
    id: "secretary",
    label: "Secretary",
    desc: "Documentation · meeting minutes · approvals tracking",
    color: "var(--purple)",
    permissions: [
      "view:dashboard","view:events","view:tasks","view:timeline","view:org","view:team",
      "view:approvals","view:reports","view:files","view:registration",
      "edit:files","edit:approvals",
      "files:read:internal","files:read:public",
    ],
  },
  treasurer: {
    id: "treasurer",
    label: "Treasurer",
    desc: "Budget · invoices · claims · approves spend",
    color: "var(--success)",
    permissions: [
      "view:dashboard","view:events","view:budget","view:invoices","view:approvals","view:reports","view:files","view:team",
      "edit:budget","edit:invoices","approve:invoices","approve:claims",
      "files:read:finance","files:read:internal","files:read:public",
    ],
  },
  dept_head: {
    id: "dept_head",
    label: "Department Head",
    desc: "Owns one department · creates and assigns tasks",
    color: "var(--warn)",
    permissions: [
      "view:dashboard","view:events","view:tasks","view:timeline","view:org","view:team",
      "view:files","view:registration",
      "edit:tasks","edit:timeline","approve:tasks",
      "files:read:internal","files:read:public","files:read:own-dept",
    ],
  },
  protocol_team: {
    id: "protocol_team",
    label: "Protocol Team (Competition)",
    desc: "Trusted contest jury · access to confidential contest files",
    color: "var(--danger)",
    permissions: [
      "view:dashboard","view:events","view:tasks","view:registration","view:files",
      "files:read:internal","files:read:public","files:read:confidential","files:read:protocol",
      "edit:registration","approve:registration",
    ],
  },
  committee: {
    id: "committee",
    label: "Committee Member",
    desc: "General member · executes assigned tasks",
    color: "var(--text-secondary)",
    permissions: [
      "view:dashboard","view:events","view:tasks","view:timeline","view:org","view:team","view:files","view:registration",
      "edit:tasks-own",
      "files:read:public","files:read:own-dept",
    ],
  },
};

function hasPermission(role, perm) {
  if (!role) return false;
  if (role.permissions === "*") return true;
  if (role.permissions.includes(perm)) return true;
  return false;
}

function fileAccessLevels() {
  return [
    { id: "public",       label: "Public",        desc: "Anyone in the committee can view" },
    { id: "internal",     label: "Internal",      desc: "Committee members + supervisors" },
    { id: "own-dept",     label: "Department-only", desc: "Members of the owning department only" },
    { id: "finance",      label: "Finance-only",  desc: "Treasurer + Director only" },
    { id: "confidential", label: "Confidential",  desc: "Director + Protocol Team only" },
    { id: "protocol",     label: "Protocol-locked", desc: "Contest Protocol Team only — sealed" },
  ];
}

// Each user has a role + (optional) dept and protocol membership
const USERS = {
  aisyah:  { id: "aisyah",  name: "Aisyah Rahman",   initials: "AR", role: "director",      dept: "HC",  email: "aisyah@um.edu.my",  protocol: true },
  daniel:  { id: "daniel",  name: "Daniel Tan",      initials: "DT", role: "vice_director", dept: "HC",  email: "daniel@um.edu.my",  protocol: false },
  jia:     { id: "jia",     name: "Jia Hui Chong",   initials: "JC", role: "treasurer",     dept: "HC",  email: "jiahui@um.edu.my",  protocol: false },
  faris:   { id: "faris",   name: "Faris Hakim",     initials: "FH", role: "secretary",     dept: "HC",  email: "faris@um.edu.my",   protocol: true },
  sara:    { id: "sara",    name: "Sara Yusof",      initials: "SY", role: "dept_head",     dept: "PnP", email: "sara@um.edu.my",    protocol: true },
  nurul:   { id: "nurul",   name: "Nurul Izzati",    initials: "NI", role: "dept_head",     dept: "SPR", email: "nurul@um.edu.my",   protocol: false },
  liyana:  { id: "liyana",  name: "Liyana Khairul",  initials: "LK", role: "committee",     dept: "SPR", email: "liyana@um.edu.my",  protocol: false },
};

// Map dept id -> default role for that dept (used for icons)
const ROLE_BADGES = {
  director: "Director",
  vice_director: "Vice Director",
  secretary: "Secretary",
  treasurer: "Treasurer",
  dept_head: "Dept Head",
  protocol_team: "Protocol",
  committee: "Member",
};

Object.assign(window, { ROLES, USERS, hasPermission, fileAccessLevels, ROLE_BADGES });
