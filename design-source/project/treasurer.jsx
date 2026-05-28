// treasurer.jsx — Atrium Finance Command Center
// A dedicated single-page experience for the Treasurer role.

const { useState, useMemo, useEffect } = React;

// ===== Finance-specific data =====

const BANK_ACCOUNTS = [
  { id: "main",  name: "Maybank Current · 5142-3091-***", balance: 38420, kind: "Operating" },
  { id: "savg",  name: "Maybank Savings · 5142-3015-***", balance: 12000, kind: "Reserve" },
  { id: "tng",   name: "Touch'n Go for Business",         balance:   620, kind: "Petty cash" },
];

// Sponsor receivables (with aging in days)
const SPONSOR_AR = [
  { name: "Maybank",      amount: 25000, invoiced: "Nov 28", days:  9, status: "Invoiced" },
  { name: "TM ONE",       amount: 12000, invoiced: "Nov 18", days: 19, status: "Invoiced" },
  { name: "Shopee",       amount:  7500, invoiced: "Oct 29", days: 39, status: "Invoiced" },
  { name: "AirAsia",      amount:  3500, invoiced: "Oct 02", days: 66, status: "Reminder sent" },
  { name: "GXBank",       amount: 12000, invoiced: "—",      days:  0, status: "Awaiting MOU" },
];

// 12-week cash flow (8 past + current + 3 forecast)
const CASHFLOW = [
  { week: "W-7", inflow: 0,     outflow:  680,  label: "Sep 22" },
  { week: "W-6", inflow: 0,     outflow:  420,  label: "Sep 29" },
  { week: "W-5", inflow: 0,     outflow:  220,  label: "Oct 06" },
  { week: "W-4", inflow: 0,     outflow: 1100,  label: "Oct 13" },
  { week: "W-3", inflow: 3500,  outflow:  840,  label: "Oct 20" },
  { week: "W-2", inflow: 7500,  outflow: 3200,  label: "Oct 27" },
  { week: "W-1", inflow: 0,     outflow: 1860,  label: "Nov 03" },
  { week: "W0",  inflow: 0,     outflow: 1240,  label: "Nov 10" },
  { week: "W1",  inflow: 0,     outflow: 2480,  label: "Nov 17", current: true },
  { week: "W2",  inflow: 25000, outflow: 4200,  label: "Nov 24", future: true },
  { week: "W3",  inflow: 12000, outflow: 5400,  label: "Dec 01", future: true },
  { week: "W4",  inflow: 22000, outflow: 6800,  label: "Dec 08", future: true },
];

// Pending approvals — combines invoices + claims needing treasurer signoff
const TREASURER_QUEUE = [
  { id: "INV-107", kind: "Invoice", who: "Universiti Malaya FM", desc: "Atrium booking — final",      amount: 5400, dept: "LOGI", priority: "high",   age: "2 days", needs: "Treasurer + Director (>RM5k)" },
  { id: "INV-108", kind: "Invoice", who: "Canva Pro (annual)",   desc: "Design suite — committee",    amount:  580, dept: "MM",   priority: "med",    age: "4 days", needs: "Treasurer" },
  { id: "INV-106", kind: "Invoice", who: "CafeKL Catering",      desc: "Committee meeting refresh",   amount:  420, dept: "PnP",  priority: "low",    age: "2 days", needs: "Treasurer" },
  { id: "CL-45",   kind: "Claim",   who: "Rajesh Kumar",          desc: "AV vendor warehouse survey", amount:  134, dept: "LOGI", priority: "low",    age: "1 day",  needs: "Treasurer" },
  { id: "CL-47",   kind: "Claim",   who: "Daniyal Putra",         desc: "Domain + hosting (12 mo)",   amount:  220, dept: "TECH", priority: "med",    age: "3 days", needs: "Treasurer" },
];

// Variance — actual+committed vs approved budget per dept
const VARIANCE = [
  { dept: "LOGI", budget: 22000, actualCommitted: 22500, label: "Venue & equipment" },
  { dept: "TECH", budget: 11000, actualCommitted:  8700, label: "Web, AV, IT" },
  { dept: "PnP",  budget: 14000, actualCommitted:  5400, label: "Speakers & program" },
  { dept: "MM",   budget:  9000, actualCommitted:  7300, label: "Branding & design" },
  { dept: "PUB",  budget:  8000, actualCommitted:  4600, label: "Marketing & ads" },
  { dept: "SPR",  budget:  6000, actualCommitted:  4600, label: "Sponsor servicing" },
  { dept: "HC",   budget:  8000, actualCommitted:  7600, label: "Admin · contingency" },
];

