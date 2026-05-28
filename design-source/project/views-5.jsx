// views-5.jsx — Registration (competition), Profile, Role switcher

// ============ COMPETITION REGISTRATION ============
const REGISTRATIONS = [
  { id: "T001", team: "Null Pointer Exception", lead: "Aliya Hassan",   members: 4, year: 3, track: "AI / ML",       status: "Confirmed",  paid: true,  submitted: "Nov 18", score: 92, project: "Real-time medical NER for Bahasa Malaysia" },
  { id: "T002", team: "Segfault Sisters",       lead: "Cheryl Yap",     members: 4, year: 2, track: "Open Innovation",status: "Confirmed", paid: true,  submitted: "Nov 19", score: 88, project: "Marketplace for local fishermen — supply tracking" },
  { id: "T003", team: "Heap Overflow",          lead: "Bryan Chong",    members: 3, year: 3, track: "Cybersecurity", status: "Confirmed",  paid: true,  submitted: "Nov 20", score: 86, project: "Phishing detector for Malay-language SMS" },
  { id: "T004", team: "Recursive Cats",         lead: "Daniel Iskandar",members: 4, year: 4, track: "AI / ML",       status: "Confirmed",  paid: true,  submitted: "Nov 21", score: 90, project: "Vision model for batik pattern classification" },
  { id: "T005", team: "404 Brain Not Found",    lead: "Erin Lai",       members: 4, year: 2, track: "Open Innovation",status: "Confirmed", paid: true,  submitted: "Nov 22", score: 78, project: "MRT route optimizer for KL commuters" },
  { id: "T006", team: "Sudo Make Sandwich",     lead: "Faruq Razali",   members: 4, year: 3, track: "Cybersecurity", status: "Waitlist",   paid: false, submitted: "Nov 23", score: 0,  project: "Hardware key vault using NFC" },
  { id: "T007", team: "Stack Smashers",         lead: "Grace Tan",      members: 3, year: 2, track: "AI / ML",       status: "Confirmed",  paid: true,  submitted: "Nov 24", score: 81, project: "Voice cloning detection for fraud calls" },
  { id: "T008", team: "Kernel Panic",           lead: "Hisham Adli",    members: 4, year: 4, track: "Open Innovation",status: "Pending",   paid: false, submitted: "Nov 25", score: 0,  project: "Carbon footprint tracker for student events" },
  { id: "T009", team: "Race Condition",         lead: "Ivy Soong",      members: 4, year: 3, track: "AI / ML",       status: "Confirmed",  paid: true,  submitted: "Nov 26", score: 84, project: "LLM-powered exam revision tutor — Year 1 CS" },
  { id: "T010", team: "Yes Code No Sleep",      lead: "Jordan Lim",     members: 4, year: 2, track: "Open Innovation",status: "Confirmed", paid: true,  submitted: "Nov 27", score: 76, project: "Auto-attendance via campus WiFi MAC scan" },
];

