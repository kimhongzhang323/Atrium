// views-2.jsx — Tasks, Timeline, Org Chart, Sponsors

// ============ TASKS (Kanban) ============
function TasksView({ embedded }) {
  const COLS = ["Backlog", "Doing", "Review", "Done"];
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? TASKS : TASKS.filter(t => t.dept === filter);

  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-wide">{props.children}</div>;

  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Tasks</h1>
            <p className="view-subtitle">All work across MYTECH 2027 · 6 departments</p>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div className="segmented">
              <button>List</button>
              <button className="active">Board</button>
              <button>Calendar</button>
            </div>
            <button className="btn">{ICONS.filter} Filter</button>
            <button className="btn primary">{ICONS.plus} New task</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center" }}>
        <button className={"chip" + (filter === "All" ? " active" : "")} style={filter === "All" ? { background: "var(--text)", color: "var(--text-inverse)" } : {}} onClick={() => setFilter("All")}>All · {TASKS.length}</button>
        {DEPTS.map(d => {
          const c = TASKS.filter(t => t.dept === d.id).length;
          return <button key={d.id} className="chip" onClick={() => setFilter(d.id)} style={filter === d.id ? { background: "var(--text)", color: "var(--text-inverse)" } : {}}>
            {d.id} · {c}
          </button>;
        })}
        <div style={{ flex: 1 }} />
        <span className="muted tiny">Showing {filtered.length} of {TASKS.length}</span>
      </div>

      <div className="kanban">
        {COLS.map(col => {
          const items = filtered.filter(t => t.status === col);
          return (
            <div key={col} className="kanban-col">
              <div className="kanban-col-head">
                <span className="kanban-col-title">{col}</span>
                <span className="kanban-col-count">{items.length}</span>
              </div>
              {items.map(t => (
                <div key={t.id} className="task-card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <DeptTag id={t.dept} />
                    <span className={"pill " + (t.priority === "High" ? "danger" : t.priority === "Med" ? "warn" : "neutral")} style={{ padding: "1px 6px", fontSize: 10 }}>{t.priority}</span>
                  </div>
                  <div className="task-card-title">{t.title}</div>
                  <div className="task-card-meta">
                    <span>📅 {t.due}</span>
                    <div style={{ flex: 1 }} />
                    <div className="av-md" style={{ width: 22, height: 22, fontSize: 9.5 }}>{t.assignee}</div>
                  </div>
                </div>
              ))}
              <button className="btn ghost" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>{ICONS.plus} Add task</button>
            </div>
          );
        })}
      </div>
    </Wrap>
  );
}

