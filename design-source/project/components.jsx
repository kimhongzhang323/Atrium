// components.jsx — shared UI building blocks

const { useState, useMemo, useEffect } = React;

// ===== Sidebar =====
function Sidebar({ active, onNavigate, currentUser }) {
  const role = ROLES[currentUser.role];
  const can = (p) => hasPermission(role, p);

  const sections = [
    {
      title: "WORKSPACE",
      items: [
        { id: "dashboard", label: "Dashboard",   icon: ICONS.dashboard, perm: "view:dashboard" },
        { id: "events",    label: "Events",      icon: ICONS.events,    perm: "view:events", badge: EVENTS.length },
        { id: "tasks",     label: "Tasks",       icon: ICONS.tasks,     perm: "view:tasks", badge: TASKS.filter(t=>t.status!=="Done").length },
        { id: "timeline",  label: "Timeline",    icon: ICONS.timeline,  perm: "view:timeline" },
        { id: "registration", label: "Registration", icon: ICONS.team,  perm: "view:registration", badge: "10" },
        { id: "approvals", label: "Approvals",   icon: ICONS.approvals, perm: "view:approvals", badge: APPROVALS.filter(a=>!a.final).length },
      ],
    },
    {
      title: "PEOPLE & PARTNERS",
      items: [
        { id: "org",       label: "Org Chart",   icon: ICONS.org,      perm: "view:org" },
        { id: "team",      label: "Team",        icon: ICONS.team,     perm: "view:team" },
        { id: "sponsors",  label: "Sponsors",    icon: ICONS.sponsors, perm: "view:sponsors" },
      ],
    },
    {
      title: "MONEY & ASSETS",
      items: [
        { id: "budget",    label: "Budget",      icon: ICONS.budget,   perm: "view:budget" },
        { id: "invoices",  label: "Invoices & Claims", icon: ICONS.invoices, perm: "view:invoices", badge: INVOICES.filter(i=>i.status==="Pending").length + CLAIMS.filter(c=>c.status==="Pending").length },
        { id: "inventory", label: "Inventory",   icon: ICONS.files,    perm: "view:events", badge: INVENTORY.length },
      ],
    },
    {
      title: "DEDICATED CONSOLES",
      items: [
        { id: "ext:Treasurer.html", label: "Treasurer console", icon: ICONS.budget, perm: "view:budget", external: true },
        { id: "ext:Secretary.html", label: "Secretary office",  icon: ICONS.files,  perm: "view:dashboard", external: true },
        { id: "ext:Onboarding.html", label: "Onboarding",       icon: ICONS.team,   perm: "view:dashboard", external: true },
      ],
    },
    {
      title: "INSIGHTS",
      items: [
        { id: "reports",   label: "Reports & SWOT", icon: ICONS.reports, perm: "view:reports" },
        { id: "files",     label: "Files",          icon: ICONS.files,   perm: "view:files" },
        { id: "draw",      label: "Lucky Draw",     icon: ICONS.draw,    perm: "view:draw" },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">A</div>
        <div className="brand-name">Atrium</div>
        <div className="brand-org">FCSIT · UM</div>
      </div>
      <div className="sidebar-search">
        <div className="search-wrap">
          <span className="search-icon">{ICONS.search}</span>
          <input className="search-input" placeholder="Search events, tasks, people…" />
        </div>
      </div>
      <nav className="sidebar-nav">
        {sections.map((s) => {
          const visible = s.items.filter(it => can(it.perm));
          if (visible.length === 0) return null;
          return (
            <div key={s.title}>
              <div className="nav-section-title">{s.title}</div>
              {visible.map((it) => (
                <div
                  key={it.id}
                  className={"nav-item" + (active === it.id ? " active" : "")}
                  onClick={() => {
                    if (it.external) { window.location.href = it.id.replace("ext:", ""); return; }
                    onNavigate(it.id);
                  }}
                >
                  <span className="nav-icon">{it.icon}</span>
                  <span>{it.label}</span>
                  {it.external && (
                    <span className="nav-icon" style={{ marginLeft: "auto", width: 12, height: 12, color: "var(--text-tertiary)" }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2h8v8M14 2L6.5 9.5M11 14H3a1 1 0 01-1-1V5" />
                      </svg>
                    </span>
                  )}
                  {!it.external && it.badge != null && <span className="nav-badge">{it.badge}</span>}
                </div>
              ))}
            </div>
          );
        })}

        {can("view:events") && (
          <>
            <div className="nav-section-title">EVENTS</div>
            {EVENTS.map((e) => (
              <div
                key={e.id}
                className={"nav-item nav-event " + (e.status === "Planning" ? "planning" : e.status === "Completed" ? "past" : e.isCompetition ? "live" : "live")}
                onClick={() => onNavigate("event:" + e.id)}
              >
                <span className="nav-icon"></span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.code}</span>
                {e.isCompetition && <span className="nav-badge">comp</span>}
              </div>
            ))}
          </>
        )}
      </nav>
      <div className="sidebar-user" style={{ cursor: "pointer" }} onClick={() => onNavigate("profile")}>
        <div className="user-avatar" style={{ background: "linear-gradient(135deg, " + role.color + ", #88888c)" }}>{currentUser.initials}</div>
        <div className="user-meta" style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name">{currentUser.name}</div>
          <div className="user-role" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: role.color, display: "inline-block" }}></span>
            {role.label}
            {currentUser.protocol && <span style={{ color: "var(--danger)", marginLeft: 2 }}>🔒</span>}
          </div>
        </div>
        <button className="icon-btn" title="Profile">{ICONS.chevDown}</button>
      </div>
    </aside>
  );
}

