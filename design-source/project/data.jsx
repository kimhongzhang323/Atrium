// data.jsx — Atrium platform data layer
// MYTECH 2026 is the "past" event we analyze; MYTECH 2027 is the live planning project.

const ICONS = {
  dashboard: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
  events: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6h12M5 2v3M11 2v3"/></svg>,
  tasks: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 4l1.5 1.5L7 3M3 8.5L4.5 10 7 7.5M3 13l1.5 1.5L7 12"/><path d="M9 4h5M9 8.5h5M9 13h5"/></svg>,
  timeline: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 4h7M2 8h10M2 12h5"/><circle cx="11" cy="4" r="1.4" fill="currentColor" stroke="none"/><circle cx="14" cy="8" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>,
  budget: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 7h12M5 10h2"/></svg>,
  invoices: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3.5 1.5h7L13 4v10.5l-2-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1V1.5z"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/></svg>,
  sponsors: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4.1L8 10.9l-3.7 1.9.7-4.1-3-2.9 4.1-.6L8 1.5z"/></svg>,
  team: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5.5" cy="6" r="2.2"/><path d="M1.5 13.5c.7-2.3 2.3-3.5 4-3.5s3.3 1.2 4 3.5"/><circle cx="11" cy="5.5" r="1.7"/><path d="M10.5 9.5c1.5 0 3 1 3.5 3"/></svg>,
  org: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="6" y="1.5" width="4" height="3" rx="0.5"/><rect x="1.5" y="11" width="4" height="3" rx="0.5"/><rect x="6" y="11" width="4" height="3" rx="0.5"/><rect x="10.5" y="11" width="4" height="3" rx="0.5"/><path d="M8 4.5v3M3.5 7.5h9v3.5M3.5 11V7.5M8 7.5V11M12.5 7.5V11"/></svg>,
  approvals: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2.5 8.5l3 3 8-8"/><path d="M2.5 3.5h6"/></svg>,
  reports: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 14V2h7l3 3v9H3z"/><path d="M10 2v3h3M5.5 8.5l2 2 3-3"/></svg>,
  files: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 4.5L4 2.5h3.5l1.5 2H14v8.5a1 1 0 01-1 1H3a1 1 0 01-1-1V4.5z"/></svg>,
  draw: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="1.5" width="13" height="13" rx="2.5"/><circle cx="5" cy="5" r="0.9" fill="currentColor"/><circle cx="11" cy="5" r="0.9" fill="currentColor"/><circle cx="8" cy="8" r="0.9" fill="currentColor"/><circle cx="5" cy="11" r="0.9" fill="currentColor"/><circle cx="11" cy="11" r="0.9" fill="currentColor"/></svg>,
  insights: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1.5a5 5 0 00-3 9V12h6v-1.5a5 5 0 00-3-9z"/><path d="M5.5 13.5h5M6.5 15h3"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3v10M3 8h10"/></svg>,
  search: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M11 11l3 3"/></svg>,
  bell: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1.5a3.5 3.5 0 00-3.5 3.5v3l-1 2.5h9l-1-2.5V5A3.5 3.5 0 008 1.5z"/><path d="M6.5 12.5a1.5 1.5 0 003 0"/></svg>,
  arrow: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>,
  chevDown: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6l5 5 5-5"/></svg>,
  filter: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h12l-4.5 6v4l-3 1.5V9L2 3z"/></svg>,
  more: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.5" cy="8" r="1.3"/></svg>,
  send: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8l10-5-3 12-2-5-5-2z"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  check: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l3.5 3.5L13 4.5"/></svg>,
  drive: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 1.5l-3.5 6 1.5 3h11l1.5-3-3.5-6h-7z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 1.5L3 7.5h10L11 1.5M3 7.5l3 6M13 7.5l-3 6" stroke="currentColor" strokeWidth="1.3"/></svg>,
};

