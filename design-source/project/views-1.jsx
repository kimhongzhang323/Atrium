// views-1.jsx — Dashboard, Events list, Event detail

const ev27 = EVENTS.find(e => e.id === "mytech-2027");
const ev26 = EVENTS.find(e => e.id === "mytech-2026");

function fmtMoney(n, cur = "RM") {
  return cur + " " + n.toLocaleString("en-MY");
}

// ============ DASHBOARD ============
function DashboardView({ onNavigate }) {
  const pendingApprovals = APPROVALS.filter(a => !a.final).length;
  const openTasks = TASKS.filter(t => t.status !== "Done").length;
  const sponsorPct = Math.round((ev27.sponsorSecured / ev27.sponsorTarget) * 100);
  const regPct = Math.round((ev27.registrations.current / ev27.registrations.target) * 100);

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">{TODAY} · DIRECTOR VIEW</div>
          <h1 className="view-title">Good morning, Aisyah.</h1>
          <p className="view-subtitle">MYTECH 2027 is <strong style={{ color: "var(--text)" }}>{ev27.daysLeft} days</strong> away. Here's what needs you today.</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn">{ICONS.filter} Filter</button>
          <button className="btn primary" onClick={() => onNavigate("wizard")}>{ICONS.plus} New event</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <KPI
          label="Sponsor secured"
          value={fmtMoney(ev27.sponsorSecured)}
          delta={sponsorPct + "% of target"}
          deltaDir={sponsorPct >= 65 ? "up" : "down"}
          sub={"benchmark 65%"}
          spark={[12, 14, 16, 18, 18, 18, 18, 18.5]}
        />
        <KPI
          label="Budget committed"
          value={fmtMoney(ev27.budget.committed)}
          delta={Math.round((ev27.budget.committed / ev27.budget.total) * 100) + "% of " + fmtMoney(ev27.budget.total)}
          spark={[8, 14, 22, 30, 34, 38, 41, 42.5]}
        />
        <KPI
          label="Registrations"
          value={ev27.registrations.current.toLocaleString()}
          delta={regPct + "% of " + ev27.registrations.target.toLocaleString()}
          deltaDir="up"
          spark={[10, 40, 90, 150, 210, 280, 340, 412]}
        />
        <KPI
          label="Days to event"
          value={ev27.daysLeft}
          delta={"3-day event · " + ev27.venue.split(",")[0]}
          spark={[140, 130, 120, 110, 105, 100, 96, 92]}
          sparkColor="var(--warn)"
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Current event · {ev27.name}</h3>
              <p className="card-subtitle">Progress across all six departments</p>
            </div>
            <button className="btn ghost" onClick={() => onNavigate("event:" + ev27.id)}>Open {ICONS.arrow}</button>
          </div>
          <div className="card-body">
            {DEPTS.map(d => {
              const deptTasks = TASKS.filter(t => t.dept === d.id);
              const done = deptTasks.filter(t => t.status === "Done").length;
              const pct = deptTasks.length ? Math.round((done / deptTasks.length) * 100) : 0;
              return (
                <div key={d.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <DeptTag id={d.id} />
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{done} / {deptTasks.length} tasks</div>
                    <div style={{ fontSize: 12, fontWeight: 600, width: 36, textAlign: "right" }}>{pct}%</div>
                  </div>
                  <div className="bar"><span style={{ width: pct + "%" }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Needs your attention</h3>
              <span className="pill warn"><span className="dot"></span>{pendingApprovals + 2} items</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <AttentionRow icon="●" tone="danger" title="Brand Toolkit approval" sub="Blocking all PUB posts · waiting 6 days" />
              <AttentionRow icon="●" tone="warn" title="Maybank MOU draft" sub="Legal review · due Dec 15" />
              <AttentionRow icon="●" tone="info" title="Volunteer recruitment kickoff" sub="40 needed · 0 posted" />
              <AttentionRow icon="●" tone="info" title="MDEC grant deadline approaching" sub="Application closes Jan 10" />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Activity</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <ActivityRow init="NI" name="Nurul Izzati" verb="signed Maybank Platinum" detail="RM 25,000" time="2h" />
              <ActivityRow init="DP" name="Daniyal Putra" verb="pushed website MVP" detail="staging.mytech2027.um.edu.my" time="4h" />
              <ActivityRow init="LM" name="Lee Sze Min" verb="uploaded final logo" detail="MYTECH27_logo_v4.zip" time="6h" />
              <ActivityRow init="RK" name="Rajesh Kumar" verb="updated floor plan" detail="Atrium · v2" time="1d" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department workload</h3>
            <span className="muted tiny">Open tasks this week</span>
          </div>
          <div className="card-body">
            {DEPTS.map(d => {
              const open = TASKS.filter(t => t.dept === d.id && t.status !== "Done").length;
              const max = 8;
              return (
                <div key={d.id} className="perf-row">
                  <span className="perf-label"><DeptTag id={d.id} /></span>
                  <div className="bar"><span style={{ width: Math.min(100, (open / max) * 100) + "%" }} /></div>
                  <span className="perf-val">{open}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">2026 vs 2027 trajectory</h3>
            <span className="muted tiny">At equivalent week (T-13)</span>
          </div>
          <div className="card-body">
            <CompareRow label="Sponsor secured" a="RM 26,000" b="RM 18,500" pct={-29} />
            <CompareRow label="Registrations"   a="180"        b="412"        pct={129} />
            <CompareRow label="Tasks completed" a="62"         b="71"         pct={15} />
            <CompareRow label="Approvals cleared" a="2 / 4"    b="3 / 4"      pct={50} />
            <CompareRow label="Days from kickoff" a="76"       b="68"         pct={-11} sub="(faster start)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AttentionRow({ tone, title, sub }) {
  return (
    <div className="list-row">
      <span className={"pill " + tone} style={{ padding: "2px 6px" }}>
        <span className="dot"></span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{sub}</div>
      </div>
      <button className="btn ghost" style={{ padding: "3px 8px" }}>Open</button>
    </div>
  );
}

function ActivityRow({ init, name, verb, detail, time }) {
  return (
    <div className="list-row">
      <div className="av-md">{init}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13 }}><strong style={{ fontWeight: 500 }}>{name}</strong> <span className="muted">{verb}</span></div>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{detail}</div>
      </div>
      <span className="muted tiny">{time}</span>
    </div>
  );
}

function CompareRow({ label, a, b, pct, sub }) {
  const up = pct >= 0;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 60px", padding: "8px 0", borderBottom: "1px solid var(--border)", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{label}</div>
      <div className="mono" style={{ color: "var(--text-tertiary)" }}>{a}</div>
      <div className="mono" style={{ fontWeight: 500 }}>{b}</div>
      <div style={{ textAlign: "right", fontSize: 11.5, fontWeight: 500, color: up ? "var(--success)" : "var(--danger)" }}>
        {up ? "↑" : "↓"} {Math.abs(pct)}%
        {sub && <div style={{ color: "var(--text-tertiary)", fontWeight: 400, fontSize: 10.5 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ============ EVENTS LIST ============
function EventsView({ onNavigate }) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <h1 className="view-title">Events</h1>
          <p className="view-subtitle">Active and past events organised through Atrium.</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div className="segmented">
            <button className="active">All</button>
            <button>Planning</button>
            <button>Live</button>
            <button>Past</button>
          </div>
          <button className="btn primary" onClick={() => onNavigate("wizard")}>{ICONS.plus} New event</button>
        </div>
      </div>

      <div className="grid grid-2">
        {EVENTS.map(e => (
          <div key={e.id} className="card" style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => onNavigate("event:" + e.id)}>
            <div style={{
              height: 92,
              background: e.id === "mytech-2027"
                ? "linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 100%)"
                : "linear-gradient(135deg, #86868b 0%, #c8c8cc 100%)",
              position: "relative",
              padding: 16,
              color: "white",
            }}>
              <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.06em" }}>{e.type.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>{e.code}</div>
              <span className={"pill " + e.statusKind} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.18)", color: "white" }}>
                <span className="dot"></span>{e.status}
              </span>
            </div>
            <div className="card-body">
              <div style={{ fontSize: 14, fontWeight: 500 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{e.venue} · {e.days} days</div>
              <div className="grid grid-3" style={{ marginTop: 14, gap: 12 }}>
                <Mini label="Budget"        v={fmtMoney(e.budget.total)} />
                <Mini label="Sponsor"       v={fmtMoney(e.sponsorSecured)} />
                <Mini label="Registrations" v={e.registrations.current.toLocaleString()} />
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5, color: "var(--text-secondary)" }}>
                  <span>Progress</span>
                  <span>{e.progress}%</span>
                </div>
                <div className="bar"><span style={{ width: e.progress + "%" }} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, v }) {
  return (
    <div>
      <div className="tiny muted" style={{ marginBottom: 2 }}>{label}</div>
      <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
    </div>
  );
}

// ============ EVENT DETAIL ============
function EventDetailView({ eventId, onNavigate }) {
  const e = EVENTS.find(x => x.id === eventId);
  const [tab, setTab] = useState("overview");

  if (!e) return <div className="view"><p>Event not found</p></div>;

  return (
    <div className="view view-wide">
      <div className="event-hero">
        <div className="event-hero-cover">{e.cover}</div>
        <div className="event-hero-meta">
          <div className="eyebrow">{e.code} · {e.type}</div>
          <h1>{e.name}</h1>
          <div className="event-hero-tags">
            <span className={"pill " + e.statusKind}><span className="dot"></span>{e.status}</span>
            <span className="pill neutral">{e.venue}</span>
            <span className="pill neutral">{e.startDate} → {e.endDate}</span>
            <span className="pill neutral">{e.days} days</span>
            {e.daysLeft > 0 && <span className="pill info"><span className="dot"></span>T-{e.daysLeft} days</span>}
          </div>
        </div>
        <div className="event-hero-actions">
          <button className="btn ghost">Share</button>
          <button className="btn">Export report</button>
          <button className="btn primary">Open command center</button>
        </div>
      </div>

      <div className="tabs">
        {[
          { id: "overview",  label: "Overview" },
          { id: "tasks",     label: "Tasks", badge: TASKS.filter(t=>t.status!=="Done").length },
          { id: "timeline",  label: "Timeline" },
          { id: "org",       label: "Org Chart" },
          { id: "sponsors",  label: "Sponsors", badge: SPONSORS.length },
          { id: "budget",    label: "Budget" },
          { id: "approvals", label: "Approvals" },
          { id: "files",     label: "Files" },
          { id: "report",    label: "Report & SWOT" },
        ].map(t => (
          <button key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}
            {t.badge != null && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === "overview"  && <EventOverview e={e} onNavigate={onNavigate} />}
      {tab === "tasks"     && <TasksView embedded />}
      {tab === "timeline"  && <TimelineView embedded e={e} />}
      {tab === "org"       && <OrgView embedded />}
      {tab === "sponsors"  && <SponsorsView embedded />}
      {tab === "budget"    && <BudgetView embedded e={e} />}
      {tab === "approvals" && <ApprovalsView embedded />}
      {tab === "files"     && <FilesView embedded />}
      {tab === "report"    && <ReportsView embedded e={e} />}
    </div>
  );
}

function EventOverview({ e }) {
  const sponsorPct = Math.round((e.sponsorSecured / e.sponsorTarget) * 100);
  return (
    <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
      <div className="col">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Phases · Career Fair template</h3>
            <span className="muted tiny">Suggested by Atrium AI</span>
          </div>
          <div className="card-body">
            {TIMELINE_TEMPLATE.map((p, i) => {
              const done = i < 2, current = i === 2;
              return (
                <div key={p.phase} style={{ display: "grid", gridTemplateColumns: "120px 110px 1fr 32px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {done && <span className="pill success" style={{ marginRight: 8, padding: "0px 6px" }}><span className="dot"></span></span>}
                    {current && <span className="pill info" style={{ marginRight: 8, padding: "0px 6px" }}><span className="dot live-dot"></span></span>}
                    {p.phase}
                  </div>
                  <div className="mono muted">{p.weeks}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{p.tasks.slice(0,2).join(" · ")}<span className="muted"> · +{p.tasks.length - 2} more</span></div>
                  <div style={{ textAlign: "right" }}><button className="icon-btn">{ICONS.arrow}</button></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Departments</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="tbl">
              <thead><tr><th>Department</th><th>Leads</th><th>Supervisor</th><th>Tasks</th><th>Progress</th></tr></thead>
              <tbody>
                {DEPTS.map(d => {
                  const t = TASKS.filter(x => x.dept === d.id);
                  const done = t.filter(x => x.status === "Done").length;
                  const pct = t.length ? Math.round(done / t.length * 100) : 0;
                  return (
                    <tr key={d.id}>
                      <td><DeptTag id={d.id} /> <span style={{ marginLeft: 6, fontWeight: 500 }}>{d.name}</span></td>
                      <td><AvatarStack ids={DEPT_LEADS[d.id].map(l => l.init)} /></td>
                      <td className="muted">{d.supervisor}</td>
                      <td className="mono">{done} / {t.length}</td>
                      <td style={{ width: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="bar" style={{ flex: 1 }}><span style={{ width: pct + "%" }} /></div>
                          <span className="mono tiny" style={{ width: 26 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Numbers</h3>
          </div>
          <div className="card-body">
            <BigRow label="Budget" v1={fmtMoney(e.budget.committed)} v2={"of " + fmtMoney(e.budget.total)} pct={Math.round(e.budget.committed / e.budget.total * 100)} />
            <BigRow label="Sponsor" v1={fmtMoney(e.sponsorSecured)} v2={"of " + fmtMoney(e.sponsorTarget)} pct={sponsorPct} tone={sponsorPct < 50 ? "warn" : "success"} />
            <BigRow label="Registrations" v1={e.registrations.current.toLocaleString()} v2={"of " + e.registrations.target.toLocaleString()} pct={Math.round(e.registrations.current / e.registrations.target * 100)} tone="success" />
            <BigRow label="Approvals" v1={"3"} v2={"of 4 stages"} pct={75} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick links</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <QuickLink icon={ICONS.drive}    label="Google Drive — MYTECH 2027" sub="42 files · synced 4m ago" />
            <QuickLink icon={ICONS.files}    label="UMPoint booking #UMP-23811" sub="Atrium · DKU3 · Mar 9–11" />
            <QuickLink icon={ICONS.sponsors} label="Sponsor master list"        sub="10 prospects · 4 signed" />
            <QuickLink icon={ICONS.reports}  label="MYTECH 2026 SWOT report"    sub="Reference · auto-applied" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BigRow({ label, v1, v2, pct, tone }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="muted tiny">{label}</div>
        <div className="mono tiny muted">{pct}%</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "2px 0 6px" }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em" }}>{v1}</div>
        <div className="muted tiny">{v2}</div>
      </div>
      <div className={"bar " + (tone || "")}><span style={{ width: Math.min(100, pct) + "%" }} /></div>
    </div>
  );
}
function QuickLink({ icon, label, sub }) {
  return (
    <div className="list-row">
      <span className="nav-icon">{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{sub}</div>
      </div>
      <span className="muted">{ICONS.arrow}</span>
    </div>
  );
}

Object.assign(window, { DashboardView, EventsView, EventDetailView, fmtMoney });