// ============ TIMELINE / GANTT ============
function TimelineView({ embedded, e }) {
  const ev = e || ev27;
  // Build gantt rows by phase
  const weeks = 24;
  const nowWeek = 11; // current position
  const rows = [];
  TIMELINE_TEMPLATE.forEach((phase, pi) => {
    rows.push({ kind: "section", title: phase.phase, weeks: phase.weeks, tasks: phase.tasks.length });
    phase.tasks.forEach((task, ti) => {
      // Synthetic spans across weeks
      const baseStart = pi * 4 + (ti % 2);
      const span = 2 + (ti % 3);
      const status = baseStart + span <= nowWeek ? "done" : baseStart <= nowWeek ? "now" : "future";
      rows.push({
        kind: "task",
        title: task,
        dept: DEPTS[(pi + ti) % DEPTS.length].id,
        start: baseStart, span,
        status,
      });
    });
  });

  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-wide">{props.children}</div>;

  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Timeline</h1>
            <p className="view-subtitle">{ev.name} · suggested by Atrium AI from 2026 retrospective + Career Fair template</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div className="segmented">
              <button>Day</button>
              <button>Week</button>
              <button className="active">Month</button>
              <button>Quarter</button>
            </div>
            <button className="btn">Export</button>
          </div>
        </div>
      )}

      <div className="gantt" style={{ "--gantt-weeks": weeks }}>
        <div className="gantt-head">
          <div className="gh-left">Workstream</div>
          <div className="gh-right" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
            {Array.from({ length: weeks }, (_, i) => {
              const weekFromStart = i - 18;
              const label = weekFromStart < 0 ? `T${weekFromStart}` : weekFromStart === 0 ? "EVENT" : `T+${weekFromStart}`;
              return <div key={i} className="gh-week">{label}</div>;
            })}
          </div>
        </div>
        {rows.map((r, i) => {
          if (r.kind === "section") {
            return (
              <div key={i} className="gantt-row gantt-section-row">
                <div className="gr-left">{r.title} <span style={{ marginLeft: "auto", color: "var(--text-tertiary)" }}>{r.weeks}</span></div>
                <div className="gr-right"></div>
              </div>
            );
          }
          const left = (r.start / weeks) * 100;
          const width = (r.span / weeks) * 100;
          return (
            <div key={i} className="gantt-row">
              <div className="gr-left">
                <DeptTag id={r.dept} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
              </div>
              <div className="gr-right" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
                <div className="gantt-now-line" style={{ left: (nowWeek / weeks) * 100 + "%" }}></div>
                <div className={"gantt-bar" + (r.status === "now" ? " now" : "")} style={{ left: left + "%", width: width + "%" }}>
                  {r.status === "done" && <span className="pill success" style={{ padding: "0 4px", marginRight: 4 }}>✓</span>}
                  {r.span >= 3 ? <span style={{ opacity: 0.8 }}>{r.dept}</span> : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, fontSize: 11.5, color: "var(--text-secondary)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 6, background: "var(--text)", borderRadius: 3, display: "inline-block" }}></span> In progress</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 6, background: "var(--accent-soft)", borderRadius: 3, display: "inline-block" }}></span> Planned / done</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 2, height: 12, background: "var(--danger)", display: "inline-block" }}></span> Today (T-{18 - nowWeek} wk)</span>
      </div>
    </Wrap>
  );
}

// ============ ORG CHART ============
function OrgView({ embedded }) {
  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-wide">{props.children}</div>;
  const [selected, setSelected] = useState(null);

  // Look up a full member record by display name; falls back to a stub.
  const findByName = (name) => {
    const m = ALL_MEMBERS.find(u => u.name === name);
    if (m) return m;
    // synthesize from initials/role if not in roster
    const init = name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
    return { id: "x-" + init, name, initials: init, role: "Member", dept: "HC", year: "—", perf: null, tasks: 0, done: 0, hours: 0 };
  };

  const openPerson = (name) => setSelected(findByName(name));

  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Organisation Chart</h1>
            <p className="view-subtitle">MYTECH 2027 · High Committee + 6 Departments · click anyone to view details</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn">Export PDF</button>
            <button className="btn">Print</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        {/* Level 1 — Director */}
        <div className="org-tree">
          <div className="org-level">
            <div className="org-node head clickable" style={{ minWidth: 200 }} onClick={() => openPerson("Aisyah Rahman")}>
              <div className="org-title">Director</div>
              <div className="org-name">Aisyah Rahman</div>
              <div className="org-tag">Program Advisor: Dr. Tan H.W.</div>
            </div>
          </div>
          <div className="org-connector"></div>

          {/* Level 2 — Vice Directors */}
          <div className="org-level">
            {HIGH_COMM.slice(1, 3).map((p, i) => (
              <div key={i} className="org-node clickable" onClick={() => openPerson(p.name)}>
                <div className="org-title">{p.role}</div>
                <div className="org-name">{p.name}</div>
              </div>
            ))}
          </div>
          <div className="org-connector"></div>

          {/* Level 3 — Sec, Treasurer */}
          <div className="org-level">
            {HIGH_COMM.slice(3).map((p, i) => (
              <div key={i} className="org-node clickable" style={{ minWidth: 160 }} onClick={() => openPerson(p.name)}>
                <div className="org-title">{p.role}</div>
                <div className="org-name">{p.name}</div>
              </div>
            ))}
          </div>
          <div className="org-connector"></div>

          {/* Departments */}
          <div className="org-level">
            {DEPTS.map(d => {
              const leads = DEPT_LEADS[d.id];
              const memberCount = ALL_MEMBERS.filter(m => m.dept === d.id).length;
              return (
                <div key={d.id} className="org-node" style={{ minWidth: 196 }}>
                  <DeptTag id={d.id} />
                  <div className="org-name" style={{ marginTop: 6 }}>{d.name}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8, fontSize: 11.5, color: "var(--text-secondary)" }}>
                    <span>
                      Head:{" "}
                      <button className="org-link" onClick={(e) => { e.stopPropagation(); openPerson(leads[0].name); }}>
                        {leads[0].name}
                      </button>
                    </span>
                    <span>
                      VH:{" "}
                      <button className="org-link" onClick={(e) => { e.stopPropagation(); openPerson(leads[1].name); }}>
                        {leads[1].name}
                      </button>
                    </span>
                  </div>
                  <div className="org-tag" style={{ marginTop: 8 }}>
                    <button className="org-link muted" onClick={(e) => { e.stopPropagation(); setSelected({ __dept: d, __members: ALL_MEMBERS.filter(m => m.dept === d.id) }); }}>
                      {memberCount} members
                    </button>
                    {" "}· supervised by {d.supervisor}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        selected.__dept
          ? <DeptDetailModal data={selected} onClose={() => setSelected(null)} onOpenPerson={(n) => setSelected(findByName(n))} />
          : <PersonDetailModal m={selected} onClose={() => setSelected(null)} onOpenPerson={(n) => setSelected(findByName(n))} />
      )}

      <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--text-secondary)" }} className="card">
        <div className="card-header"><h3 className="card-title">Reporting lines</h3></div>
        <div className="card-body">
          <div className="grid grid-3">
            {DEPTS.map(d => (
              <div key={d.id} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <DeptTag id={d.id} />
                  <span style={{ fontWeight: 500 }}>{d.name}</span>
                </div>
                <div className="muted tiny" style={{ marginTop: 6 }}>Reports to: {d.supervisor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ============ SPONSORS CRM ============
function SponsorsView({ embedded }) {
  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-wide">{props.children}</div>;
  const total = SPONSORS.reduce((s, x) => s + x.amount, 0);
  const signed = SPONSORS.filter(s => s.status === "Signed").reduce((s, x) => s + x.amount, 0);
  const pipeline = SPONSORS.filter(s => ["Negotiating","Proposal Sent"].includes(s.status)).reduce((s, x) => s + x.amount, 0);
  const tiers = ["Platinum", "Gold", "Silver", "Booth"];

  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Sponsors</h1>
            <p className="view-subtitle">Pipeline · MYTECH 2027 · target {fmtMoney(ev27.sponsorTarget)}</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn">Import leads</button>
            <button className="btn primary">{ICONS.plus} Add sponsor</button>
          </div>
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KPI label="Signed"      value={fmtMoney(signed)}    delta={SPONSORS.filter(s=>s.status==="Signed").length + " sponsors"} deltaDir="up" />
        <KPI label="Pipeline"    value={fmtMoney(pipeline)}  delta="6 deals active" />
        <KPI label="All prospects" value={fmtMoney(total)}   delta={SPONSORS.length + " companies"} />
        <KPI label="Target gap"  value={fmtMoney(ev27.sponsorTarget - signed)} delta={Math.round((signed/ev27.sponsorTarget)*100) + "% secured"} deltaDir={signed >= ev27.sponsorTarget*0.5 ? "up" : "down"} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All sponsors</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {tiers.map(t => <span key={t} className="chip">{t}</span>)}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Sponsor</th><th>Tier</th><th>Amount</th><th>Status</th><th>Contact</th><th>Owner</th><th></th>
              </tr>
            </thead>
            <tbody>
              {SPONSORS.map(s => (
                <tr key={s.id}>
                  <td><strong style={{ fontWeight: 500 }}>{s.name}</strong></td>
                  <td><span className={"pill " + (s.tier === "Platinum" ? "info" : s.tier === "Gold" ? "warn" : "neutral")}>{s.tier}</span></td>
                  <td className="num mono">{fmtMoney(s.amount)}</td>
                  <td>
                    <span className={"pill " + (
                      s.status === "Signed" ? "success" :
                      s.status === "Negotiating" ? "info" :
                      s.status === "Proposal Sent" ? "warn" :
                      s.status === "Declined" ? "danger" : "neutral"
                    )}><span className="dot"></span>{s.status}</span>
                  </td>
                  <td className="muted">{s.contact}</td>
                  <td><div className="av-md" style={{ width: 24, height: 24, fontSize: 10 }}>{s.owner}</div></td>
                  <td style={{ width: 32 }}><button className="icon-btn">{ICONS.more}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!embedded && (
        <div className="grid grid-2" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Tier breakdown</h3></div>
            <div className="card-body">
              {tiers.map(t => {
                const list = SPONSORS.filter(s => s.tier === t);
                const sum = list.reduce((s,x) => s + x.amount, 0);
                return (
                  <div key={t} className="perf-row" style={{ gridTemplateColumns: "100px 1fr 90px" }}>
                    <span className="perf-label">{t}</span>
                    <div className="bar"><span style={{ width: Math.min(100, sum / 30000 * 100) + "%" }} /></div>
                    <span className="perf-val">{fmtMoney(sum)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Next actions</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="list-row"><span className="pill warn"><span className="dot"></span>Follow-up</span><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>Petronas — 3 days since last touch</div><div className="tiny muted">Encik Hadi · Negotiating · RM 22,000</div></div><button className="btn ghost" style={{ padding: "3px 8px" }}>Draft email</button></div>
              <div className="list-row"><span className="pill info"><span className="dot"></span>Schedule</span><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>GXBank — proposal pending review</div><div className="tiny muted">Marcus Tan · Sent 6 days ago</div></div><button className="btn ghost" style={{ padding: "3px 8px" }}>Call</button></div>
              <div className="list-row"><span className="pill success"><span className="dot"></span>Sign</span><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>Maybank MOU — finalize signatures</div><div className="tiny muted">Alia Rosli · Signed RM 25,000</div></div><button className="btn ghost" style={{ padding: "3px 8px" }}>Open doc</button></div>
            </div>
          </div>
        </div>
      )}
    </Wrap>
  );
}

Object.assign(window, { TasksView, TimelineView, OrgView, SponsorsView });

// ============ ORG · Person detail modal ============
function PersonDetailModal({ m, onClose, onOpenPerson }) {
  // role / dept context
  const deptDef = DEPTS.find(d => d.id === m.dept);
  const isHC = m.dept === "HC";
  const deptName = isHC ? "High Committee" : (deptDef ? deptDef.name : "—");

  // Find supervisor by simple rules
  let supervisor = null;
  if (m.role === "Director") supervisor = null;
  else if (m.role === "Vice Director" || m.role === "Secretary" || m.role === "Treasurer") supervisor = "Aisyah Rahman";
  else if (m.role === "Vice Secretary") supervisor = "Faris Hakim";
  else if (m.role === "Vice Treasurer") supervisor = "Jia Hui Chong";
  else if (m.role && m.role.startsWith("Head,")) supervisor = (deptDef && deptDef.supervisor) || "Vice Director";
  else if (m.role && m.role.startsWith("Vice Head,")) {
    const leads = DEPT_LEADS[m.dept];
    supervisor = leads ? leads[0].name : null;
  }
  else if (deptDef) {
    const leads = DEPT_LEADS[m.dept];
    supervisor = leads ? leads[0].name : null;
  }

  // Reports
  const reports = ALL_MEMBERS.filter(x => {
    if (m.role === "Director") return ["Vice Director", "Secretary", "Treasurer"].includes(x.role);
    if (m.role === "Vice Director") return false; // simplification — no direct reports in this dataset
    if (m.role === "Secretary") return x.role === "Vice Secretary";
    if (m.role === "Treasurer") return x.role === "Vice Treasurer";
    if (m.role && m.role.startsWith("Head,")) {
      return x.dept === m.dept && x.id !== m.id;
    }
    return false;
  });

  // Tasks assigned to this person (by initials)
  const myTasks = TASKS.filter(t => t.assignee === m.initials);
  const taskDone = myTasks.filter(t => t.status === "Done").length;
  const taskActive = myTasks.filter(t => t.status !== "Done");

  // Sponsor leads owned (if SPR)
  const ownedSponsors = SPONSORS.filter(s => s.owner === m.initials);

  // Performance band
  const perfBand =
    m.perf == null ? null :
    m.perf >= 90 ? { label: "Top performer", kind: "success" } :
    m.perf >= 80 ? { label: "Solid", kind: "info" } :
    m.perf >= 70 ? { label: "Developing", kind: "warn" } :
                   { label: "Needs support", kind: "danger" };

  // avatar gradient
  const grad = isHC
    ? "linear-gradient(135deg, #1d1d1f, #3a3a3c)"
    : {
        SPR:  "linear-gradient(135deg, #8b5cf6, #6b21a8)",
        PnP:  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        PUB:  "linear-gradient(135deg, #ec4899, #be185d)",
        LOGI: "linear-gradient(135deg, #f59e0b, #b25e00)",
        MM:   "linear-gradient(135deg, #10b981, #047857)",
        TECH: "linear-gradient(135deg, #06b6d4, #075985)",
      }[m.dept] || "linear-gradient(135deg, #c8c8cc, #88888c)";

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal" style={{ width: "min(680px, 92vw)" }}>
        {/* Hero */}
        <div style={{ display: "flex", gap: 16, padding: "20px 22px", borderBottom: "1px solid var(--border)", position: "relative" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 99, background: grad,
            color: "white", display: "grid", placeItems: "center",
            fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", flexShrink: 0,
          }}>{m.initials}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 2 }}>{m.role}</div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>{m.name}</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {!isHC && <DeptTag id={m.dept} />}
              {isHC && <span className="pill">High Committee</span>}
              <span className="pill neutral">Year {m.year}</span>
              {perfBand && <span className={"pill " + perfBand.kind}><span className="dot" />{perfBand.label}</span>}
              {ownedSponsors.length > 0 && <span className="pill info">{ownedSponsors.length} sponsor leads</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <button className="btn">Message</button>
            <button className="icon-btn" onClick={onClose} title="Close">{ICONS.close}</button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: "18px 22px" }}>

          {/* KPI strip */}
          <div className="grid grid-4" style={{ gap: 10, marginBottom: 16 }}>
            <MiniKPI label="Tasks done" value={taskDone + " / " + myTasks.length} />
            <MiniKPI label="Hours logged" value={(m.hours || 0) + "h"} sub="this event cycle" />
            <MiniKPI label="On-time rate" value={m.perf != null ? m.perf + "%" : "—"} />
            <MiniKPI label="Department" value={deptName} sub={deptDef ? "Reports to " + deptDef.supervisor : "—"} />
          </div>

          {/* Contact */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><h3 className="card-title">Contact</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="list-row">
                <span className="muted tiny" style={{ width: 90 }}>EMAIL</span>
                <span className="mono">{m.initials.toLowerCase()}@um.edu.my</span>
                <button className="btn ghost" style={{ marginLeft: "auto", padding: "3px 8px" }}>Copy</button>
              </div>
              <div className="list-row">
                <span className="muted tiny" style={{ width: 90 }}>PHONE</span>
                <span className="mono">+60 1{2 + (m.id.length % 6)}-{(100 + (m.id.charCodeAt(0) % 900))} {2000 + (m.id.charCodeAt(m.id.length-1) % 8000)}</span>
                <button className="btn ghost" style={{ marginLeft: "auto", padding: "3px 8px" }}>WhatsApp</button>
              </div>
              <div className="list-row">
                <span className="muted tiny" style={{ width: 90 }}>MATRIC</span>
                <span className="mono">U23{(m.id.charCodeAt(0) * 7 % 9000 + 1000).toString().slice(0,5)}</span>
              </div>
              <div className="list-row">
                <span className="muted tiny" style={{ width: 90 }}>OFFICE HRS</span>
                <span>Tue & Thu · 6 – 8 PM · DKU3 Committee Room</span>
              </div>
            </div>
          </div>

          {/* Reporting line */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><h3 className="card-title">Reporting line</h3></div>
            <div className="card-body" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                {supervisor ? (
                  <>
                    <button className="org-link" style={{ fontWeight: 500 }} onClick={() => onOpenPerson(supervisor)}>{supervisor}</button>
                    <span className="muted">›</span>
                    <span style={{ fontWeight: 500 }}>{m.name}</span>
                  </>
                ) : (
                  <span className="muted">Top of the chart — reports to Program Advisor.</span>
                )}
              </div>
              {reports.length > 0 && (
                <>
                  <div className="eyebrow" style={{ marginTop: 14, marginBottom: 6 }}>Direct reports</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {reports.map(r => (
                      <button key={r.id} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => onOpenPerson(r.name)}>
                        <span className="av" style={{ width: 18, height: 18, fontSize: 9, marginLeft: 0, border: "none" }}>{r.initials}</span>
                        {r.name} <span className="muted" style={{ fontSize: 11 }}>· {r.role.replace(/^(Head|Vice Head), /, "")}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active work */}
          {taskActive.length > 0 && (
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header">
                <h3 className="card-title">Active work</h3>
                <span className="muted tiny">{taskActive.length} open · {taskDone} closed</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {taskActive.slice(0, 5).map(t => (
                  <div key={t.id} className="list-row">
                    <DeptTag id={t.dept} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                      <div className="tiny muted">Due {t.due} · {t.priority} priority</div>
                    </div>
                    <span className={"pill " + (t.status === "Doing" ? "info" : t.status === "Review" ? "warn" : "neutral")}>
                      <span className="dot" />{t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors owned */}
          {ownedSponsors.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Sponsor leads</h3>
                <span className="muted tiny">{ownedSponsors.length} accounts</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {ownedSponsors.map(s => (
                  <div key={s.id} className="list-row">
                    <strong style={{ fontWeight: 500, fontSize: 12.5, minWidth: 110 }}>{s.name}</strong>
                    <span className={"pill " + (s.tier === "Platinum" ? "info" : s.tier === "Gold" ? "warn" : "neutral")}>{s.tier}</span>
                    <span className="num mono" style={{ marginLeft: "auto", fontSize: 12.5 }}>{fmtMoney(s.amount)}</span>
                    <span className={"pill " + (s.status === "Signed" ? "success" : s.status === "Declined" ? "danger" : "neutral")}>
                      <span className="dot" />{s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          <div className="muted tiny">Profile data is pulled from FCSIT directory · last sync 2 min ago</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn">View full profile</button>
            <button className="btn primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniKPI({ label, value, sub }) {
  return (
    <div style={{
      padding: 11,
      border: "1px solid var(--border)",
      borderRadius: 8,
      background: "var(--bg)",
    }}>
      <div className="muted" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div className="muted tiny" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ============ ORG · Department roster modal ============
function DeptDetailModal({ data, onClose, onOpenPerson }) {
  const d = data.__dept;
  const members = data.__members;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal" style={{ width: "min(640px, 92vw)" }}>
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <DeptTag id={d.id} />
            <div>
              <div className="eyebrow">DEPARTMENT</div>
              <div className="modal-title">{d.name}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>{ICONS.close}</button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          {members.map(m => (
            <div
              key={m.id}
              className="list-row"
              style={{ cursor: "pointer" }}
              onClick={() => onOpenPerson(m.name)}
            >
              <div className="av-md">{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                <div className="tiny muted">{m.role} · Year {m.year}</div>
              </div>
              <span className="muted tiny">{m.tasks} tasks · {m.hours}h</span>
              <button className="icon-btn" tabIndex={-1}>{ICONS.arrow}</button>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <div className="muted tiny">{members.length} members · supervised by {d.supervisor}</div>
          <button className="btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