function RegistrationView({ currentUser }) {
  const [tab, setTab] = useState("teams");
  const ev = EVENTS.find(e => e.isCompetition);
  const canSeeJuryNotes = hasPermission(ROLES[currentUser.role], "files:read:protocol") || currentUser.protocol;

  const confirmed = REGISTRATIONS.filter(r => r.status === "Confirmed").length;
  const waitlist  = REGISTRATIONS.filter(r => r.status === "Waitlist").length;
  const pending   = REGISTRATIONS.filter(r => r.status === "Pending").length;
  const teamsBy = (track) => REGISTRATIONS.filter(r => r.track === track).length;

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">{ev.code} · COMPETITION</div>
          <h1 className="view-title">Registration</h1>
          <p className="view-subtitle">{ev.registrations.current} participants across {ev.registrations.teams} teams · {ev.daysLeft} days to event</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn">Export CSV</button>
          <button className="btn">Email confirmed</button>
          <button className="btn primary">{ICONS.plus} Add team</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KPI label="Confirmed teams" value={confirmed} delta="35 / 40 target slots filled" deltaDir="up" />
        <KPI label="Participants" value={ev.registrations.current} delta={"target " + ev.registrations.target} />
        <KPI label="Waitlist" value={waitlist} delta="auto-promote on cancel" />
        <KPI label="Pending payment" value={pending + waitlist} delta="3-day reminder running" deltaDir="down" />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 14 }}>
        <TrackCard track="AI / ML" count={teamsBy("AI / ML")} cap={16} prize="RM 5,000" />
        <TrackCard track="Cybersecurity" count={teamsBy("Cybersecurity")} cap={12} prize="RM 3,500" />
        <TrackCard track="Open Innovation" count={teamsBy("Open Innovation")} cap={12} prize="RM 3,500" />
      </div>

      <div className="tabs">
        <button className={"tab" + (tab === "teams" ? " active" : "")} onClick={() => setTab("teams")}>Teams <span className="tab-badge">{REGISTRATIONS.length}</span></button>
        <button className={"tab" + (tab === "form" ? " active" : "")} onClick={() => setTab("form")}>Public registration form</button>
        <button className={"tab" + (tab === "jury" ? " active" : "")} onClick={() => setTab("jury")}>
          Jury & Scoring
          {!canSeeJuryNotes && <span className="pill danger" style={{ marginLeft: 6, padding: "0 6px", fontSize: 10 }}>🔒 Protocol</span>}
        </button>
      </div>

      {tab === "teams" && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Team</th><th>Lead</th><th>Track</th><th>Members</th><th>Project</th><th>Status</th><th>Paid</th>
                  {canSeeJuryNotes && <th>Score</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {REGISTRATIONS.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-tertiary)" }}>{r.id}</div>
                      <strong style={{ fontWeight: 500 }}>{r.team}</strong>
                    </td>
                    <td>{r.lead}<div className="tiny muted">Y{r.year}</div></td>
                    <td><span className={"pill " + (r.track === "AI / ML" ? "info" : r.track === "Cybersecurity" ? "danger" : "warn")}>{r.track}</span></td>
                    <td className="mono">{r.members}</td>
                    <td className="muted" style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.project}</td>
                    <td>
                      <span className={"pill " + (r.status === "Confirmed" ? "success" : r.status === "Waitlist" ? "warn" : "neutral")}>
                        <span className="dot"></span>{r.status}
                      </span>
                    </td>
                    <td>{r.paid ? <span className="pill success" style={{ padding: "1px 6px" }}>✓</span> : <span className="pill warn" style={{ padding: "1px 6px" }}>—</span>}</td>
                    {canSeeJuryNotes && <td className="num mono">{r.score || "—"}</td>}
                    <td><button className="icon-btn">{ICONS.more}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "form" && (
        <RegistrationForm ev={ev} />
      )}

      {tab === "jury" && (
        canSeeJuryNotes
          ? <JuryPanel />
          : <LockedFeature
              title="This tab is protocol-restricted"
              body="Jury notes, scoring matrices, and sealed envelopes are visible only to Protocol Team members. Your current role is "
              role={ROLES[currentUser.role]?.label} />
      )}
    </div>
  );
}

function TrackCard({ track, count, cap, prize }) {
  const pct = (count / cap) * 100;
  return (
    <div className="card">
      <div className="card-body">
        <div className="eyebrow">TRACK</div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 2 }}>{track}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "10px 0 6px" }}>
          <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{count}</div>
          <div className="muted tiny">of {cap} team slots</div>
          <div style={{ flex: 1 }} />
          <div className="mono tiny">{Math.round(pct)}%</div>
        </div>
        <div className="bar"><span style={{ width: pct + "%" }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: "var(--text-secondary)" }}>
          <span>Grand prize</span>
          <strong style={{ color: "var(--text)", fontWeight: 500 }}>{prize}</strong>
        </div>
      </div>
    </div>
  );
}