// Departments — color-coded
const DEPTS = [
  { id: "SPR",  name: "Sponsorship & PR",      supervisor: "Director / Vice Director", color: "purple" },
  { id: "PnP",  name: "Program & Protocol",    supervisor: "Vice Director",            color: "info" },
  { id: "PUB",  name: "Publicity",             supervisor: "Vice Director",            color: "pink" },
  { id: "LOGI", name: "Logistics",             supervisor: "Treasurer",                color: "amber" },
  { id: "MM",   name: "Multimedia",            supervisor: "Vice Secretary",           color: "green" },
  { id: "TECH", name: "Technical",             supervisor: "Vice Treasurer",           color: "blue" },
];

const HIGH_COMM = [
  { role: "Director",          name: "Aisyah Rahman",   initials: "AR" },
  { role: "Vice Director",     name: "Daniel Tan",      initials: "DT" },
  { role: "Vice Director",     name: "Mei Lin Wong",    initials: "MW" },
  { role: "Secretary",         name: "Faris Hakim",     initials: "FH" },
  { role: "Vice Secretary",    name: "Priya Suresh",    initials: "PS" },
  { role: "Treasurer",         name: "Jia Hui Chong",   initials: "JC" },
  { role: "Vice Treasurer",    name: "Arman Ismail",    initials: "AI" },
];

// Department leads (Head + Vice Head)
const DEPT_LEADS = {
  SPR:  [ { name: "Nurul Izzati", role: "Head",      init: "NI" }, { name: "Kelvin Lim",    role: "Vice Head", init: "KL" } ],
  PnP:  [ { name: "Sara Yusof",   role: "Head",      init: "SY" }, { name: "Hafiz Idris",   role: "Vice Head", init: "HI" } ],
  PUB:  [ { name: "Tan Wei Jie",  role: "Head",      init: "TW" }, { name: "Iman Nadia",    role: "Vice Head", init: "IN" } ],
  LOGI: [ { name: "Rajesh Kumar", role: "Head",      init: "RK" }, { name: "Aaron Goh",     role: "Vice Head", init: "AG" } ],
  MM:   [ { name: "Lee Sze Min",  role: "Head",      init: "LM" }, { name: "Yusra Halim",   role: "Vice Head", init: "YH" } ],
  TECH: [ { name: "Daniyal Putra",role: "Head",      init: "DP" }, { name: "Chong Mei Yi",  role: "Vice Head", init: "CY" } ],
};