// Per-event P&L
const EVENT_PNL = [
  { id: "code-sprint-2027", code: "CODE SPRINT 2027", when: "Feb 13–14, 2027", revenue: 11500, expenses:  6800, committed: 14200, sponsorTarget: 18000, status: "On track" },
  { id: "mytech-2027",      code: "MYTECH 2027",      when: "Mar 9–11, 2027",  revenue: 18500, expenses: 18200, committed: 42500, sponsorTarget: 45000, status: "Watch" },
  { id: "mytech-2026",      code: "MYTECH 2026",      when: "Mar 10–12, 2026 · closed", revenue: 38200, expenses: 71240, committed: 71240, sponsorTarget: 40000, status: "Closed" },
];

// Recent ledger entries
const LEDGER = [
  { date: "Dec 02", acct: "5142-3091", desc: "Maybank · Sponsorship deposit",  dr: null,   cr: 25000, bal: 38420, ref: "MBB-77241" },
  { date: "Nov 30", acct: "5142-3091", desc: "PrintLab · Sponsor decks",        dr:  680,   cr: null,  bal: 13420, ref: "INV-105" },
  { date: "Nov 28", acct: "5142-3091", desc: "SoundTech · PA system deposit",   dr: 3200,   cr: null,  bal: 14100, ref: "INV-104" },
  { date: "Nov 26", acct: "5142-3091", desc: "Rajesh K. · Vendor survey claim", dr:  134,   cr: null,  bal: 17300, ref: "CL-45"  },
  { date: "Nov 22", acct: "5142-3091", desc: "Shopee · Silver tier deposit",    dr: null,   cr:  7500, bal: 17434, ref: "MBB-77198" },
  { date: "Nov 20", acct: "5142-3015", desc: "Faculty top-up (admin)",          dr: null,   cr:  5000, bal: 12000, ref: "FCSIT-FT-44" },
  { date: "Nov 18", acct: "5142-3091", desc: "TM ONE · Gold tier invoice issued", dr: null, cr: null,  bal: 9934,  ref: "AR-104" },
];

// Audit / approval log
const AUDIT_LOG = [
  { when: "Dec 04 14:22", who: "Jia Hui",  what: "Approved invoice INV-105 · PrintLab · RM 680",      kind: "approve" },
  { when: "Dec 04 11:08", who: "Arman",    what: "Approved claim CL-46 · Lee Sze Min · RM 89",        kind: "approve" },
  { when: "Dec 03 16:30", who: "Aisyah",   what: "Co-signed venue invoice INV-104 (over RM 5k rule)", kind: "approve" },
  { when: "Dec 03 09:11", who: "Atrium AI",what: "Flagged variance: LOGI committed at 102% of budget",kind: "flag" },
  { when: "Dec 02 18:44", who: "Jia Hui",  what: "Reconciled bank statement · Nov 2026",              kind: "reconcile" },
];

// ===== Helpers =====
const fmtM = (n) => "RM " + (n).toLocaleString("en-MY");
const fmtMS = (n) => (n < 0 ? "−RM " : "RM ") + Math.abs(n).toLocaleString("en-MY");
const totalBalance = BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
const totalPendingApproval = TREASURER_QUEUE.reduce((s, q) => s + q.amount, 0);
const arOutstanding = SPONSOR_AR.filter(s => s.status === "Invoiced" || s.status === "Reminder sent").reduce((s, x) => s + x.amount, 0);
const arOverdue = SPONSOR_AR.filter(s => s.days >= 30).reduce((s, x) => s + x.amount, 0);

// ===== Root =====
function TreasurerApp() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="fin-app">
      <FinSidebar tab={tab} setTab={setTab} />
      <div className="fin-main">
        <FinHeader tab={tab} />
        <div className="fin-view">
          {tab === "overview"  && <OverviewPanel  />}
          {tab === "approvals" && <ApprovalsPanel />}
          {tab === "ar"        && <ARPanel        />}
          {tab === "variance"  && <VariancePanel  />}
          {tab === "ledger"    && <LedgerPanel    />}
          {tab === "pnl"       && <PnLPanel       />}
        </div>
      </div>
    </div>
  );
}

