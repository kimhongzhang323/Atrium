// views-3.jsx — Budget, Invoices & Claims, Team, Approvals, Files

// ============ BUDGET ============
function BudgetView({ embedded, e }) {
  const ev = e || ev27;
  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-wide">{props.children}</div>;

  const lines = [
    { dept: "LOGI", category: "Venue & equipment",   budget: 22000, spent: 8500,  committed: 14000 },
    { dept: "PnP",  category: "Speakers & program",  budget: 14000, spent: 1200,  committed: 4200 },
    { dept: "MM",   category: "Branding & design",   budget: 9000,  spent: 2800,  committed: 4500 },
    { dept: "PUB",  category: "Marketing & ads",     budget: 8000,  spent: 1400,  committed: 3200 },
    { dept: "TECH", category: "Web, AV, IT",         budget: 11000, spent: 2200,  committed: 6500 },
    { dept: "SPR",  category: "Sponsor servicing",   budget: 6000,  spent: 1100,  committed: 3500 },
    { dept: "HC",   category: "Admin · contingency", budget: 8000,  spent: 1000,  committed: 6600 },
  ];
  const totalBudget = lines.reduce((s,x) => s + x.budget, 0);
  const totalSpent = lines.reduce((s,x) => s + x.spent, 0);
  const totalCommitted = lines.reduce((s,x) => s + x.committed, 0);

  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Budget</h1>
            <p className="view-subtitle">{ev.name} · {fmtMoney(totalBudget)} approved</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn">Export</button>
            <button className="btn primary">Submit revision</button>
          </div>
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KPI label="Approved budget" value={fmtMoney(totalBudget)} delta="locked Nov 14" />
        <KPI label="Committed"        value={fmtMoney(totalCommitted)} delta={Math.round(totalCommitted/totalBudget*100)+"% of budget"} deltaDir={totalCommitted/totalBudget > 0.7 ? "down" : "up"} />
        <KPI label="Spent"            value={fmtMoney(totalSpent)}    delta={Math.round(totalSpent/totalBudget*100)+"% of budget"} />
        <KPI label="Headroom"         value={fmtMoney(totalBudget - totalCommitted)} delta="vs RM -3,240 at this point in 2026" deltaDir="up" sub="(safer)" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">By department</h3>
          <span className="muted tiny">Click a row to drill down</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Department</th><th>Category</th><th className="num">Budget</th><th className="num">Committed</th><th className="num">Spent</th><th>Utilization</th><th className="num">Free</th></tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const util = Math.round((l.committed / l.budget) * 100);
                const tone = util > 90 ? "danger" : util > 70 ? "warn" : "success";
                return (
                  <tr key={i}>
                    <td>{l.dept === "HC" ? <span className="dept-tag" style={{ color: "var(--text)" }}>HC</span> : <DeptTag id={l.dept} />}</td>
                    <td>{l.category}</td>
                    <td className="num mono">{fmtMoney(l.budget)}</td>
                    <td className="num mono">{fmtMoney(l.committed)}</td>
                    <td className="num mono muted">{fmtMoney(l.spent)}</td>
                    <td style={{ width: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className={"bar " + tone} style={{ flex: 1 }}><span style={{ width: util + "%" }} /></div>
                        <span className="mono tiny" style={{ width: 32 }}>{util}%</span>
                      </div>
                    </td>
                    <td className="num mono">{fmtMoney(l.budget - l.committed)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg)", fontWeight: 500 }}>
                <td colSpan="2" style={{ padding: "10px 14px" }}>Total</td>
                <td className="num mono" style={{ padding: "10px 14px" }}>{fmtMoney(totalBudget)}</td>
                <td className="num mono" style={{ padding: "10px 14px" }}>{fmtMoney(totalCommitted)}</td>
                <td className="num mono" style={{ padding: "10px 14px" }}>{fmtMoney(totalSpent)}</td>
                <td style={{ padding: "10px 14px" }}></td>
                <td className="num mono" style={{ padding: "10px 14px" }}>{fmtMoney(totalBudget - totalCommitted)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {!embedded && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-header">
            <h3 className="card-title">2026 lesson learned</h3>
            <span className="pill warn"><span className="dot"></span>flagged by Atrium</span>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14 }}>
              <div className="ai-orb" style={{ width: 24, height: 24, marginTop: 4 }}></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                  Last year, LOGI overran by RM 3,200 on Day 1 AV upgrade.
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Reserve <strong>RM 2,500 LOGI contingency</strong> and lock backup AV vendor by T-6 weeks. I've prepared a contingency line in your draft revision.
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="btn">Apply suggestion</button>
                  <button className="btn ghost">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Wrap>
  );
}

// ============ INVOICES & CLAIMS ============
function InvoicesView() {
  const [tab, setTab] = useState("invoices");
  const [fuelOpen, setFuelOpen] = useState(false);
  const pendingInv = INVOICES.filter(i => i.status === "Pending").length;
  const pendingCl  = CLAIMS.filter(c => c.status === "Pending").length;

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <h1 className="view-title">Invoices & Claims</h1>
          <p className="view-subtitle">Vendor invoices and committee reimbursements · linked to inventory + budget</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn">Export to UM ePay</button>
          <button className="btn" onClick={() => setFuelOpen(true)}>🚗 New fuel claim</button>
          <button className="btn primary">{ICONS.plus} New invoice</button>
        </div>
      </div>

      {fuelOpen && <FuelClaimModal onClose={() => setFuelOpen(false)} />}

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KPI label="Invoices paid"   value={fmtMoney(INVOICES.filter(i=>i.status==="Paid").reduce((s,x)=>s+x.amount,0))} delta={INVOICES.filter(i=>i.status==="Paid").length + " vendors"} />
        <KPI label="Pending approval" value={pendingInv + pendingCl + " items"} delta={"avg 2.4 days to clear"} deltaDir="up" />
        <KPI label="Claims approved" value={fmtMoney(CLAIMS.filter(c=>c.status==="Approved").reduce((s,x)=>s+x.amount,0))} delta={CLAIMS.filter(c=>c.status==="Approved").length + " members"} />
        <KPI label="Avg claim turnaround" value="1.8 d" delta="vs 4.2 d in 2026" deltaDir="up" sub="(faster)" />
      </div>

      <div className="tabs">
        <button className={"tab" + (tab === "invoices" ? " active" : "")} onClick={() => setTab("invoices")}>
          Invoices <span className="tab-badge">{INVOICES.length}</span>
        </button>
        <button className={"tab" + (tab === "claims" ? " active" : "")} onClick={() => setTab("claims")}>
          Claims <span className="tab-badge">{CLAIMS.length}</span>
        </button>
        <button className={"tab" + (tab === "flow" ? " active" : "")} onClick={() => setTab("flow")}>
          Approval Flow
        </button>
      </div>

      {tab === "invoices" && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="tbl">
              <thead><tr><th>ID</th><th>Vendor</th><th>Description</th><th>Department</th><th className="num">Amount</th><th>Due</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {INVOICES.map(i => (
                  <tr key={i.id}>
                    <td className="mono">{i.id}</td>
                    <td><strong style={{ fontWeight: 500 }}>{i.vendor}</strong></td>
                    <td className="muted">{i.desc}</td>
                    <td><DeptTag id={i.dept} /></td>
                    <td className="num mono">{fmtMoney(i.amount)}</td>
                    <td className="muted">{i.due}</td>
                    <td>
                      <span className={"pill " + (i.status === "Paid" ? "success" : i.status === "Approved" ? "info" : "warn")}>
                        <span className="dot"></span>{i.status}
                      </span>
                    </td>
                    <td><button className="icon-btn">{ICONS.more}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "claims" && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="tbl">
              <thead><tr><th>ID</th><th>Member</th><th>Description</th><th>Department</th><th className="num">Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {CLAIMS.map(c => (
                  <tr key={c.id}>
                    <td className="mono">{c.id}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="av-md" style={{ width: 22, height: 22, fontSize: 9.5 }}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="muted">{c.desc}</td>
                    <td><DeptTag id={c.dept} /></td>
                    <td className="num mono">{fmtMoney(c.amount)}</td>
                    <td className="muted">{c.date}</td>
                    <td>
                      <span className={"pill " + (c.status === "Approved" ? "success" : "warn")}>
                        <span className="dot"></span>{c.status}
                      </span>
                    </td>
                    <td style={{ width: 80 }}>
                      {c.status === "Pending" ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn primary" style={{ padding: "2px 8px", fontSize: 11 }}>Approve</button>
                        </div>
                      ) : (
                        <button className="icon-btn">{ICONS.more}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "flow" && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Claim approval flow</h3></div>
          <div className="card-body">
            <div className="flow">
              <div className="flow-step done">
                <div className="step-num">1</div>
                <div className="step-title">Member submits</div>
                <div className="step-meta">Upload receipt + form</div>
                <div className="step-status">Avg 0.1 day</div>
              </div>
              <div className="flow-step done">
                <div className="step-num">2</div>
                <div className="step-title">Department Head reviews</div>
                <div className="step-meta">Checks against budget line</div>
                <div className="step-status">Avg 0.6 day</div>
              </div>
              <div className="flow-step current">
                <div className="step-num">3</div>
                <div className="step-title">Treasurer approves</div>
                <div className="step-meta">Jia Hui Chong</div>
                <div className="step-status">Avg 0.9 day</div>
              </div>
              <div className="flow-step">
                <div className="step-num">4</div>
                <div className="step-title">Disbursement</div>
                <div className="step-meta">UM ePay → bank transfer</div>
                <div className="step-status">Avg 2 days</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ TEAM (HR style) ============
function TeamView() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? ALL_MEMBERS : ALL_MEMBERS.filter(m => m.dept === filter);

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <h1 className="view-title">Team</h1>
          <p className="view-subtitle">{ALL_MEMBERS.length} committee members across {DEPTS.length} departments + High Committee</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn">Export roster</button>
          <button className="btn primary">{ICONS.plus} Add member</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KPI label="Active members" value={ALL_MEMBERS.length} delta="+6 vs 2026" deltaDir="up" />
        <KPI label="Avg performance" value={Math.round(ALL_MEMBERS.reduce((s,m)=>s+m.perf,0)/ALL_MEMBERS.length) + "%"} delta="MM dept leading at 89%" deltaDir="up" />
        <KPI label="Total tasks done" value={ALL_MEMBERS.reduce((s,m)=>s+m.done,0)} delta={"of " + ALL_MEMBERS.reduce((s,m)=>s+m.tasks,0)} />
        <KPI label="Total hours logged" value={ALL_MEMBERS.reduce((s,m)=>s+m.hours,0).toLocaleString() + " h"} delta="avg 116 h / member" />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button className="chip" style={filter === "All" ? { background: "var(--text)", color: "var(--text-inverse)" } : {}} onClick={() => setFilter("All")}>All · {ALL_MEMBERS.length}</button>
        <button className="chip" style={filter === "HC" ? { background: "var(--text)", color: "var(--text-inverse)" } : {}} onClick={() => setFilter("HC")}>High Committee · {ALL_MEMBERS.filter(m=>m.dept==="HC").length}</button>
        {DEPTS.map(d => {
          const c = ALL_MEMBERS.filter(m => m.dept === d.id).length;
          return <button key={d.id} className="chip" style={filter === d.id ? { background: "var(--text)", color: "var(--text-inverse)" } : {}} onClick={() => setFilter(d.id)}>{d.id} · {c}</button>;
        })}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Member</th><th>Role</th><th>Department</th><th>Year</th><th className="num">Tasks</th><th>Performance</th><th className="num">Hours</th><th></th></tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="av-md">{m.initials}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                        <div className="tiny muted">CS Y{m.year} · {m.initials.toLowerCase()}@um.edu.my</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.role}</td>
                  <td>{m.dept === "HC" ? <span className="dept-tag">HC</span> : <DeptTag id={m.dept} />}</td>
                  <td className="mono">Y{m.year}</td>
                  <td className="num mono">{m.done} / {m.tasks}</td>
                  <td style={{ width: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className={"bar " + (m.perf >= 90 ? "success" : m.perf >= 80 ? "" : "warn")} style={{ flex: 1 }}>
                        <span style={{ width: m.perf + "%" }} />
                      </div>
                      <span className="mono tiny" style={{ width: 32 }}>{m.perf}</span>
                    </div>
                  </td>
                  <td className="num mono">{m.hours}h</td>
                  <td><button className="icon-btn">{ICONS.more}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ APPROVALS ============
function ApprovalsView({ embedded }) {
  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-narrow">{props.children}</div>;
  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Approvals</h1>
            <p className="view-subtitle">Faculty → HEP → UM Central — protocol per UM event guidelines</p>
          </div>
          <button className="btn primary">{ICONS.plus} New approval</button>
        </div>
      )}

      <div className="col" style={{ gap: 14 }}>
        {APPROVALS.map(a => (
          <div key={a.id} className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{a.title}</h3>
                <p className="card-subtitle">{a.kind} · submitted {a.submitted}</p>
              </div>
              <span className={"pill " + (a.final ? "success" : a.stage >= 3 ? "info" : "warn")}>
                <span className="dot"></span>
                {a.final ? "Approved" : "Stage " + a.stage + " of 4"}
              </span>
            </div>
            <div className="card-body">
              <div className="flow">
                {APPROVAL_STAGES.map((s, i) => {
                  const stageNum = i + 1;
                  const done = stageNum < a.stage;
                  const current = stageNum === a.stage;
                  return (
                    <div key={i} className={"flow-step " + (a.final || done ? "done" : current && !a.final ? "current" : "")}>
                      <div className="step-num">{a.final || done ? <span style={{ display: "inline-flex" }}>{ICONS.check}</span> : stageNum}</div>
                      <div className="step-title">{s.name}</div>
                      <div className="step-meta">{s.desc}</div>
                      <div className="step-status">
                        {(a.final || done) ? "Approved" : current ? "In review" : "Awaiting"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

// ============ FILES (Drive-linked) ============
function FilesView({ embedded, currentUser }) {
  const [openFile, setOpenFile] = useState(null);
  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-wide">{props.children}</div>;
  const folders = [
    { name: "Sponsor Decks",         count: 8,  size: "164 MB", owner: "NI", dept: "SPR",  access: "internal" },
    { name: "Branding Assets",       count: 23, size: "412 MB", owner: "LM", dept: "MM",   access: "public" },
    { name: "Financial · Quotes",    count: 14, size: "32 MB",  owner: "JC", dept: "HC",   access: "finance" },
    { name: "Floor Plans",           count: 6,  size: "58 MB",  owner: "RK", dept: "LOGI", access: "internal" },
    { name: "Speaker Bios",          count: 11, size: "8 MB",   owner: "HI", dept: "PnP",  access: "internal" },
    { name: "Approvals & Forms",     count: 19, size: "24 MB",  owner: "FH", dept: "HC",   access: "internal" },
    { name: "🔒 Contest Protocol",   count: 7,  size: "12 MB",  owner: "AR", dept: "HC",   access: "protocol" },
    { name: "🔒 Jury Sealed Envelopes", count: 4, size: "2 MB", owner: "AR", dept: "HC",   access: "protocol" },
  ];
  const files = [
    { name: "MYTECH27_Platinum_Deck_v3.pdf",      dept: "SPR", who: "NI", when: "2h ago",     size: "12 MB",   access: "internal" },
    { name: "Atrium_Floor_v2.fig",                dept: "LOGI",who: "RK", when: "4h ago",     size: "1.8 MB",  access: "internal" },
    { name: "Logo_Final_MYTECH27.zip",            dept: "MM",  who: "LM", when: "6h ago",     size: "84 MB",   access: "public" },
    { name: "Maybank_MOU_Draft_v2.docx",          dept: "SPR", who: "KL", when: "yesterday",  size: "240 KB",  access: "confidential" },
    { name: "Sponsorship_Pipeline_Tracker.xlsx",  dept: "SPR", who: "NI", when: "yesterday",  size: "1.1 MB",  access: "internal" },
    { name: "Speaker_Bios_Industry_Talk.gdoc",    dept: "PnP", who: "HI", when: "2d ago",     size: "—",       access: "internal" },
    { name: "Budget_Revision_Q4.gsheet",          dept: "HC",  who: "JC", when: "2d ago",     size: "—",       access: "finance" },
    { name: "CodeSprint27_Jury_Rubric.pdf",       dept: "HC",  who: "AR", when: "3d ago",     size: "180 KB",  access: "protocol" },
    { name: "CodeSprint27_Winners_Sealed.pdf",    dept: "HC",  who: "AR", when: "3d ago",     size: "60 KB",   access: "protocol" },
  ];

  const role = ROLES[currentUser.role];
  const canRead = (lvl) => {
    if (lvl === "public") return true;
    return hasPermission(role, "files:read:" + lvl);
  };

  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Files</h1>
            <p className="view-subtitle">Linked Google Drive folder · auto-synced · per-file access control</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn">{ICONS.drive} Open in Drive</button>
            <button className="btn primary">{ICONS.plus} Upload</button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <h3 className="card-title">Folders</h3>
          <span className="muted tiny">{folders.length} folders · access filtered to your role ({role.label})</span>
        </div>
        <div className="card-body">
          <div className="grid grid-3">
            {folders.map((f, i) => {
              const locked = !canRead(f.access);
              return (
                <div key={i} style={{
                  padding: 14, border: "1px solid var(--border)", borderRadius: 8,
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.6 : 1,
                  background: locked ? "var(--bg)" : "var(--bg-elev)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="32" height="26" viewBox="0 0 32 26" fill="none">
                      <path d="M2 6c0-1.1.9-2 2-2h7l2.5 3H28a2 2 0 012 2v13a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="var(--accent-soft)" stroke="var(--border-strong)" />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                      <div className="tiny muted">{locked ? <>🔒 <strong style={{ color: "var(--danger)" }}>{f.access}-locked</strong></> : <>{f.count} files · {f.size}</>}</div>
                    </div>
                    <AccessPill level={f.access} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent activity</h3></div>
        <div className="card-body" style={{ padding: 0 }}>
          {files.map((f, i) => {
            const locked = !canRead(f.access);
            return (
              <div key={i} className="list-row" style={{ opacity: locked ? 0.5 : 1, cursor: locked ? "not-allowed" : "pointer" }}
                onClick={() => !locked && FILE_BLOBS[f.name] && setOpenFile(f.name)}>
                <div className="file-icon"></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{locked && "🔒 "}{f.name}</div>
                  <div className="tiny muted">{locked ? <>Access-restricted · <strong style={{ color: "var(--danger)" }}>{f.access}</strong></> : <>Updated by {f.who} · {f.when}</>}</div>
                </div>
                <DeptTag id={f.dept} />
                <AccessPill level={f.access} />
                <span className="tiny muted mono" style={{ width: 60, textAlign: "right" }}>{f.size}</span>
                <button className="icon-btn">{ICONS.more}</button>
              </div>
            );
          })}
        </div>
      </div>

      {openFile && <DocViewer filename={openFile} onClose={() => setOpenFile(null)} />}
    </Wrap>
  );
}

function AccessPill({ level }) {
  const map = {
    "public":       { c: "neutral", l: "Public" },
    "internal":     { c: "info",    l: "Internal" },
    "own-dept":     { c: "info",    l: "Dept-only" },
    "finance":      { c: "success", l: "Finance" },
    "confidential": { c: "warn",    l: "🔒 Confidential" },
    "protocol":     { c: "danger",  l: "🔒 Protocol" },
  };
  const m = map[level] || map.public;
  return <span className={"pill " + m.c} style={{ padding: "1px 7px", fontSize: 10 }}>{m.l}</span>;
}

Object.assign(window, { BudgetView, InvoicesView, TeamView, ApprovalsView, FilesView });