const ALL_MEMBERS = [
  // High Committee
  { id: "u1",  name: "Aisyah Rahman",   role: "Director",            dept: "HC",  initials: "AR", year: 3, perf: 94, tasks: 28, done: 26, hours: 142 },
  { id: "u2",  name: "Daniel Tan",      role: "Vice Director",       dept: "HC",  initials: "DT", year: 3, perf: 91, tasks: 24, done: 22, hours: 128 },
  { id: "u3",  name: "Mei Lin Wong",    role: "Vice Director",       dept: "HC",  initials: "MW", year: 3, perf: 89, tasks: 22, done: 20, hours: 124 },
  { id: "u4",  name: "Faris Hakim",     role: "Secretary",           dept: "HC",  initials: "FH", year: 2, perf: 88, tasks: 30, done: 27, hours: 110 },
  { id: "u5",  name: "Priya Suresh",    role: "Vice Secretary",      dept: "HC",  initials: "PS", year: 2, perf: 84, tasks: 26, done: 22, hours: 98  },
  { id: "u6",  name: "Jia Hui Chong",   role: "Treasurer",           dept: "HC",  initials: "JC", year: 3, perf: 93, tasks: 32, done: 30, hours: 138 },
  { id: "u7",  name: "Arman Ismail",    role: "Vice Treasurer",      dept: "HC",  initials: "AI", year: 2, perf: 86, tasks: 25, done: 22, hours: 104 },

  // Department Heads + Vice Heads + members
  { id: "u10", name: "Nurul Izzati",    role: "Head, SPR",           dept: "SPR", initials: "NI", year: 3, perf: 92, tasks: 36, done: 34, hours: 156 },
  { id: "u11", name: "Kelvin Lim",      role: "Vice Head, SPR",      dept: "SPR", initials: "KL", year: 2, perf: 87, tasks: 30, done: 27, hours: 128 },
  { id: "u12", name: "Sasha Mehta",     role: "Sponsorship Exec",    dept: "SPR", initials: "SM", year: 2, perf: 81, tasks: 22, done: 19, hours: 88  },
  { id: "u13", name: "Liyana Khairul",  role: "Sponsorship Exec",    dept: "SPR", initials: "LK", year: 1, perf: 76, tasks: 18, done: 14, hours: 64  },

  { id: "u20", name: "Sara Yusof",      role: "Head, PnP",           dept: "PnP", initials: "SY", year: 3, perf: 90, tasks: 40, done: 37, hours: 162 },
  { id: "u21", name: "Hafiz Idris",     role: "Vice Head, PnP",      dept: "PnP", initials: "HI", year: 2, perf: 85, tasks: 32, done: 28, hours: 124 },
  { id: "u22", name: "Joel Cheong",     role: "Program Exec",        dept: "PnP", initials: "JC", year: 2, perf: 79, tasks: 24, done: 20, hours: 92  },
  { id: "u23", name: "Aina Sufiya",     role: "Registration Lead",   dept: "PnP", initials: "AS", year: 2, perf: 83, tasks: 26, done: 24, hours: 102 },

  { id: "u30", name: "Tan Wei Jie",     role: "Head, PUB",           dept: "PUB", initials: "TW", year: 3, perf: 88, tasks: 34, done: 32, hours: 144 },
  { id: "u31", name: "Iman Nadia",      role: "Vice Head, PUB",      dept: "PUB", initials: "IN", year: 2, perf: 82, tasks: 28, done: 24, hours: 116 },
  { id: "u32", name: "Aldrin Tay",      role: "Social Media",        dept: "PUB", initials: "AT", year: 1, perf: 74, tasks: 20, done: 15, hours: 72  },

  { id: "u40", name: "Rajesh Kumar",    role: "Head, LOGI",          dept: "LOGI",initials: "RK", year: 3, perf: 86, tasks: 38, done: 35, hours: 150 },
  { id: "u41", name: "Aaron Goh",       role: "Vice Head, LOGI",     dept: "LOGI",initials: "AG", year: 2, perf: 80, tasks: 30, done: 26, hours: 118 },
  { id: "u42", name: "Hasif Razi",      role: "Procurement",         dept: "LOGI",initials: "HR", year: 2, perf: 77, tasks: 24, done: 19, hours: 96  },

  { id: "u50", name: "Lee Sze Min",     role: "Head, MM",            dept: "MM",  initials: "LM", year: 3, perf: 95, tasks: 42, done: 40, hours: 178 },
  { id: "u51", name: "Yusra Halim",     role: "Vice Head, MM",       dept: "MM",  initials: "YH", year: 2, perf: 89, tasks: 36, done: 32, hours: 142 },
  { id: "u52", name: "Adam Chia",       role: "Photographer",        dept: "MM",  initials: "AC", year: 2, perf: 82, tasks: 26, done: 23, hours: 108 },

  { id: "u60", name: "Daniyal Putra",   role: "Head, TECH",          dept: "TECH",initials: "DP", year: 3, perf: 91, tasks: 38, done: 36, hours: 162 },
  { id: "u61", name: "Chong Mei Yi",    role: "Vice Head, TECH",     dept: "TECH",initials: "CY", year: 2, perf: 87, tasks: 32, done: 30, hours: 138 },
  { id: "u62", name: "Vinod Krishnan",  role: "Web Developer",       dept: "TECH",initials: "VK", year: 2, perf: 84, tasks: 28, done: 25, hours: 124 },
  { id: "u63", name: "Sarah Quek",      role: "AV / IT Support",     dept: "TECH",initials: "SQ", year: 1, perf: 72, tasks: 20, done: 14, hours: 68  },
];

