import type { Approval, Claim, Dept, Event, Invoice, Task, User } from "./types";

export const TODAY = "Thu, 28 May 2026";

export const DEPTS: ReadonlyArray<Dept> = [
  { id: "SPR",  name: "Sponsorship",          color: "#6b21a8" },
  { id: "PnP",  name: "Program & Protocol",   color: "#1d4ed8" },
  { id: "PUB",  name: "Publicity",            color: "#be185d" },
  { id: "LOGI", name: "Logistics",            color: "#b25e00" },
  { id: "MM",   name: "Multimedia",           color: "#047857" },
  { id: "TECH", name: "Tech",                 color: "#075985" },
];

export const USERS: Record<string, User> = {
  aisyah:    { id: "aisyah",    name: "Aisyah Rahman",  initials: "AR", role: "director",     email: "aisyah@um.edu.my" },
  daniyal:   { id: "daniyal",   name: "Daniyal Putra",  initials: "DP", role: "vice_director", email: "daniyal@um.edu.my" },
  syafiqah:  { id: "syafiqah",  name: "Syafiqah Halim", initials: "SH", role: "secretary",    email: "syafiqah@um.edu.my" },
  hafiz:     { id: "hafiz",     name: "Hafiz Idris",    initials: "HI", role: "treasurer",    email: "hafiz@um.edu.my" },
  rajesh:    { id: "rajesh",    name: "Rajesh Kumar",   initials: "RK", role: "dept_head",    dept: "LOGI", email: "rajesh@um.edu.my" },
  nurul:     { id: "nurul",     name: "Nurul Izzati",   initials: "NI", role: "dept_head",    dept: "SPR",  email: "nurul@um.edu.my" },
  liyana:    { id: "liyana",    name: "Liyana Tan",     initials: "LT", role: "committee",    email: "liyana@um.edu.my" },
};

export const EVENTS: ReadonlyArray<Event> = [
  {
    id: "mytech-2027",
    code: "MT27",
    name: "MYTECH 2027",
    status: "Planning",
    daysLeft: 92,
    venue: "Atrium, FCSIT · Universiti Malaya",
    budget: { total: 180_000, committed: 76_500 },
    sponsorTarget: 120_000, sponsorSecured: 78_500,
    registrations: { current: 412, target: 1200 },
  },
  {
    id: "mytech-2026",
    code: "MT26",
    name: "MYTECH 2026",
    status: "Completed",
    daysLeft: 0,
    venue: "Atrium, FCSIT · Universiti Malaya",
    budget: { total: 165_000, committed: 162_300 },
    sponsorTarget: 100_000, sponsorSecured: 92_400,
    registrations: { current: 980, target: 900 },
  },
  {
    id: "code-sprint-2027",
    code: "CS27",
    name: "Code Sprint 2027",
    status: "Planning",
    daysLeft: 48,
    venue: "DK 1-5 · FCSIT",
    isCompetition: true,
    budget: { total: 24_000, committed: 9_200 },
    sponsorTarget: 18_000, sponsorSecured: 12_500,
    registrations: { current: 87, target: 160 },
  },
];

export const TASKS: ReadonlyArray<Task> = [
  { id: "t1", title: "Sign Maybank platinum MOU",        dept: "SPR",  status: "Done",        owner: "NI", due: "2026-05-22" },
  { id: "t2", title: "Draft MDEC grant application",     dept: "SPR",  status: "In Progress", owner: "NI", due: "2026-06-12" },
  { id: "t3", title: "Submit brand toolkit for approval", dept: "PUB", status: "Review",      owner: "LM", due: "2026-06-04" },
  { id: "t4", title: "Lock in venue floor plan v2",      dept: "LOGI", status: "Done",        owner: "RK", due: "2026-05-18" },
  { id: "t5", title: "Recruit 40 volunteers",            dept: "LOGI", status: "Backlog",     owner: "RK", due: "2026-06-30" },
  { id: "t6", title: "Ship website MVP to staging",      dept: "TECH", status: "Done",        owner: "DP", due: "2026-05-20" },
  { id: "t7", title: "Build registration API",           dept: "TECH", status: "In Progress", owner: "DP", due: "2026-06-08" },
  { id: "t8", title: "Speaker package design",           dept: "PnP",  status: "In Progress", owner: "AH", due: "2026-06-15" },
  { id: "t9", title: "Hype reel storyboard",             dept: "MM",   status: "Backlog",     owner: "LM", due: "2026-06-20" },
];

export const APPROVALS: ReadonlyArray<Approval> = [
  { id: "a1", title: "Brand Toolkit",        stage: "Faculty",  final: false },
  { id: "a2", title: "Maybank MOU",          stage: "Legal",    final: false },
  { id: "a3", title: "Venue booking 2027",   stage: "HEP",      final: true  },
  { id: "a4", title: "MDEC grant",           stage: "Central",  final: false },
];

export const INVOICES: ReadonlyArray<Invoice> = [
  { id: "INV-104", vendor: "ProSound Sdn Bhd",     amount: 12_400, status: "Pending"  },
  { id: "INV-105", vendor: "Atlas Catering",       amount:  8_900, status: "Approved" },
  { id: "INV-106", vendor: "PixelPrint",           amount:  3_200, status: "Paid"     },
];

export const CLAIMS: ReadonlyArray<Claim> = [
  { id: "CL-021", claimant: "Rajesh Kumar", amount:   240, status: "Pending"  },
  { id: "CL-022", claimant: "Daniyal Putra", amount:  120, status: "Approved" },
];