function RegistrationForm({ ev }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 360px", gap: 14 }}>
      <div className="card">
        <div style={{ padding: "0", background: "linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 100%)", color: "white", padding: "32px 32px 28px" }}>
          <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: "0.16em" }}>FCSIT · UM</div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", marginTop: 4 }}>{ev.code}</div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Team registration · {ev.startDate} → {ev.endDate}</div>
        </div>
        <div className="card-body" style={{ padding: 28 }}>
          <div className="eyebrow">STEP 1 OF 3 · TEAM</div>
          <div className="grid grid-2" style={{ marginTop: 12 }}>
            <div className="field"><label>Team name</label><input className="input" placeholder="e.g. Null Pointer Exception" /></div>
            <div className="field"><label>Track</label><select className="select"><option>AI / ML</option><option>Cybersecurity</option><option>Open Innovation</option></select></div>
          </div>
          <div className="field"><label>Project pitch (one sentence)</label><textarea className="textarea" placeholder="What are you building? One sentence." /></div>
          <div className="field"><label>Team size</label>
            <div className="segmented" style={{ width: "fit-content" }}>
              <button>2</button><button>3</button><button className="active">4</button>
            </div>
          </div>
          <div className="divider"></div>
          <div className="eyebrow">STEP 2 OF 3 · MEMBERS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: 8, fontSize: 11, color: "var(--text-tertiary)", margin: "10px 0 4px" }}>
            <div>Full name</div><div>UM email</div><div>Year</div><div>Role</div>
          </div>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: 8, marginBottom: 6 }}>
              <input className="input" placeholder={i === 0 ? "Team lead" : "Member " + (i+1)} />
              <input className="input" placeholder="@um.edu.my" />
              <select className="select"><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option></select>
              <select className="select"><option>{i === 0 ? "Lead" : "Member"}</option></select>
            </div>
          ))}
          <div className="divider"></div>
          <div className="eyebrow">STEP 3 OF 3 · CONSENT</div>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, fontSize: 12.5, color: "var(--text-secondary)" }}>
            <input type="checkbox" defaultChecked style={{ marginTop: 2 }} /> I confirm all members are matriculated UM students and agree to the Code of Conduct.
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>
            <input type="checkbox" style={{ marginTop: 2 }} /> Allow Atrium to share my team's submission with sponsors after the event.
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
            <button className="btn">Save draft</button>
            <button className="btn primary">Submit registration</button>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Pipeline funnel</h3></div>
          <div className="card-body">
            <FunnelRow label="Form visits"           v="2,431" pct={100} />
            <FunnelRow label="Started form"           v="412"   pct={17} />
            <FunnelRow label="Submitted registration" v={REGISTRATIONS.length + ""} pct={(REGISTRATIONS.length / 412) * 100} />
            <FunnelRow label="Paid + confirmed"       v={REGISTRATIONS.filter(r=>r.paid).length + ""} pct={(REGISTRATIONS.filter(r=>r.paid).length / 412) * 100} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Embed snippet</h3></div>
          <div className="card-body">
            <pre style={{ background: "var(--bg)", padding: 10, borderRadius: 8, fontSize: 11, color: "var(--text-secondary)", margin: 0, overflow: "auto" }}>{`<iframe src="https://atrium.um.edu.my/r/cs27"
        width="100%" height="640"
        frameborder="0"></iframe>`}</pre>
            <button className="btn" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>Copy embed code</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelRow({ label, v, pct }) {
  return (
    <div className="perf-row" style={{ gridTemplateColumns: "1fr 60px 60px", gap: 10 }}>
      <span className="perf-label">{label}</span>
      <div className="bar" style={{ flex: 1, gridColumn: "1 / 2", marginTop: 16, position: "absolute" }}></div>
      <span className="perf-val mono">{v}</span>
      <span className="perf-val muted tiny">{Math.round(pct)}%</span>
    </div>
  );
}

