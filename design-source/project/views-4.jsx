// views-4.jsx — Reports & SWOT, Lucky Draw, Event Creation Wizard

// ============ REPORTS & SWOT ============
function ReportsView({ embedded, e }) {
  const ev = e || ev26;
  const [tab, setTab] = useState("swot");
  const Wrap = embedded ? React.Fragment : (props) => <div className="view view-wide">{props.children}</div>;

  return (
    <Wrap>
      {!embedded && (
        <div className="view-header">
          <div>
            <h1 className="view-title">Reports & SWOT</h1>
            <p className="view-subtitle">Atrium analyzes your post-event reports and feeds insights back into the next event.</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <select className="select" style={{ width: 180 }}>
              <option>MYTECH 2026 (completed)</option>
              <option>MYTECH 2025 (completed)</option>
            </select>
            <button className="btn">Export PDF</button>
            <button className="btn primary">Send to faculty</button>
          </div>
        </div>
      )}

      <div className="event-hero" style={{ marginBottom: 14 }}>
        <div className="event-hero-cover" style={{ background: "linear-gradient(135deg, #86868b, #c8c8cc)" }}>M26</div>
        <div className="event-hero-meta">
          <div className="eyebrow">POST-EVENT ANALYSIS · MYTECH 2026</div>
          <h1>Career Fair retrospective</h1>
          <div className="event-hero-tags">
            <span className="pill success"><span className="dot"></span>Verdict: succeeded with caveats</span>
            <span className="pill neutral">1,684 attendees · +12% vs target</span>
            <span className="pill warn">RM 71.2k spent · 4.8% over budget</span>
            <span className="pill info">38.2k sponsor secured · +27% vs target</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={"tab" + (tab === "swot" ? " active" : "")} onClick={() => setTab("swot")}>SWOT Analysis</button>
        <button className={"tab" + (tab === "advice" ? " active" : "")} onClick={() => setTab("advice")}>AI Advice for 2027</button>
        <button className={"tab" + (tab === "metrics" ? " active" : "")} onClick={() => setTab("metrics")}>Metrics</button>
        <button className={"tab" + (tab === "compare" ? " active" : "")} onClick={() => setTab("compare")}>Trajectory</button>
      </div>

      {tab === "swot" && (
        <>
          <div className="swot">
            <SwotCell kind="S" title="Strengths" items={SWOT_2026.S} />
            <SwotCell kind="W" title="Weaknesses" items={SWOT_2026.W} />
            <SwotCell kind="O" title="Opportunities" items={SWOT_2026.O} />
            <SwotCell kind="T" title="Threats" items={SWOT_2026.T} />
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="ai-orb"></div>
                <div>
                  <h3 className="card-title">Atrium's synthesis</h3>
                  <p className="card-subtitle">What the SWOT tells us in one sentence</p>
                </div>
              </div>
              <button className="btn ghost">Regenerate</button>
            </div>
            <div className="card-body" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              MYTECH 2026 <strong style={{ color: "var(--text)" }}>over-delivered on attendance and sponsor revenue</strong>, but <strong style={{ color: "var(--text)" }}>execution discipline slipped on Day 1</strong> — PA failure and a 4.8% budget overrun together signal that <strong style={{ color: "var(--text)" }}>technical redundancy planning and AV contingency budget</strong> are your two highest-leverage fixes for 2027. The biggest untapped opportunity is the alumni network: 4,200 contacts, 12 invited.
            </div>
          </div>
        </>
      )}

      {tab === "advice" && (
        <AdviceTab />
      )}

      {tab === "metrics" && (
        <MetricsTab />
      )}

      {tab === "compare" && (
        <CompareTab />
      )}
    </Wrap>
  );
}

function SwotCell({ kind, title, items }) {
  return (
    <div className={"swot-cell " + kind}>
      <h3>
        <span style={{
          width: 18, height: 18, borderRadius: 99, background: "currentColor", opacity: 0.18, display: "inline-grid", placeItems: "center"
        }}>
          <span style={{ color: "currentColor", fontWeight: 700, opacity: 1, fontSize: 11 }}>{kind}</span>
        </span>
        {title}
        <span style={{ marginLeft: "auto", color: "var(--text-tertiary)", fontWeight: 500 }}>{items.length}</span>
      </h3>
      <ul>
        {items.map((it, i) => (
          <li key={i}><b>{it.t}.</b> {it.d}</li>
        ))}
      </ul>
    </div>
  );
}