// Events: MYTECH career fairs + Code Sprint competition
const EVENTS = [
  {
    id: "code-sprint-2027",
    code: "CODE SPRINT 2027",
    name: "FCSIT Code Sprint 2027",
    venue: "DKU3 + Online, Universiti Malaya",
    type: "Competition",
    days: 2,
    startDate: "2027-02-13",
    endDate: "2027-02-14",
    status: "Registration Open",
    statusKind: "info",
    progress: 54,
    daysLeft: 68,
    budget: { total: 24000, committed: 14200, spent: 6800, currency: "RM" },
    sponsorTarget: 18000,
    sponsorSecured: 11500,
    registrations: { target: 200, current: 142, teams: 38 },
    cover: "CS",
    isCompetition: true,
  },
  {
    id: "mytech-2027",
    code: "MYTECH 2027",
    name: "MYTECH Career Fair 2027",
    venue: "FCSIT, Universiti Malaya",
    type: "Career Fair",
    days: 3,
    startDate: "2027-03-09",
    endDate: "2027-03-11",
    status: "Planning",
    statusKind: "info",
    progress: 38,
    daysLeft: 92,
    budget: { total: 78000, committed: 42500, spent: 18200, currency: "RM" },
    sponsorTarget: 45000,
    sponsorSecured: 18500,
    registrations: { target: 1800, current: 412 },
    cover: "M27",
  },
  {
    id: "mytech-2026",
    code: "MYTECH 2026",
    name: "MYTECH Career Fair 2026",
    venue: "FCSIT, Universiti Malaya",
    type: "Career Fair",
    days: 3,
    startDate: "2026-03-10",
    endDate: "2026-03-12",
    status: "Completed",
    statusKind: "neutral",
    progress: 100,
    daysLeft: -71,
    budget: { total: 68000, committed: 68000, spent: 71240, currency: "RM" },
    sponsorTarget: 40000,
    sponsorSecured: 38200,
    registrations: { target: 1500, current: 1684 },
    cover: "M26",
  },
];

// Sponsors (for MYTECH 2027)
const SPONSORS = [
  { id: "sp1",  name: "Maybank",          tier: "Platinum", amount: 25000, status: "Signed",       contact: "Alia Rosli",       owner: "NI" },
  { id: "sp2",  name: "Petronas",         tier: "Platinum", amount: 22000, status: "Negotiating",  contact: "Encik Hadi",        owner: "NI" },
  { id: "sp3",  name: "TM ONE",           tier: "Gold",     amount: 12000, status: "Signed",       contact: "Daphne Yew",        owner: "KL" },
  { id: "sp4",  name: "GXBank",           tier: "Gold",     amount: 12000, status: "Proposal Sent",contact: "Marcus Tan",        owner: "KL" },
  { id: "sp5",  name: "Shopee",           tier: "Silver",   amount:  7500, status: "Signed",       contact: "Lim Wei",           owner: "SM" },
  { id: "sp6",  name: "Grab",             tier: "Silver",   amount:  7500, status: "Negotiating",  contact: "Adlin Hashim",      owner: "SM" },
  { id: "sp7",  name: "Accenture",        tier: "Silver",   amount:  6000, status: "Cold",         contact: "Vikram Singh",      owner: "LK" },
  { id: "sp8",  name: "AirAsia",          tier: "Booth",    amount:  3500, status: "Signed",       contact: "Faiz Anuar",        owner: "SM" },
  { id: "sp9",  name: "Carsome",          tier: "Booth",    amount:  3500, status: "Proposal Sent",contact: "Jia Wen",           owner: "LK" },
  { id: "sp10", name: "iflix / IOI",      tier: "Booth",    amount:  3500, status: "Declined",     contact: "Ravi K.",           owner: "LK" },
];