function JuryPanel() {
  const judges = [
    { name: "Prof. Dr. Tan H.W.",   role: "Chair · FCSIT",      avg: 8.6 },
    { name: "Dr. Lin Mei Yi",        role: "Senior Lecturer",    avg: 8.2 },
    { name: "Datin Sarah Chen",      role: "Industry · Maybank", avg: 7.9 },
    { name: "Encik Hadi Mokhtar",    role: "Industry · Petronas",avg: 8.1 },
  ];
  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", background: "var(--danger-soft)", borderRadius: 10, marginBottom: 14, color: "var(--text)" }}>
        <span style={{ color: "var(--danger)" }}>🔒</span>
        <div style={{ fontSize: 12.5 }}>
          <strong>Protocol-restricted area.</strong> All actions are audit-logged. Decryption keys held by Director + Faris Hakim (Secretary).
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Jury panel</h3>
            <span className="pill danger"><span className="dot"></span>SEALED</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {judges.map((j, i) => (
              <div key={i} className="list-row">
                <div className="av-md">{j.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{j.name}</div>
                  <div className="tiny muted">{j.role}</div>
                </div>
                <div className="mono">avg {j.avg}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Scoring rubric</h3></div>
          <div className="card-body">
            {[
              ["Technical depth",          25],
              ["Originality & innovation", 25],
              ["Real-world impact",        20],
              ["Demo / pitch quality",     15],
              ["Code & repo hygiene",      15],
            ].map((r, i) => (
              <div key={i} className="perf-row" style={{ gridTemplateColumns: "1fr 60px" }}>
                <span className="perf-label">{r[0]}</span>
                <span className="perf-val mono">{r[1]} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-header">
          <h3 className="card-title">Top teams · provisional ranking</h3>
          <span className="muted tiny">Locked until Day 2 announcement</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>#</th><th>Team</th><th>Track</th><th className="num">Score</th><th>Status</th></tr></thead>
            <tbody>
              {[...REGISTRATIONS].filter(r => r.score > 0).sort((a,b) => b.score - a.score).map((r, i) => (
                <tr key={r.id}>
                  <td className="mono" style={{ fontWeight: 600 }}>{i + 1}</td>
                  <td><strong style={{ fontWeight: 500 }}>{r.team}</strong></td>
                  <td><span className={"pill " + (r.track === "AI / ML" ? "info" : r.track === "Cybersecurity" ? "danger" : "warn")}>{r.track}</span></td>
                  <td className="num mono">{r.score}</td>
                  <td>{i === 0 ? <span className="pill warn">🏆 Provisional Grand</span> : i < 3 ? <span className="pill success">Finalist</span> : <span className="pill neutral">Qualified</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LockedFeature({ title, body, role }) {
  return (
    <div className="card" style={{ padding: 60, textAlign: "center", border: "1px dashed var(--border-strong)", background: "var(--bg)" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto 14px" }}>
        {body}<strong style={{ color: "var(--text)" }}>{role}</strong>. Ask the Director to add you to the Protocol Team if you need access.
      </p>
      <button className="btn">Request access</button>
    </div>
  );
}

// ============ PROFILE ============
function ProfileView({ currentUser, onSwitch }) {
  const role = ROLES[currentUser.role];
  const member = ALL_MEMBERS.find(m => m.name === currentUser.name) || ALL_MEMBERS[0];
  const myTasks = TASKS.filter(t => t.assignee === currentUser.initials);
  const myClaims = CLAIMS.filter(c => c.name === currentUser.name);

  const allPerms = role.permissions === "*"
    ? ["Full access — director-level"]
    : role.permissions;

  const featureMatrix = [
    { feature: "Dashboard",         perm: "view:dashboard" },
    { feature: "Events",            perm: "view:events" },
    { feature: "Tasks",             perm: "view:tasks" },
    { feature: "Timeline / Gantt",  perm: "view:timeline" },
    { feature: "Org Chart",         perm: "view:org" },
    { feature: "Team Directory",    perm: "view:team" },
    { feature: "Sponsors CRM",      perm: "view:sponsors" },
    { feature: "Budget",            perm: "view:budget" },
    { feature: "Invoices & Claims", perm: "view:invoices" },
    { feature: "Approvals",         perm: "view:approvals" },
    { feature: "Reports & SWOT",    perm: "view:reports" },
    { feature: "Files",             perm: "view:files" },
    { feature: "Registration",      perm: "view:registration" },
    { feature: "Lucky Draw",        perm: "view:draw" },
    { feature: "Approve invoices",  perm: "approve:invoices" },
    { feature: "Approve claims",    perm: "approve:claims" },
    { feature: "Approve tasks",     perm: "approve:tasks" },
    { feature: "Edit budget",       perm: "edit:budget" },
    { feature: "Files: confidential",perm: "files:read:confidential" },
    { feature: "Files: protocol-locked", perm: "files:read:protocol" },
  ];

  return (
    <div className="view view-wide">
      <div className="card" style={{ overflow: "hidden", marginBottom: 18 }}>
        <div style={{
          height: 120,
          background: `linear-gradient(135deg, ${role.color === "var(--text)" ? "#1d1d1f" : role.color} 0%, var(--bg-elev) 140%)`,
        }}></div>
        <div className="card-body" style={{ padding: "0 24px 22px", marginTop: -44 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 99,
              background: "var(--bg-elev)", border: "4px solid var(--bg-elev)",
              boxShadow: "var(--shadow)",
              display: "grid", placeItems: "center",
              fontSize: 28, fontWeight: 600, color: "var(--text)",
            }}>{currentUser.initials}</div>
            <div style={{ paddingBottom: 12, flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{currentUser.name}</h1>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                <span className="pill" style={{ background: role.color, color: "white" }}>{role.label}</span>
                {currentUser.protocol && <span className="pill danger"><span className="dot"></span>Protocol Team</span>}
                <span className="pill neutral">{currentUser.email}</span>
                {currentUser.dept !== "HC" && <DeptTag id={currentUser.dept} />}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, paddingBottom: 12 }}>
              <button className="btn">Edit profile</button>
              <button className="btn">Settings</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <KPI label="Open tasks" value={myTasks.filter(t => t.status !== "Done").length} delta={myTasks.length + " total assigned"} />
        <KPI label="Hours logged" value={member.hours + " h"} delta="this event" />
        <KPI label="Performance" value={member.perf + "%"} delta="top quartile" deltaDir="up" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Role & access</h3>
            <span className="muted tiny">{role.desc}</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", borderBottom: "1px solid var(--border)", padding: "10px 16px", fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <span>Feature / Permission</span>
              <span style={{ textAlign: "center" }}>Access</span>
            </div>
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {featureMatrix.map((f, i) => {
                const ok = hasPermission(role, f.perm);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px", padding: "8px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                    <span style={{ fontSize: 12.5 }}>{f.feature}</span>
                    <span style={{ textAlign: "center" }}>
                      {ok ? <span style={{ color: "var(--success)" }}>{ICONS.check}</span> : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Switch role · demo</h3>
              <span className="muted tiny">In production, the active role is fixed by IT</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {Object.values(USERS).map(u => (
                <div key={u.id} className="list-row" style={{ cursor: "pointer", background: u.id === currentUser.id ? "var(--bg-hover)" : "transparent" }} onClick={() => onSwitch(u.id)}>
                  <div className="av-md">{u.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                    <div className="tiny muted">{ROLES[u.role].label}{u.dept !== "HC" ? " · " + u.dept : ""}{u.protocol ? " · Protocol" : ""}</div>
                  </div>
                  {u.id === currentUser.id ? <span className="pill success" style={{ padding: "1px 8px" }}>active</span> : <button className="btn ghost" style={{ padding: "2px 8px" }}>Switch</button>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">My recent activity</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {myTasks.slice(0, 4).map(t => (
                <div key={t.id} className="list-row">
                  <DeptTag id={t.dept} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{t.title}</div>
                    <div className="tiny muted">Due {t.due}</div>
                  </div>
                  <span className={"pill " + (t.status === "Done" ? "success" : "neutral")} style={{ padding: "1px 6px" }}>{t.status}</span>
                </div>
              ))}
              {myClaims.slice(0, 2).map(c => (
                <div key={c.id} className="list-row">
                  <span className="pill info" style={{ padding: "1px 6px" }}>{ICONS.invoices}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{c.id} · {c.desc}</div>
                    <div className="tiny muted">RM {c.amount} · {c.date}</div>
                  </div>
                  <span className={"pill " + (c.status === "Approved" ? "success" : "warn")}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ROLE BADGE in topbar ============
function RoleBadgeButton({ currentUser, onClick }) {
  const role = ROLES[currentUser.role];
  return (
    <button className="btn" onClick={onClick} style={{ gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: role.color, display: "inline-block" }}></span>
      <span style={{ fontSize: 12.5 }}>{role.label}</span>
      {currentUser.protocol && <span style={{ color: "var(--danger)", fontSize: 10 }}>🔒</span>}
    </button>
  );
}

Object.assign(window, { RegistrationView, ProfileView, LockedFeature, RoleBadgeButton });