function AdviceTab() {
  const advice = [
    {
      pri: "High",
      title: "Lock backup AV vendor by T-6 weeks",
      basis: "Last year's PA failure (W) cost 20 min of opening ceremony.",
      action: "Atrium drafted a vendor spec sheet — review and assign to TECH.",
      owner: "DP",
    },
    {
      pri: "High",
      title: "Allocate RM 2,500 LOGI contingency line",
      basis: "Budget overrun was driven by emergency AV upgrade (W).",
      action: "Apply to budget revision; lock with treasurer.",
      owner: "JC",
    },
    {
      pri: "High",
      title: "Invite 200 CS alumni — early bird tier",
      basis: "Alumni network of 4,200 was the largest untapped opportunity (O).",
      action: "Connect alumni CRM; PUB to write outreach copy.",
      owner: "TW",
    },
    {
      pri: "Med",
      title: "MDEC grant — apply by Jan 10",
      basis: "Government-linked sponsors unclaimed (O); RM 8–15k available.",
      action: "SPR head to lead, treasurer reviews.",
      owner: "NI",
    },
    {
      pri: "Med",
      title: "Move registration to Atrium-hosted form, single source of truth",
      basis: "Fragmented Google Sheets caused 47 duplicates (W).",
      action: "TECH to deploy; PnP to migrate ownership.",
      owner: "AS",
    },
    {
      pri: "Med",
      title: "Lock down secondary venue (DKU3) immediately",
      basis: "FCSIT Atrium renovation rumored Q1 2027 (T).",
      action: "Direct UMPoint pre-block.",
      owner: "RK",
    },
    {
      pri: "Low",
      title: "Schedule 9 PUB posts in week T-2",
      basis: "Content cadence dropped pre-event (W); engagement fell 32%.",
      action: "Calendar template already drafted.",
      owner: "TW",
    },
  ];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div className="ai-orb"></div>
        <div style={{ fontSize: 13.5 }}>
          <strong>7 recommendations</strong> derived from MYTECH 2026 SWOT, prioritised against 2027's calendar.
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn">Apply all to plan</button>
      </div>
      <div className="col" style={{ gap: 10 }}>
        {advice.map((a, i) => (
          <div key={i} className="card">
            <div className="card-body" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 14 }}>
              <span className={"pill " + (a.pri === "High" ? "danger" : a.pri === "Med" ? "warn" : "neutral")}>{a.pri}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3 }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Why: </span>{a.basis}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Action: </span>{a.action}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="av-md">{a.owner}</div>
                <button className="btn">Apply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MetricsTab() {
  const m = [
    { label: "Attendance",            value: "1,684",     target: "1,500",    delta: "+12%",  good: true },
    { label: "Sponsor revenue",       value: "RM 38,200", target: "RM 30,000",delta: "+27%",  good: true },
    { label: "Budget utilization",    value: "104.8%",    target: "≤ 100%",   delta: "+4.8%", good: false },
    { label: "NPS — attendees",       value: "62",        target: "55",       delta: "+7",    good: true },
    { label: "NPS — sponsors",        value: "48",        target: "50",       delta: "-2",    good: false },
    { label: "Volunteer retention",   value: "72%",       target: "80%",      delta: "-8%",   good: false },
    { label: "Social media reach",    value: "184k",      target: "150k",     delta: "+23%",  good: true },
    { label: "Press mentions",        value: "11",        target: "8",        delta: "+3",    good: true },
  ];
  return (
    <div className="grid grid-4">
      {m.map((x, i) => (
        <div key={i} className="kpi">
          <div className="kpi-label">{x.label}</div>
          <div className="kpi-value">{x.value}</div>
          <div className={"kpi-delta " + (x.good ? "up" : "down")}>
            {x.good ? "↑" : "↓"} {x.delta} <span className="muted">vs target {x.target}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompareTab() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">2026 ➜ 2027 cumulative trajectory</h3>
        <span className="muted tiny">Aligned by weeks-to-event</span>
      </div>
      <div className="card-body">
        <TrajChart />
        <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 12, color: "var(--text-secondary)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 2, background: "var(--text-tertiary)", display: "inline-block" }}></span>2026 actuals
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 2, background: "var(--text)", display: "inline-block" }}></span>2027 to date
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 2, height: 12, background: "var(--danger)", display: "inline-block" }}></span>Today (T-13)
          </span>
        </div>
      </div>
    </div>
  );
}