// Tasks (kanban) for MYTECH 2027
const TASKS = [
  { id:"t1",  title:"Finalize Platinum sponsor deck v3",            dept:"SPR",  assignee:"NI", priority:"High",   due:"Dec 10", status:"Doing" },
  { id:"t2",  title:"Submit Sponsor MOU to UM Legal",                dept:"SPR",  assignee:"KL", priority:"High",   due:"Dec 15", status:"Backlog" },
  { id:"t3",  title:"Pitch Maybank — 2nd meeting",                   dept:"SPR",  assignee:"NI", priority:"High",   due:"Dec 04", status:"Done" },
  { id:"t4",  title:"Compile sponsor lead list — 60 targets",        dept:"SPR",  assignee:"SM", priority:"Med",    due:"Dec 02", status:"Done" },

  { id:"t10", title:"Ceremony flow draft (Day 1 opening)",           dept:"PnP",  assignee:"SY", priority:"High",   due:"Dec 18", status:"Doing" },
  { id:"t11", title:"Speaker shortlist — Industry Talk",             dept:"PnP",  assignee:"HI", priority:"High",   due:"Dec 12", status:"Doing" },
  { id:"t12", title:"Build registration form (Google Forms → Sheets)",dept:"PnP", assignee:"AS", priority:"Med",    due:"Nov 30", status:"Done" },
  { id:"t13", title:"Lucky draw mechanics & prizes",                  dept:"PnP", assignee:"JC", priority:"Low",    due:"Jan 20", status:"Backlog" },

  { id:"t20", title:"Social media content calendar (Jan–Mar)",       dept:"PUB",  assignee:"TW", priority:"High",   due:"Dec 20", status:"Doing" },
  { id:"t21", title:"Media kit + press release draft",                dept:"PUB",  assignee:"IN", priority:"Med",    due:"Jan 10", status:"Backlog" },
  { id:"t22", title:"Brand toolkit approval (UM Branding)",           dept:"PUB",  assignee:"TW", priority:"High",   due:"Dec 08", status:"Review" },

  { id:"t30", title:"FCSIT Atrium floor map v2",                      dept:"LOGI", assignee:"RK", priority:"High",   due:"Dec 22", status:"Doing" },
  { id:"t31", title:"Equipment market survey (PA, projector, light)", dept:"LOGI", assignee:"HR", priority:"Med",    due:"Dec 15", status:"Doing" },
  { id:"t32", title:"UMPoint venue booking — final 3 days",           dept:"LOGI", assignee:"RK", priority:"High",   due:"Dec 02", status:"Done" },

  { id:"t40", title:"Final logo & theme — '2027: Connect Forward'",   dept:"MM",   assignee:"LM", priority:"High",   due:"Dec 12", status:"Review" },
  { id:"t41", title:"Sponsor pack visuals v2",                        dept:"MM",   assignee:"YH", priority:"High",   due:"Dec 09", status:"Doing" },
  { id:"t42", title:"Merchandise mockups (T-shirt, lanyard)",         dept:"MM",   assignee:"LM", priority:"Med",    due:"Jan 05", status:"Backlog" },

  { id:"t50", title:"Event website MVP — registration + schedule",    dept:"TECH", assignee:"DP", priority:"High",   due:"Jan 15", status:"Doing" },
  { id:"t51", title:"PA system spec & vendor quotes",                 dept:"TECH", assignee:"CY", priority:"Med",    due:"Dec 18", status:"Doing" },
  { id:"t52", title:"Wi-Fi capacity check with UM IT",                dept:"TECH", assignee:"VK", priority:"Low",    due:"Jan 25", status:"Backlog" },
];