// ===== Sidebar =====
function FinSidebar({ tab, setTab }) {
  const nav = [
    { section: "FINANCE" },
    { id: "overview",  label: "Overview",        ico: ICONS.dashboard },
    { id: "approvals", label: "Approval inbox",  ico: ICONS.approvals, badge: TREASURER_QUEUE.length, tone: "warn" },
    { id: "ar",        label: "Sponsor AR",      ico: ICONS.sponsors, badge: SPONSOR_AR.filter(s => s.days >= 30).length || null, tone: "danger" },
    { id: "variance",  label: "Variance",        ico: ICONS.reports },
    { id: "ledger",    label: "Bank ledger",     ico: ICONS.invoices },
    { id: "pnl",       label: "Event P&L",       ico: ICONS.events },
  ];

  return (
    <aside className="fin-side">
      <div className="fin-side-brand">
        <div className="brand-mark">A</div>
        <div className="label">Atrium Finance</div>
      </div>

      <div className="fin-bal-card">
        <div className="label">Total cash on hand</div>
        <div className="amt">{fmtM(totalBalance)}</div>
        <div className="split">
          {BANK_ACCOUNTS.map(a => (
            <div key={a.id} className="item">
              <div className="l">{a.kind}</div>
              <div className="v">{a.balance >= 1000 ? "RM " + (a.balance/1000).toFixed(1) + "k" : "RM " + a.balance}</div>
            </div>
          ))}
        </div>
        <div className="live"><span className="dot"></span> Bank sync · 4 min ago</div>
      </div>

      <div className="fin-side-nav">
        {nav.map((n, i) => n.section ? (
          <div key={i} className="fin-side-section">{n.section}</div>
        ) : (
          <div key={n.id} className={"fin-nav" + (tab === n.id ? " active" : "")} onClick={() => setTab(n.id)}>
            <span className="ico">{n.ico}</span>
            <span>{n.label}</span>
            {n.badge != null && <span className={"badge " + (n.tone || "")}>{n.badge}</span>}
          </div>
        ))}

        <div className="fin-side-section">TOOLS</div>
        <div className="fin-nav"><span className="ico">{ICONS.reports}</span> Generate report</div>
        <div className="fin-nav"><span className="ico">{ICONS.drive}</span> Export to Sheets</div>
        <div className="fin-nav"><span className="ico">{ICONS.files}</span> Audit log</div>

        <div className="fin-side-section">EVENTS</div>
        {EVENT_PNL.map(e => (
          <div key={e.id} className="fin-nav">
            <span className="ico" style={{ width: 8, height: 8, borderRadius: 99, background: e.status === "Closed" ? "var(--text-tertiary)" : e.status === "Watch" ? "var(--warn)" : "var(--success)" }}></span>
            <span style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.code}</span>
          </div>
        ))}
      </div>

      <div className="fin-side-foot">
        <a href="Atrium.html">← Back to Atrium</a>
      </div>
    </aside>
  );
}

// ===== Header =====
function FinHeader({ tab }) {
  const labels = {
    overview: "Overview",
    approvals: "Approval inbox",
    ar: "Sponsor receivables",
    variance: "Variance vs budget",
    ledger: "Bank ledger",
    pnl: "Event P&L",
  };
  return (
    <div className="fin-head">
      <div className="crumb"><span>Treasurer</span><span className="sep">›</span><strong style={{ color: "var(--text)" }}>{labels[tab]}</strong></div>
      <div className="right">
        <span className="fin-asof"><span className="live-dot"></span>FY2026 · Nov closed · Dec open · live · {TODAY}</span>
        <button className="btn">Reconcile</button>
        <button className="btn primary">Close month</button>
      </div>
    </div>
  );
}