function TrajChart() {
  // Sponsor trajectory, weeks T-26 to T-0
  const weeks = 26;
  const w = 760, h = 200, pad = 30;
  const e2026 = [0, 0, 500, 1200, 2400, 4500, 7000, 10000, 14000, 17000, 21000, 24000, 27500, 30200, 32500, 34000, 35500, 36500, 37200, 37800, 38000, 38200, 38200, 38200, 38200, 38200];
  const e2027 = [0, 0, 800, 2400, 5500, 8500, 11000, 13500, 15500, 17000, 17500, 18000, 18500];
  const max = 45000;
  const xAt = i => pad + (i / (weeks - 1)) * (w - pad * 2);
  const yAt = v => h - pad - (v / max) * (h - pad * 2);
  const path = arr => arr.map((v, i) => (i === 0 ? `M${xAt(i)},${yAt(v)}` : `L${xAt(i)},${yAt(v)}`)).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 240 }}>
      {/* grid */}
      {[0, 10000, 20000, 30000, 40000].map(v => (
        <g key={v}>
          <line x1={pad} x2={w - pad} y1={yAt(v)} y2={yAt(v)} stroke="var(--border)" />
          <text x={4} y={yAt(v) + 4} fontSize="10" fill="var(--text-tertiary)">{"RM " + (v / 1000) + "k"}</text>
        </g>
      ))}
      <line x1={xAt(13)} x2={xAt(13)} y1={pad} y2={h - pad} stroke="var(--danger)" strokeDasharray="2,2" />
      <text x={xAt(13) + 4} y={pad + 12} fontSize="10" fill="var(--danger)">today</text>
      {/* 2026 */}
      <path d={path(e2026)} fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" />
      {/* 2027 partial */}
      <path d={path(e2027)} fill="none" stroke="var(--text)" strokeWidth="2.2" />
      {/* target */}
      <line x1={pad} x2={w - pad} y1={yAt(45000)} y2={yAt(45000)} stroke="var(--success)" strokeDasharray="3,3" />
      <text x={w - pad - 90} y={yAt(45000) - 4} fontSize="10" fill="var(--success)">2027 target RM 45k</text>
      {/* x labels */}
      {[0, 5, 10, 15, 20, 25].map(i => (
        <text key={i} x={xAt(i) - 8} y={h - 8} fontSize="10" fill="var(--text-tertiary)">T-{weeks - 1 - i}</text>
      ))}
    </svg>
  );
}