// Approvals workflow
const APPROVALS = [
  { id:"a1", title:"Event Proposal — MYTECH 2027",         submitted:"Nov 10", stage: 3, kind: "Major event" },
  { id:"a2", title:"Sponsor MOU — Maybank (RM 25,000)",    submitted:"Nov 28", stage: 2, kind: "Sponsorship" },
  { id:"a3", title:"Publicity Pack v1 — Brand Approval",   submitted:"Dec 01", stage: 1, kind: "Publicity" },
  { id:"a4", title:"UMPoint Venue Booking — DKU3 + Atrium",submitted:"Nov 20", stage: 4, kind: "Venue", final: true },
];

const APPROVAL_STAGES = [
  { name: "Department Head",        desc: "Internal sign-off" },
  { name: "Faculty (FCSIT)",        desc: "Deputy Dean — Student Affairs" },
  { name: "HEP",                    desc: "Bahagian Hal Ehwal Pelajar" },
  { name: "UM Central",             desc: "Required for VIPs / income-generating" },
];

// Invoices / claims
const INVOICES = [
  { id: "INV-104", vendor: "SoundTech Sdn Bhd",    desc: "PA system rental deposit",  amount: 3200,  status: "Paid",     dept: "LOGI", due: "Nov 28" },
  { id: "INV-105", vendor: "PrintLab",             desc: "Sponsor proposal printing", amount:  680,  status: "Paid",     dept: "MM",   due: "Nov 30" },
  { id: "INV-106", vendor: "CafeKL Catering",      desc: "Committee meeting refresh", amount:  420,  status: "Pending",  dept: "PnP",  due: "Dec 10" },
  { id: "INV-107", vendor: "Universiti Malaya FM", desc: "Atrium booking — final",    amount: 5400,  status: "Approved", dept: "LOGI", due: "Dec 18" },
  { id: "INV-108", vendor: "Canva Pro (annual)",   desc: "Design suite — committee",  amount:  580,  status: "Pending",  dept: "MM",   due: "Dec 22" },
];
const CLAIMS = [
  { id: "CL-44", name: "Nurul Izzati",  desc: "Sponsor meeting — Grab HQ, parking + Grab", amount: 78,   status: "Approved", dept: "SPR", date: "Nov 22" },
  { id: "CL-45", name: "Rajesh Kumar",  desc: "Survey trip to AV vendor warehouse",        amount: 134,  status: "Pending",  dept: "LOGI",date: "Nov 26" },
  { id: "CL-46", name: "Lee Sze Min",   desc: "Stock photography license (1mo)",            amount: 89,   status: "Approved", dept: "MM",  date: "Nov 28" },
  { id: "CL-47", name: "Daniyal Putra", desc: "Domain + hosting (12mo)",                    amount: 220,  status: "Pending",  dept: "TECH",date: "Dec 02" },
];

// Suggested timeline for a "Career Fair" template — used by AI advisor
const TIMELINE_TEMPLATE = [
  // weeks-out from event start
  { phase: "Foundation",  weeks: "T-18 to T-14", tasks: ["Form committee", "Approve theme & budget skeleton", "Submit Event Proposal to faculty", "Pre-book UMPoint venue"] },
  { phase: "Acquisition", weeks: "T-14 to T-9",  tasks: ["Sponsor target list (60+)", "Sponsor deck v1", "Outreach wave 1 — Platinum tier", "Brand toolkit submission"] },
  { phase: "Build",       weeks: "T-9 to T-5",   tasks: ["Confirm 70% sponsors", "Floor plan v2", "Event website MVP", "Registration opens", "Press release draft"] },
  { phase: "Push",        weeks: "T-5 to T-2",   tasks: ["Publicity wave 2", "Speaker confirmations", "Final equipment procurement", "Volunteer briefing"] },
  { phase: "Execute",     weeks: "T-2 to T-0",   tasks: ["Rehearsal (T-1 day)", "On-site setup", "Live event days", "Lucky draws & engagement"] },
  { phase: "Close",       weeks: "T+0 to T+4",   tasks: ["Financial reconciliation", "Sponsor thank-you & deliverables", "Post-mortem & SWOT", "Final report to faculty"] },
];