// ===== Topbar =====
function Topbar({ trail, actions, onToggleRail, railOpen }) {
  return (
    <div className="topbar">
      <div className="topbar-trail">
        {trail.map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: "var(--text-tertiary)" }}>›</span>}
            {i === trail.length - 1 ? <strong>{t}</strong> : <span>{t}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        {actions}
        <button className="icon-btn" title="Notifications">{ICONS.bell}</button>
        <button className="icon-btn" title="Toggle AI rail" onClick={onToggleRail}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>
            <path d="M10 2.5v11"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ===== AI Rail =====
function AIRail({ onClose }) {
  const [insights, setInsights] = useState(INSIGHTS);
  const [composer, setComposer] = useState("");

  return (
    <aside className="rail">
      <div className="rail-header">
        <div className="ai-orb"></div>
        <div className="rail-title">Atrium Intelligence</div>
        <div style={{ flex: 1 }} />
        <span className="pill neutral live-dot">
          <span className="dot" style={{ background: "var(--success)" }}></span>
          live
        </span>
        <button className="icon-btn" onClick={onClose} title="Hide">{ICONS.close}</button>
      </div>
      <div className="rail-wrap">
        <div className="rail-body">
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 10, letterSpacing: "0.04em" }}>
            ANALYSIS · MYTECH 2027 · UPDATED 2m AGO
          </div>
          {insights.map((ins, i) => (
            <div key={i} className="insight">
              <div className="insight-head">
                <span style={{
                  color: ins.kind === "RISK" ? "var(--danger)" :
                         ins.kind === "OPPORTUNITY" ? "var(--success)" :
                         ins.kind === "TIMELINE" ? "var(--warn)" : "var(--info)"
                }}>● {ins.kind}</span>
              </div>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-body">{ins.body}</div>
              <div className="insight-actions">
                {ins.actions.map((a, j) => (
                  <button key={j} className="chip">{a}</button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", margin: "14px 0 8px", letterSpacing: "0.04em" }}>
            SUGGESTED FOR YOU
          </div>
          <div className="insight">
            <div className="insight-title" style={{ fontSize: 12.5 }}>📋 Generate a recovery plan for sponsor gap</div>
            <div className="insight-body" style={{ fontSize: 12 }}>
              I can draft a 14-day acceleration plan, prioritize stalled deals, and assign owners.
            </div>
            <div className="insight-actions">
              <button className="chip">Generate plan</button>
              <button className="chip">Show breakdown</button>
            </div>
          </div>

          <div className="insight">
            <div className="insight-title" style={{ fontSize: 12.5 }}>📈 Compare 2026 → 2027</div>
            <div className="insight-body" style={{ fontSize: 12 }}>
              Trajectory across budget, registrations, sponsors. Identifies 4 outperforming areas, 2 lagging.
            </div>
            <div className="insight-actions">
              <button className="chip">Open comparison</button>
            </div>
          </div>
        </div>
        <div className="rail-composer">
          <div className="composer">
            <input
              placeholder="Ask Atrium about this event…"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
            />
            <button className="send">{ICONS.send}</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ===== Sparkline =====
function Spark({ data, color }) {
  const w = 200, h = 36;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y];
  });
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const fill = line + ` L${w},${h} L0,${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path className="fill" d={fill} style={{ fill: color || "var(--accent-soft)" }} />
      <path d={line} style={{ stroke: color || "var(--text)" }} />
    </svg>
  );
}

// ===== KPI =====
function KPI({ label, value, delta, deltaDir, spark, sparkColor, sub }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className={"kpi-delta " + (deltaDir || "")}>
          {deltaDir === "up" ? "↑" : deltaDir === "down" ? "↓" : ""} {delta}
          {sub && <span style={{ color: "var(--text-tertiary)", marginLeft: 6 }}>{sub}</span>}
        </div>
      )}
      {spark && <div className="kpi-mini-chart"><Spark data={spark} color={sparkColor} /></div>}
    </div>
  );
}

// ===== Avatar stack =====
function AvatarStack({ ids, max = 4 }) {
  const show = ids.slice(0, max);
  const rest = ids.length - show.length;
  return (
    <div className="avatar-stack">
      {show.map((id, i) => {
        const m = ALL_MEMBERS.find(u => u.initials === id || u.id === id);
        return <div key={i} className="av" title={m?.name || id}>{m?.initials || id}</div>;
      })}
      {rest > 0 && <div className="av">+{rest}</div>}
    </div>
  );
}

function DeptTag({ id }) {
  return <span className={"dept-tag dept-" + id}>{id}</span>;
}

Object.assign(window, { Sidebar, Topbar, AIRail, KPI, Spark, AvatarStack, DeptTag });