// ============ LUCKY DRAW ============
function LuckyDrawView() {
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [reel, setReel] = useState("R0001");
  const intervalRef = React.useRef(null);

  const participants = [
    { id: "R0142", name: "Aliya Hassan",   ticket: "R0142", year: 2 },
    { id: "R0289", name: "Bryan Chong",    ticket: "R0289", year: 3 },
    { id: "R0413", name: "Cheryl Yap",     ticket: "R0413", year: 1 },
    { id: "R0584", name: "Daniel Iskandar",ticket: "R0584", year: 4 },
    { id: "R0712", name: "Erin Lai",       ticket: "R0712", year: 2 },
    { id: "R0866", name: "Faruq Razali",   ticket: "R0866", year: 3 },
  ];

  const prizes = [
    { tier: "Grand",  prize: "MacBook Air M4",       sponsor: "Maybank",   count: 1, drawn: 0 },
    { tier: "First",  prize: "iPad (10th gen)",      sponsor: "Petronas",  count: 2, drawn: 0 },
    { tier: "Second", prize: "AirPods Pro",          sponsor: "TM ONE",    count: 5, drawn: 1 },
    { tier: "Third",  prize: "Shopee voucher RM 100",sponsor: "Shopee",    count: 20, drawn: 6 },
  ];

  React.useEffect(() => {
    if (running) {
      let i = 0;
      intervalRef.current = setInterval(() => {
        setReel("R" + String(Math.floor(Math.random() * 9999)).padStart(4, "0"));
        i++;
      }, 60);
      setTimeout(() => {
        clearInterval(intervalRef.current);
        const pick = participants[Math.floor(Math.random() * participants.length)];
        setReel(pick.ticket);
        setWinner(pick);
        setRunning(false);
      }, 2400);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <h1 className="view-title">Lucky Draw</h1>
          <p className="view-subtitle">Sponsored prize draw — live for MYTECH 2027</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn">Export winners CSV</button>
          <button className="btn">Settings</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-header">
            <h3 className="card-title">Draw stage</h3>
            <span className="pill info"><span className="dot live-dot"></span>1,684 entries pooled</span>
          </div>
          <div style={{ padding: "40px 40px 30px", background: "linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%)", textAlign: "center" }}>
            <div className="eyebrow">DRAWING FOR</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>Second tier — AirPods Pro</div>
            <div className="muted tiny" style={{ marginTop: 2 }}>Sponsored by TM ONE · 1 of 5</div>

            <div style={{ margin: "40px auto 24px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {reel.split("").map((c, i) => (
                <div key={i} style={{
                  width: 64, height: 84, borderRadius: 14,
                  background: "var(--bg-elev)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow)",
                  fontSize: 44, fontWeight: 600, fontFamily: "var(--font-mono)",
                  display: "grid", placeItems: "center",
                  letterSpacing: "-0.02em",
                  transform: running ? "translateY(0)" : "none",
                }}>{c}</div>
              ))}
            </div>

            {winner && !running && (
              <div style={{ margin: "0 auto 18px", maxWidth: 360, padding: 14, background: "var(--success-soft)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div className="eyebrow" style={{ color: "var(--success)" }}>🎉 WINNER</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{winner.name}</div>
                <div className="muted tiny mono">Ticket {winner.ticket} · Year {winner.year}</div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button className="btn primary" disabled={running} onClick={() => { setWinner(null); setRunning(true); }}
                style={{ padding: "8px 22px", fontSize: 14, opacity: running ? 0.5 : 1 }}>
                {running ? "Drawing…" : winner ? "Draw next" : "Draw winner"}
              </button>
              {winner && !running && <button className="btn">Re-draw</button>}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Prizes</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {prizes.map((p, i) => (
                <div key={i} className="list-row">
                  <span className={"pill " + (p.tier === "Grand" ? "warn" : p.tier === "First" ? "info" : "neutral")} style={{ minWidth: 56, justifyContent: "center" }}>{p.tier}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.prize}</div>
                    <div className="tiny muted">Sponsored by {p.sponsor}</div>
                  </div>
                  <div className="mono tiny">{p.drawn} / {p.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Recent winners</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="list-row"><div className="av-md">CY</div><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>Cheryl Yap</div><div className="tiny muted">AirPods Pro · R0413</div></div><span className="muted tiny">just now</span></div>
              <div className="list-row"><div className="av-md">BC</div><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>Bryan Chong</div><div className="tiny muted">Shopee RM 100 · R0289</div></div><span className="muted tiny">2m</span></div>
              <div className="list-row"><div className="av-md">EL</div><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>Erin Lai</div><div className="tiny muted">Shopee RM 100 · R0712</div></div><span className="muted tiny">4m</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ WIZARD MODAL ============
function WizardModal({ onClose }) {
  const [step, setStep] = useState(1);
  const steps = [
    { num: 1, label: "Basics" },
    { num: 2, label: "Structure" },
    { num: 3, label: "Timeline" },
    { num: 4, label: "Budget" },
    { num: 5, label: "Approvals" },
    { num: 6, label: "Review" },
  ];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="eyebrow">EVENT CREATION WIZARD</div>
            <div className="modal-title">Create new event</div>
          </div>
          <button className="icon-btn" onClick={onClose}>{ICONS.close}</button>
        </div>

        <div style={{ padding: "16px 22px 0" }}>
          <div className="wizard-steps">
            {steps.map(s => (
              <div key={s.num} className={"wizard-step-tag " + (step === s.num ? "active" : step > s.num ? "done" : "")}>
                <span className="num">STEP {s.num}</span>
                <span className="label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-body">
          {step === 1 && <WizStep1 />}
          {step === 2 && <WizStep2 />}
          {step === 3 && <WizStep3 />}
          {step === 4 && <WizStep4 />}
          {step === 5 && <WizStep5 />}
          {step === 6 && <WizStep6 />}
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <div style={{ display: "flex", gap: 6 }}>
            {step > 1 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 6
              ? <button className="btn primary" onClick={() => setStep(step + 1)}>Continue</button>
              : <button className="btn primary" onClick={onClose}>Create event</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function WizStep1() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, padding: 14, background: "var(--accent-soft)", borderRadius: 10 }}>
        <div className="ai-orb" style={{ marginTop: 2 }}></div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Atrium will pre-populate timeline, departments, and budget skeleton based on the type you choose — using lessons from past events of the same kind.
        </div>
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label>Event name</label>
          <input className="input" defaultValue="MYTECH Career Fair 2028" />
        </div>
        <div className="field">
          <label>Event type</label>
          <select className="select" defaultValue="Career Fair">
            <option>Career Fair</option>
            <option>Conference</option>
            <option>Hackathon</option>
            <option>Workshop</option>
            <option>Industry Talk</option>
            <option>Student Carnival</option>
          </select>
          <div className="hint">3 past events match this type → template available</div>
        </div>
      </div>
      <div className="grid grid-3">
        <div className="field">
          <label>Start date</label>
          <input className="input" type="text" defaultValue="2028-03-08" />
        </div>
        <div className="field">
          <label>End date</label>
          <input className="input" type="text" defaultValue="2028-03-10" />
        </div>
        <div className="field">
          <label>Days</label>
          <input className="input" defaultValue="3" />
        </div>
      </div>
      <div className="field">
        <label>Venue</label>
        <input className="input" defaultValue="FCSIT, Universiti Malaya" />
        <div className="hint">UMPoint booking will be created when you confirm</div>
      </div>
      <div className="field">
        <label>One-line description</label>
        <textarea className="textarea" defaultValue="Annual 3-day tech career fair connecting CS students with industry employers." />
      </div>
    </div>
  );
}

function WizStep2() {
  return (
    <div>
      <p className="muted" style={{ marginBottom: 14 }}>Atrium has pre-suggested departments based on Career Fair template. Adjust as needed.</p>
      <div className="grid grid-2">
        {DEPTS.map(d => (
          <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
            <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
            <DeptTag id={d.id} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
              <div className="tiny muted">Reports to: {d.supervisor}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="field" style={{ marginTop: 18 }}>
        <label>Director / Program Advisor</label>
        <input className="input" defaultValue="Aisyah Rahman · Dr. Tan H.W." />
      </div>
    </div>
  );
}

function WizStep3() {
  return (
    <div>
      <p className="muted" style={{ marginBottom: 14 }}>Suggested timeline based on Career Fair template + 2026 retrospective.</p>
      {TIMELINE_TEMPLATE.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 110px 1fr", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{p.phase}</div>
          <div className="mono muted">{p.weeks}</div>
          <div className="tiny muted">{p.tasks.join(" · ")}</div>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 14, padding: 14, background: "var(--info-soft)", borderRadius: 10 }}>
        <div className="ai-orb" style={{ marginTop: 2 }}></div>
        <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text)" }}>Recommendation:</strong> Start Acquisition phase 1 week earlier than 2026 — your sponsor pipeline finished 27% over target with the extra runway.
        </div>
      </div>
    </div>
  );
}

function WizStep4() {
  return (
    <div>
      <p className="muted" style={{ marginBottom: 14 }}>Budget skeleton suggested from 2026 actuals + 4% inflation buffer.</p>
      <table className="tbl" style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <thead><tr><th>Department</th><th className="num">2026 spent</th><th className="num">Suggested 2028</th><th>Note</th></tr></thead>
        <tbody>
          <tr><td><DeptTag id="LOGI"/> Venue & equipment</td><td className="num mono">RM 23,400</td><td className="num mono">RM 24,300</td><td className="muted tiny">incl. RM 2.5k contingency</td></tr>
          <tr><td><DeptTag id="PnP"/> Speakers & program</td><td className="num mono">RM 13,800</td><td className="num mono">RM 14,500</td><td className="muted tiny">+1 keynote slot</td></tr>
          <tr><td><DeptTag id="MM"/> Branding & design</td><td className="num mono">RM 8,200</td><td className="num mono">RM 8,500</td><td className="muted tiny">—</td></tr>
          <tr><td><DeptTag id="PUB"/> Marketing & ads</td><td className="num mono">RM 7,400</td><td className="num mono">RM 8,000</td><td className="muted tiny">paid social uplift</td></tr>
          <tr><td><DeptTag id="TECH"/> Web, AV, IT</td><td className="num mono">RM 12,800</td><td className="num mono">RM 11,500</td><td className="muted tiny">backup AV vendor</td></tr>
          <tr><td><DeptTag id="SPR"/> Sponsor servicing</td><td className="num mono">RM 5,640</td><td className="num mono">RM 6,200</td><td className="muted tiny">—</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function WizStep5() {
  return (
    <div>
      <p className="muted" style={{ marginBottom: 14 }}>Required approvals based on event scale and UM event guidelines.</p>
      <div className="flow">
        {APPROVAL_STAGES.map((s, i) => (
          <div key={i} className="flow-step">
            <div className="step-num">{i + 1}</div>
            <div className="step-title">{s.name}</div>
            <div className="step-meta">{s.desc}</div>
            <div className="step-status">{i === 0 ? "Auto-routes to dept head" : i === 3 ? "Required: VIPs / income > RM 50k" : ""}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
          <input type="checkbox" defaultChecked /> <span>Submit Event Proposal Form to FCSIT</span>
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
          <input type="checkbox" defaultChecked /> <span>Pre-book venue via UMPoint</span>
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
          <input type="checkbox" defaultChecked /> <span>Brand Toolkit pre-approval</span>
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
          <input type="checkbox" /> <span>UM Central — VIP/international speakers</span>
        </label>
      </div>
    </div>
  );
}

function WizStep6() {
  return (
    <div>
      <p className="muted" style={{ marginBottom: 14 }}>Atrium will create the event, scaffold tasks, route approvals, and link a Drive folder.</p>
      <div className="grid grid-2">
        <Summary label="Event"      v="MYTECH Career Fair 2028" sub="Career Fair · 3 days" />
        <Summary label="When"       v="Mar 8 – 10, 2028" sub="T-66 weeks from today" />
        <Summary label="Venue"      v="FCSIT, Universiti Malaya" sub="UMPoint booking will draft" />
        <Summary label="Departments" v="6 active" sub="SPR · PnP · PUB · LOGI · MM · TECH" />
        <Summary label="Budget"     v="RM 73,000" sub="suggested skeleton" />
        <Summary label="Tasks"      v="71 scaffolded" sub="based on 2026 task library" />
      </div>
      <div style={{ marginTop: 14, padding: 14, border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--text-secondary)" }}>
        ✓ 14 tasks will be auto-assigned this week<br />
        ✓ 4 approval flows will route to faculty / HEP<br />
        ✓ A linked Google Drive folder will be created with department subfolders<br />
        ✓ AI advisor will run a weekly analysis against 2026 trajectory
      </div>
    </div>
  );
}

function Summary({ label, v, sub }) {
  return (
    <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
      <div className="tiny muted">{sub}</div>
    </div>
  );
}

Object.assign(window, { ReportsView, LuckyDrawView, WizardModal });