// SWOT for MYTECH 2026 (the past event we analyze)
const SWOT_2026 = {
  S: [
    { t: "Sponsorship overachieved", d: "Secured RM 38.2k against RM 30k target — strong relationships with Maybank, TM, Shopee." },
    { t: "Registration exceeded target", d: "1,684 participants vs 1,500 target (+12%). Day 2 saw 720 walk-ins." },
    { t: "On-time UM Central approval", d: "Submitted 12 weeks ahead — zero last-minute approval scrambles." },
    { t: "Strong MM identity", d: "'Forward Together' brand reused across 14 collaterals. Logo memorability survey: 78% (HoD)." },
  ],
  W: [
    { t: "Budget overrun: 4.8%", d: "RM 71.2k spent vs RM 68k approved. Driven by last-minute AV rental upgrade (+RM 3,200)." },
    { t: "PA system failure on Day 1", d: "20-min outage during opening ceremony. Vendor lacked redundancy." },
    { t: "PUB content cadence dropped pre-event", d: "Only 4 posts in week T-2, vs target of 9. Engagement dipped 32%." },
    { t: "Registration database fragmented", d: "Google Sheets across 3 owners caused 47 duplicate entries." },
  ],
  O: [
    { t: "Industry talk pipeline", d: "5 sponsors expressed interest in standalone speaker sessions for 2027." },
    { t: "Cross-faculty expansion", d: "Engineering & Business faculties asked to co-host (potential +800 attendees)." },
    { t: "Alumni network underused", d: "Only 12 alumni invited. Database has 4,200+ active CS alumni." },
    { t: "Government-linked sponsors", d: "MDEC & MoSTI grants for tech career events go unclaimed by student bodies." },
  ],
  T: [
    { t: "Sponsor budget compression in 2027", d: "3 of top 10 sponsors flagged tightening tech-event budgets." },
    { t: "Competing events", d: "PIKOM PC Fair runs same weekend in 2027 — could fragment student attention." },
    { t: "Venue uncertainty", d: "FCSIT Atrium renovation rumored Q1 2027. Need backup venue locked early." },
    { t: "Volunteer attrition", d: "Year-2 students show 28% drop-off after exam period — historically worst gap." },
  ],
};

// AI Insights — quiet sidebar recommendations
const INSIGHTS = [
  {
    kind: "RISK",
    title: "Sponsor secured: 41% vs benchmark 65%",
    body: "At T-13 weeks, MYTECH 2026 had secured 65% of sponsor target. You're at 41% (RM 18.5k / RM 45k). Recommend escalating 4 stalled Platinum/Gold deals this week.",
    actions: ["See stalled deals", "Draft escalation email"],
  },
  {
    kind: "OPPORTUNITY",
    title: "MDEC career-event grant window open",
    body: "Based on 2026 SWOT note, government-linked grants were unclaimed. MDEC has RM 8k–15k available for tech career fairs — application closes Jan 10.",
    actions: ["Open grant brief"],
  },
  {
    kind: "TIMELINE",
    title: "Brand Toolkit approval is late",
    body: "Publicity materials cannot publish until UM Brand Toolkit approval clears. Last year this took 12 days. Submitting today gives you 6 days of buffer.",
    actions: ["Open approval", "Notify @TW"],
  },
  {
    kind: "PATTERN",
    title: "Week T-2 content drop predicted",
    body: "Your 2026 post-mortem flagged a content cadence drop at T-2. Schedule 9 posts now using the calendar template to avoid recurrence.",
    actions: ["Open calendar"],
  },
];

// Today is approximated as Dec 6, 2026 for the demo
const TODAY = "Dec 06, 2026";

Object.assign(window, {
  ICONS, DEPTS, HIGH_COMM, DEPT_LEADS, ALL_MEMBERS,
  EVENTS, SPONSORS, TASKS, APPROVALS, APPROVAL_STAGES,
  INVOICES, CLAIMS, TIMELINE_TEMPLATE, SWOT_2026, INSIGHTS, TODAY
});