// ===== Overview =====
function OverviewPanel() {
  const monthInflow  = CASHFLOW.slice(-5, -3).reduce((s, c) => s + c.inflow, 0);
  const monthOutflow = CASHFLOW.slice(-5, -3).reduce((s, c) => s + c.outflow, 0);
  const net = monthInflow - monthOutflow;

  return (
    <>
      {/* Cash strip */}
      <div className="cash-strip">
        <div className="cash-card primary">
          <div className="eyebrow">Available cash · all accounts</div>
          <div className="big">{fmtM(totalBalance)}</div>
          <div className="split">
            {BANK_ACCOUNTS.map(a => (
              <div key={a.id} className="item">
                <div className="l">{a.kind}</div>
                <div className="v">{fmtM(a.balance).replace("RM ", "RM ")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cash-card">
          <div className="eyebrow">Awaiting your approval</div>
          <div className="big">{fmtM(totalPendingApproval)}</div>
          <div className="sub">{TREASURER_QUEUE.length} items · oldest 4 days</div>
          <div className="delta down">↑ +RM 1,654 vs yesterday</div>
        </div>

        <div className="cash-card">
          <div className="eyebrow">Sponsor receivables</div>
          <div className="big">{fmtM(arOutstanding)}</div>
          <div className="sub">{SPONSOR_AR.filter(s => s.days > 0).length} invoices outstanding</div>
          <div className="delta down">{fmtM(arOverdue)} aged 30d+</div>
        </div>

        <div className="cash-card">
          <div className="eyebrow">Forecast runway</div>
          <div className="big">8 weeks</div>
          <div className="sub">Before sponsor settle, accounting for Dec commitments</div>
          <div className="delta up">↑ extends to 16 weeks after Maybank settles</div>
        </div>
      </div>

      {/* Month-close prompt */}
      <div className="month-close-banner">
        <div className="icon">!</div>
        <div className="body">
          <b>Nov 2026 ready to close.</b>{" "}
          <span className="dim">3 unreconciled items remain (RM 240). Atrium auto-matched the rest. Close runs Treasurer + Director double-signoff.</span>
        </div>
        <button className="btn">Review unreconciled</button>
        <button className="btn primary">Run close</button>
      </div>

      {/* Cash flow chart */}
      <div className="cashflow" style={{ marginTop: 12 }}>
        <div className="cashflow-head">
          <div>
            <h3>Weekly cash flow · last 8 weeks + 3-week forecast</h3>
            <div className="fin-section-head sub" style={{ marginTop: 2 }}>Greens = inflow · Reds = outflow · Striped = forecast</div>
          </div>
          <div className="legend">
            <span><span className="legend-dot" style={{ background: "var(--success)" }}></span> Inflow</span>
            <span><span className="legend-dot" style={{ background: "var(--danger)" }}></span> Outflow</span>
            <span><span className="legend-dot" style={{ background: "var(--accent-soft)", border: "1px dashed var(--border-strong)" }}></span> Forecast</span>
          </div>
        </div>
        <CashFlowChart data={CASHFLOW} />
      </div>

      {/* Approvals + AR */}
      <div className="fin-grid-2" style={{ marginTop: 12 }}>
        <div className="fin-section">
          <div className="fin-section-head">
            <div>
              <h3>Approval inbox</h3>
              <div className="sub">Items waiting on you · ordered by age</div>
            </div>
            <div className="actions">
              <button className="btn tiny">Bulk approve</button>
              <button className="btn tiny">Filter</button>
            </div>
          </div>
          {TREASURER_QUEUE.slice(0, 5).map(q => (
            <ApprovalRow key={q.id} q={q} />
          ))}
        </div>

        <div className="fin-section">
          <div className="fin-section-head">
            <div>
              <h3>Sponsor AR aging</h3>
              <div className="sub">{fmtM(arOutstanding)} outstanding</div>
            </div>
            <button className="btn tiny">Send reminders</button>
          </div>
          <div style={{ padding: 14 }}>
            <ARAging />
            {SPONSOR_AR.filter(s => s.status === "Invoiced" || s.status === "Reminder sent").slice(0, 4).map((s, i) => (
              <div key={i} className="ar-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div className="name">{s.name}</div>
                <div><span className="pill neutral" style={{ fontSize: 10 }}>{s.status}</span></div>
                <div className="amt">{fmtM(s.amount)}</div>
                <div className="days">{s.days}d ago</div>
                <button className="btn ghost tiny">Chase</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Variance + P&L */}
      <div className="fin-grid-2" style={{ marginTop: 12 }}>
        <div className="fin-section">
          <div className="fin-section-head">
            <div>
              <h3>Variance vs approved budget</h3>
              <div className="sub">Committed + actual against locked Nov 14 budget · MYTECH 2027</div>
            </div>
            <button className="btn tiny">Open budget</button>
          </div>
          {VARIANCE.map(v => <VarianceRow key={v.dept} v={v} />)}
        </div>

        <div className="fin-section">
          <div className="fin-section-head">
            <div>
              <h3>Event P&L snapshot</h3>
              <div className="sub">Revenue − expenses, by event</div>
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <div className="pnl-grid">
              {EVENT_PNL.map(e => <PnLMiniCard key={e.id} e={e} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger + Audit */}
      <div className="fin-grid-2" style={{ marginTop: 12, gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="fin-section">
          <div className="fin-section-head">
            <div>
              <h3>Recent bank activity</h3>
              <div className="sub">Auto-imported from Maybank · BizConnect</div>
            </div>
            <button className="btn tiny">Open full ledger</button>
          </div>
          <div className="ledger" style={{ border: "none", borderRadius: 0 }}>
            <div className="ledger-row head">
              <div>Date</div><div>Description</div><div className="acct">Account</div><div style={{ textAlign: "right" }}>Debit</div><div style={{ textAlign: "right" }}>Credit</div><div style={{ textAlign: "right" }}>Balance</div>
            </div>
            {LEDGER.slice(0, 6).map((l, i) => (
              <div key={i} className="ledger-row">
                <div className="date">{l.date}</div>
                <div>{l.desc}<div className="dim" style={{ fontSize: 11 }}>{l.ref}</div></div>
                <div className="acct">{l.acct}</div>
                <div className="amt dr">{l.dr ? fmtM(l.dr) : "—"}</div>
                <div className="amt cr">{l.cr ? fmtM(l.cr) : "—"}</div>
                <div className="bal">{fmtM(l.bal)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="fin-section">
          <div className="fin-section-head">
            <div>
              <h3>Audit & approval log</h3>
              <div className="sub">Last 24 hours · immutable</div>
            </div>
          </div>
          {AUDIT_LOG.map((a, i) => (
            <div key={i} className="audit-row">
              <div className="when">{a.when}</div>
              <div className="what">
                <span className={"pill " + (a.kind === "approve" ? "success" : a.kind === "flag" ? "warn" : "neutral")} style={{ fontSize: 10, marginRight: 6 }}>
                  {a.kind}
                </span>
                {a.what}
              </div>
              <div className="who">by {a.who}</div>
              <div><button className="btn ghost tiny">View</button></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ===== Cash flow chart =====
function CashFlowChart({ data }) {
  const max = Math.max(...data.map(d => Math.max(d.inflow, d.outflow))) || 1;
  return (
    <>
      <div className="cashflow-chart">
        <div className="cf-zero-line" style={{ top: "50%" }}></div>
        <div className="cf-zero-label" style={{ top: "50%" }}>RM 0</div>
        {data.map((d, i) => (
          <div key={i} className={"cf-col " + (d.current ? "now " : "") + (d.future ? "future" : "")}>
            <div className="cf-half top">
              <div className="cf-bar"     style={{ height: (d.inflow  / max * 100) + "%" }} />
            </div>
            <div className="cf-half bot">
              <div className="cf-bar out" style={{ height: (d.outflow / max * 100) + "%" }} />
            </div>
            <div className="cf-tip">
              {d.label} · in {fmtM(d.inflow)} · out {fmtM(d.outflow)}{d.future ? " (forecast)" : ""}
            </div>
          </div>
        ))}
      </div>
      <div className="cashflow-axis" style={{ marginTop: 6 }}>
        {data.map((d, i) => <div key={i}>{d.label}</div>)}
      </div>
    </>
  );
}

// ===== Approval row =====
function ApprovalRow({ q }) {
  const [state, setState] = useState("pending"); // pending | approved | rejected
  if (state === "approved") return (
    <div className="approve-card" style={{ background: "var(--success-soft)", opacity: 0.85 }}>
      <div className="avatar" style={{ background: "var(--success)", color: "white" }}>{ICONS.check}</div>
      <div>
        <div className="title">{q.who} · <span className="dim">{q.desc}</span></div>
        <div className="meta">Approved · {q.id}</div>
      </div>
      <div></div>
      <div className="amt success-text">{fmtM(q.amount)}</div>
      <div></div>
    </div>
  );
  return (
    <div className="approve-card">
      <div className="avatar">{q.kind === "Invoice" ? "₹" : "↺"}</div>
      <div>
        <div className="title">{q.who}</div>
        <div className="meta">
          <DeptTag id={q.dept} /> · {q.desc} · <span className="dim">{q.id} · {q.age}</span>
        </div>
      </div>
      <span className={"pill " + (q.priority === "high" ? "danger" : q.priority === "med" ? "warn" : "neutral")} style={{ fontSize: 10 }}>
        <span className="dot" />{q.priority}
      </span>
      <div className="amt">{fmtM(q.amount)}</div>
      <div className="actions">
        <button className="btn reject tiny" onClick={() => setState("rejected")}>Reject</button>
        <button className="btn approve tiny" onClick={() => setState("approved")}>Approve</button>
      </div>
    </div>
  );
}

// ===== AR aging buckets =====
function ARAging() {
  const buckets = [
    { label: "Current",    range: "0–14 d",  test: (s) => s.days > 0 && s.days <= 14, tone: "good" },
    { label: "Watch",      range: "15–29 d", test: (s) => s.days > 14 && s.days <= 29, tone: "" },
    { label: "Overdue",    range: "30–59 d", test: (s) => s.days >= 30 && s.days < 60, tone: "warn" },
    { label: "Past due",   range: "60+ d",   test: (s) => s.days >= 60, tone: "bad" },
  ].map(b => {
    const items = SPONSOR_AR.filter(b.test);
    return { ...b, value: items.reduce((s, x) => s + x.amount, 0), count: items.length };
  });

  return (
    <div className="ar-aging" style={{ marginBottom: 14 }}>
      {buckets.map(b => (
        <div key={b.label} className={"ar-bucket " + b.tone}>
          <div className="l">{b.label}</div>
          <div className="v">{fmtM(b.value)}</div>
          <div className="sub">{b.count} · {b.range}</div>
        </div>
      ))}
    </div>
  );
}

// ===== Variance row =====
function VarianceRow({ v }) {
  const variance = v.actualCommitted - v.budget;
  const pct = (variance / v.budget) * 100;
  const isOver = variance > 0;
  // bar visualization centered at 50%
  const offsetMagnitude = Math.min(Math.abs(pct), 50);
  const fillStyle = isOver
    ? { left: "50%",                       width: offsetMagnitude + "%", background: "var(--danger)" }
    : { right: "50%",                      width: offsetMagnitude + "%", background: "var(--success)" };

  return (
    <div className="variance-row">
      <DeptTag id={v.dept} />
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{v.label}</div>
        <div className="dim" style={{ fontSize: 11 }}>Budget {fmtM(v.budget)} · Committed {fmtM(v.actualCommitted)}</div>
      </div>
      <div className="vbar">
        <div className="mid"></div>
        <div className="fill" style={fillStyle}></div>
      </div>
      <div className={"pct " + (isOver ? "up" : "down")} style={{ textAlign: "right" }}>
        {isOver ? "+" : "−"}{fmtMS(Math.abs(variance))}
      </div>
      <div className={"pct " + (isOver ? "up" : "down")}>
        {isOver ? "+" : ""}{pct.toFixed(1)}%
      </div>
    </div>
  );
}

// ===== P&L mini card =====
function PnLMiniCard({ e }) {
  const net = e.revenue - e.expenses;
  return (
    <div className="pnl-card">
      <div className="head">
        <div>
          <div className="ev-name">{e.code}</div>
          <div className="ev-when">{e.when}</div>
        </div>
        <span className={"pill " + (e.status === "Closed" ? "neutral" : e.status === "Watch" ? "warn" : "success")} style={{ fontSize: 10 }}>
          <span className="dot" />{e.status}
        </span>
      </div>
      <div className={"net " + (net > 0 ? "pos" : net < 0 ? "neg" : "zero")}>{fmtMS(net)}</div>
      <div className="dim" style={{ fontSize: 11, marginBottom: 8 }}>Net to date</div>
      <div className="pnl-row"><span>Revenue (received)</span><span className="v">{fmtM(e.revenue)}</span></div>
      <div className="pnl-row"><span>Expenses (paid)</span><span className="v">{fmtM(e.expenses)}</span></div>
      <div className="pnl-row"><span>Committed (unpaid)</span><span className="v">{fmtM(e.committed)}</span></div>
      <div className="pnl-row"><span>Sponsor target</span><span className="v">{fmtM(e.sponsorTarget)}</span></div>
    </div>
  );
}

// ===== Approvals full panel =====
function ApprovalsPanel() {
  return (
    <>
      <div className="cash-strip" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="cash-card">
          <div className="eyebrow">Pending count</div>
          <div className="big">{TREASURER_QUEUE.length}</div>
          <div className="sub">{TREASURER_QUEUE.filter(q => q.priority === "high").length} high priority</div>
        </div>
        <div className="cash-card">
          <div className="eyebrow">Total amount</div>
          <div className="big">{fmtM(totalPendingApproval)}</div>
          <div className="sub">Largest: INV-107 · RM 5,400</div>
        </div>
        <div className="cash-card">
          <div className="eyebrow">Oldest waiting</div>
          <div className="big">4 days</div>
          <div className="sub">SLA: 5 working days</div>
        </div>
      </div>

      <div className="fin-section" style={{ marginTop: 12 }}>
        <div className="fin-section-head">
          <div>
            <h3>All items awaiting your signoff</h3>
            <div className="sub">As Treasurer (Jia Hui Chong) — co-sign needed for items &gt; RM 5,000</div>
          </div>
          <div className="actions">
            <button className="btn tiny">All invoices</button>
            <button className="btn tiny">All claims</button>
            <button className="btn primary tiny">Bulk approve · RM &lt; 500</button>
          </div>
        </div>
        {TREASURER_QUEUE.map(q => <ApprovalRow key={q.id} q={q} />)}
      </div>
    </>
  );
}

// ===== AR panel =====
function ARPanel() {
  return (
    <>
      <div className="fin-section">
        <div className="fin-section-head">
          <div>
            <h3>Receivables aging</h3>
            <div className="sub">{fmtM(arOutstanding)} outstanding · {fmtM(arOverdue)} aged 30+ days</div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <ARAging />
          <div style={{ marginTop: 6 }}>
            <div className="ar-row" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", fontSize: 10.5, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>
              <div>Sponsor</div><div>Tier</div><div style={{ textAlign: "right" }}>Amount</div><div style={{ textAlign: "right" }}>Aged</div><div></div>
            </div>
            {SPONSOR_AR.map((s, i) => (
              <div key={i} className="ar-row">
                <div className="name">{s.name}<div className="dim" style={{ fontSize: 11 }}>Invoiced {s.invoiced}</div></div>
                <div><span className="pill neutral" style={{ fontSize: 10 }}>{s.status}</span></div>
                <div className="amt">{fmtM(s.amount)}</div>
                <div className="days" style={{ color: s.days >= 30 ? "var(--danger)" : s.days >= 15 ? "var(--warn)" : "var(--text-tertiary)" }}>{s.days}d</div>
                <div style={{ textAlign: "right" }}><button className="btn ghost tiny">Chase</button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ===== Variance panel =====
function VariancePanel() {
  const totalBudget = VARIANCE.reduce((s, v) => s + v.budget, 0);
  const totalCommitted = VARIANCE.reduce((s, v) => s + v.actualCommitted, 0);
  const totalVar = totalCommitted - totalBudget;

  return (
    <>
      <div className="cash-strip" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="cash-card">
          <div className="eyebrow">Approved budget</div>
          <div className="big">{fmtM(totalBudget)}</div>
        </div>
        <div className="cash-card">
          <div className="eyebrow">Committed + actual</div>
          <div className="big">{fmtM(totalCommitted)}</div>
        </div>
        <div className="cash-card" style={{ background: totalVar > 0 ? "var(--danger-soft)" : "var(--success-soft)", borderColor: "transparent" }}>
          <div className="eyebrow">Net variance</div>
          <div className="big" style={{ color: totalVar > 0 ? "var(--danger)" : "var(--success)" }}>{fmtMS(totalVar)}</div>
          <div className="sub">{totalVar > 0 ? "Over plan" : "Under plan"} by {((Math.abs(totalVar)/totalBudget)*100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="fin-section" style={{ marginTop: 12 }}>
        <div className="fin-section-head">
          <div><h3>By department</h3><div className="sub">Red bars push right of center · green bars left</div></div>
        </div>
        {VARIANCE.map(v => <VarianceRow key={v.dept} v={v} />)}
      </div>
    </>
  );
}

// ===== Ledger panel =====
function LedgerPanel() {
  const runningTotal = LEDGER.reduce((s, l) => s + (l.cr || 0) - (l.dr || 0), 0);
  return (
    <>
      <div className="cash-strip" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="cash-card">
          <div className="eyebrow">Bank balance</div>
          <div className="big">{fmtM(BANK_ACCOUNTS[0].balance)}</div>
          <div className="sub">{BANK_ACCOUNTS[0].name}</div>
        </div>
        <div className="cash-card">
          <div className="eyebrow">Net flow · this period</div>
          <div className="big" style={{ color: runningTotal > 0 ? "var(--success)" : "var(--danger)" }}>{fmtMS(runningTotal)}</div>
        </div>
        <div className="cash-card">
          <div className="eyebrow">Unreconciled items</div>
          <div className="big">3</div>
          <div className="sub">RM 240 · pending match</div>
        </div>
      </div>

      <div className="fin-section" style={{ marginTop: 12 }}>
        <div className="fin-section-head">
          <div><h3>Bank ledger · Maybank current account</h3><div className="sub">Auto-imported · double-entry · per UM audit standard</div></div>
          <div className="actions">
            <button className="btn tiny">Import statement</button>
            <button className="btn tiny">Export CSV</button>
          </div>
        </div>
        <div className="ledger" style={{ border: "none", borderRadius: 0 }}>
          <div className="ledger-row head">
            <div>Date</div><div>Description</div><div>Account</div><div style={{ textAlign: "right" }}>Debit</div><div style={{ textAlign: "right" }}>Credit</div><div style={{ textAlign: "right" }}>Balance</div>
          </div>
          {LEDGER.map((l, i) => (
            <div key={i} className="ledger-row">
              <div className="date">{l.date}</div>
              <div>{l.desc}<div className="dim" style={{ fontSize: 11 }}>{l.ref}</div></div>
              <div className="acct">{l.acct}</div>
              <div className="amt dr">{l.dr ? fmtM(l.dr) : "—"}</div>
              <div className="amt cr">{l.cr ? fmtM(l.cr) : "—"}</div>
              <div className="bal">{fmtM(l.bal)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ===== P&L panel =====
function PnLPanel() {
  return (
    <>
      <div className="fin-section">
        <div className="fin-section-head">
          <div><h3>Profit & loss · all events</h3><div className="sub">Net = revenue received − expenses paid. Committed shown separately.</div></div>
        </div>
        <div style={{ padding: 14 }}>
          <div className="pnl-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {EVENT_PNL.map(e => <PnLMiniCard key={e.id} e={e} />)}
          </div>
        </div>
      </div>

      <div className="fin-section" style={{ marginTop: 12 }}>
        <div className="fin-section-head">
          <div><h3>Consolidated · all open events</h3></div>
        </div>
        <div style={{ padding: 14 }}>
          {(() => {
            const open = EVENT_PNL.filter(e => e.status !== "Closed");
            const rev = open.reduce((s,e) => s+e.revenue, 0);
            const exp = open.reduce((s,e) => s+e.expenses, 0);
            const com = open.reduce((s,e) => s+e.committed, 0);
            return (
              <div className="grid grid-4" style={{ gap: 10 }}>
                <Stat l="Open events" v={open.length} />
                <Stat l="Revenue received" v={fmtM(rev)} tone="success" />
                <Stat l="Expenses paid" v={fmtM(exp)} />
                <Stat l="Committed unpaid" v={fmtM(com)} tone="warn" />
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}

function Stat({ l, v, tone }) {
  return (
    <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)" }}>
      <div className="dim" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{l}</div>
      <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, fontVariantNumeric: "tabular-nums", color: tone === "success" ? "var(--success)" : tone === "warn" ? "var(--warn)" : "var(--text)" }}>{v}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TreasurerApp />);
