// onboarding.jsx — Atrium new-committee-member onboarding (6 steps)
// Standalone full-screen flow. Reuses tokens + ICONS from data.jsx.

const ONB_STEPS = [
  { id: "signin",  num: 1, label: "Sign in",         meta: "Universiti Malaya SSO" },
  { id: "profile", num: 2, label: "About you",       meta: "Identity & contact" },
  { id: "role",    num: 3, label: "Your role",       meta: "Assignment confirmation" },
  { id: "events",  num: 4, label: "Your events",     meta: "Pick what you'll work on" },
  { id: "connect", num: 5, label: "Connect tools",   meta: "Calendar, Drive, Telegram" },
  { id: "ready",   num: 6, label: "You're in",       meta: "Land in your dashboard" },
];

// Department metadata for the role-pick step
const ONB_DEPT_BG = {
  SPR:  "linear-gradient(135deg, #8b5cf6, #6b21a8)",
  PnP:  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  PUB:  "linear-gradient(135deg, #ec4899, #be185d)",
  LOGI: "linear-gradient(135deg, #f59e0b, #b25e00)",
  MM:   "linear-gradient(135deg, #10b981, #047857)",
  TECH: "linear-gradient(135deg, #06b6d4, #075985)",
  HC:   "linear-gradient(135deg, #1d1d1f, #3a3a3c)",
};

// ===== Root =====
function OnboardingApp() {
  const [stepIx, setStepIx] = useState(0);
  const [state, setState] = useState({
    // signin
    signedIn: false,
    method: null,
    // profile
    fullName: "Aaron Loke Chee Wai",
    matric: "U2300912",
    year: 2,
    program: "Bachelor of Computer Science (Software Engineering)",
    phone: "+60 12-345 6789",
    avatar: "AL",
    // role (preassigned by director — confirmation flow)
    assignedRole: "committee",
    assignedDept: "PUB",
    assignedTitle: "Social Media Executive",
    supervisor: "Tan Wei Jie · Head, Publicity",
    protocol: false,
    // events
    events: ["mytech-2027"],
    // skills / interests
    skills: ["Graphic design", "Reels & shorts", "Copywriting"],
    // connect
    calendar: true,
    drive: true,
    telegram: false,
    digest: "daily",
    // acknowledgements
    ackCode: false,
    ackPrivacy: false,
  });

  const set = (k, v) => setState((s) => ({ ...s, [k]: v }));

  const stepId = ONB_STEPS[stepIx].id;
  const isLast = stepIx === ONB_STEPS.length - 1;

  // gating
  const canContinue = (() => {
    if (stepId === "signin")   return state.signedIn;
    if (stepId === "profile")  return state.fullName && state.matric && state.phone;
    if (stepId === "role")     return state.ackCode;
    if (stepId === "events")   return state.events.length > 0;
    if (stepId === "connect")  return state.ackPrivacy;
    return true;
  })();

  return (
    <div className="onb">
      <OnbRail stepIx={stepIx} state={state} />
      <main className="onb-main">
        <div className="onb-main-head">
          <div className="onb-step-count">STEP {stepIx + 1} / {ONB_STEPS.length}</div>
          <a className="help" href="#">Need help? Email atrium@um.edu.my</a>
        </div>

        <div className="onb-content">
          <div className="onb-content-inner" key={stepId}>
            {stepId === "signin"  && <StepSignIn  state={state} set={set} onNext={() => setStepIx(1)} />}
            {stepId === "profile" && <StepProfile state={state} set={set} />}
            {stepId === "role"    && <StepRole    state={state} set={set} />}
            {stepId === "events"  && <StepEvents  state={state} set={set} />}
            {stepId === "connect" && <StepConnect state={state} set={set} />}
            {stepId === "ready"   && <StepReady   state={state} />}
          </div>
        </div>

        <div className="onb-foot">
          <div className="onb-foot-left">
            <span>Atrium · Event Operations · FCSIT, Universiti Malaya</span>
          </div>
          <div className="onb-foot-actions">
            {stepIx > 0 && !isLast && (
              <button className="btn" onClick={() => setStepIx((i) => i - 1)}>Back</button>
            )}
            {!isLast ? (
              <button
                className="btn primary"
                disabled={!canContinue}
                style={{ opacity: canContinue ? 1 : 0.4, cursor: canContinue ? "pointer" : "not-allowed" }}
                onClick={() => canContinue && setStepIx((i) => i + 1)}
              >
                {stepIx === ONB_STEPS.length - 2 ? "Finish setup" : "Continue"}  {ICONS.arrow}
              </button>
            ) : (
              <a className="btn primary" href="Atrium.html">Open Atrium  {ICONS.arrow}</a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ===== Left rail =====
function OnbRail({ stepIx, state }) {
  return (
    <aside className="onb-rail">
      <div className="onb-brand">
        <div className="brand-mark">A</div>
        <div className="brand-name">Atrium</div>
        <div className="brand-org">FCSIT · UM</div>
      </div>

      <div className="onb-rail-eyebrow">Joining the committee</div>
      <h2 className="onb-rail-title">Let's get you set up to run events.</h2>
      <p className="onb-rail-sub">
        Atrium plugs you into the right departments, events, and approval flows — so you can start contributing on day one.
      </p>

      <div className="onb-steps">
        {ONB_STEPS.map((s, i) => (
          <div key={s.id} className={"onb-step " + (i < stepIx ? "done" : i === stepIx ? "active" : "")}>
            <div className="onb-step-num">
              {i < stepIx ? ICONS.check : s.num}
            </div>
            <div className="onb-step-body">
              <div className="onb-step-label">{s.label}</div>
              <div className="onb-step-meta">{s.meta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="onb-rail-foot">
        <div className="av-md">AR</div>
        <div className="onb-rail-foot-body">
          <div className="onb-rail-foot-title">Welcomed by Aisyah Rahman</div>
          <div className="onb-rail-foot-sub">Director · MYTECH 2027 · 2 hours ago</div>
        </div>
      </div>
    </aside>
  );
}

// ===== Step 1: Sign in =====
function StepSignIn({ state, set, onNext }) {
  return (
    <div>
      <div className="onb-eyebrow">Welcome</div>
      <h1 className="onb-title">Sign in to Atrium</h1>
      <p className="onb-sub">
        Use your Universiti Malaya account. Atrium uses SSO so we never see your password — your committee role is pulled from the FCSIT directory.
      </p>

      <div className="onb-sso">
        <button
          className="onb-sso-btn primary"
          onClick={() => { set("signedIn", true); set("method", "um"); setTimeout(onNext, 320); }}
        >
          <span className="sso-glyph">UM</span>
          <span>Continue with Universiti Malaya SSO</span>
          <span className="sso-meta">Recommended</span>
        </button>

        <button className="onb-sso-btn" onClick={() => { set("signedIn", true); set("method", "google"); setTimeout(onNext, 320); }}>
          <span className="sso-glyph" style={{ background: "#fff", color: "#111", border: "1px solid var(--border)" }}>G</span>
          <span>Continue with Google (um.edu.my)</span>
          <span className="sso-meta">@um.edu.my only</span>
        </button>

        <button className="onb-sso-btn" onClick={() => { set("signedIn", true); set("method", "magic"); setTimeout(onNext, 320); }}>
          <span className="sso-glyph">✉</span>
          <span>Email me a magic link</span>
          <span className="sso-meta">Slower · 2 min</span>
        </button>
      </div>

      <div className="onb-divider-line">or</div>

      <div style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 16,
        background: "var(--bg-elev)",
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <div className="ai-orb" style={{ marginTop: 2, flexShrink: 0 }}></div>
        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
          <strong style={{ color: "var(--text)" }}>Invited to a committee?</strong>{" "}
          Your invitation email contains a one-tap link that pre-fills your role and department. Check your inbox for{" "}
          <span className="mono">noreply@atrium.um.edu.my</span> — the link expires in 7 days.
        </div>
      </div>

      <p className="tiny muted" style={{ marginTop: 18, textAlign: "center" }}>
        By signing in you agree to UM's Student Activity Code of Conduct and Atrium's data handling policy.
      </p>
    </div>
  );
}

// ===== Step 2: About you =====
function StepProfile({ state, set }) {
  return (
    <div>
      <div className="onb-eyebrow">Step 2 of 6</div>
      <h1 className="onb-title">A bit about you</h1>
      <p className="onb-sub">
        We pulled this from the FCSIT directory. Confirm it's correct — this is what your committee will see, and what auto-fills on approval forms.
      </p>

      <div className="onb-photo">
        <div className="onb-photo-circle" style={{ background: "linear-gradient(135deg, #f472b6, #be185d)" }}>
          {state.avatar}
          <div className="onb-photo-edit" title="Change photo">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 11.5l-.5 2 2-.5L13 5l-1.5-1.5L3 11.5z" />
            </svg>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Profile photo</div>
          <div className="tiny muted" style={{ marginTop: 3 }}>
            Square crop, at least 200×200. Or keep your initials.
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn">Upload</button>
            <button className="btn ghost">Use initials</button>
          </div>
        </div>
      </div>

      <div className="onb-grid-2" style={{ marginTop: 18 }}>
        <div className="field">
          <label>Full name</label>
          <input className="input" value={state.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </div>
        <div className="field">
          <label>Matric number</label>
          <input className="input mono" value={state.matric} onChange={(e) => set("matric", e.target.value)} />
          <div className="hint">Used on official UM/HEP forms.</div>
        </div>
      </div>

      <div className="onb-grid-2">
        <div className="field">
          <label>Year of study</label>
          <select className="select" value={state.year} onChange={(e) => set("year", +e.target.value)}>
            <option value={1}>Year 1</option>
            <option value={2}>Year 2</option>
            <option value={3}>Year 3</option>
            <option value={4}>Year 4 (Final)</option>
          </select>
        </div>
        <div className="field">
          <label>WhatsApp / Phone</label>
          <input className="input mono" value={state.phone} onChange={(e) => set("phone", e.target.value)} />
          <div className="hint">For approval pings and on-event coordination.</div>
        </div>
      </div>

      <div className="field">
        <label>Program</label>
        <input className="input" value={state.program} onChange={(e) => set("program", e.target.value)} />
      </div>

      <div className="onb-section-eyebrow">What you're good at</div>
      <p className="tiny muted" style={{ marginTop: -2, marginBottom: 10 }}>
        Optional. Used by department heads when they assign tasks. Pick up to 5.
      </p>
      <div className="onb-chips">
        {[
          "Graphic design", "Reels & shorts", "Copywriting", "Photography", "Videography",
          "Web dev", "AV / sound", "Public speaking", "Negotiation", "Event MC",
          "Excel / data", "Logistics", "Vendor liaison", "Branding"
        ].map((s) => {
          const on = state.skills.includes(s);
          return (
            <span
              key={s}
              className={"onb-chip" + (on ? " selected" : "")}
              onClick={() => set("skills", on ? state.skills.filter(x => x !== s) : [...state.skills, s])}
            >
              {on && ICONS.check} {s}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ===== Step 3: Role =====
function StepRole({ state, set }) {
  const deptName = (DEPTS.find(d => d.id === state.assignedDept) || {}).name || state.assignedDept;
  const bg = ONB_DEPT_BG[state.assignedDept];

  return (
    <div>
      <div className="onb-eyebrow">Step 3 of 6</div>
      <h1 className="onb-title">Your role on the committee</h1>
      <p className="onb-sub">
        Aisyah (your Director) has assigned you a role. Review what it gives you access to, then confirm.
      </p>

      <div className="onb-role-card" style={{ marginBottom: 12 }}>
        <div className="role-icon" style={{ background: bg }}>{state.assignedDept}</div>
        <div>
          <div className="onb-role-name">{state.assignedTitle}</div>
          <div className="onb-role-meta">{deptName} · Reports to {state.supervisor}</div>
          <div className="onb-role-dept-row">
            <DeptTag id={state.assignedDept} />
            <span className="pill">{ROLE_BADGES[state.assignedRole] || "Member"}</span>
            <span className="pill neutral">MYTECH 2027 + Code Sprint 2027</span>
          </div>
        </div>
        <button className="btn ghost" title="Request a different role">
          Request change
        </button>
      </div>

      <div className="onb-section-eyebrow">What this role gives you</div>
      <div className="onb-cards cols-2">
        <PermCard ok title="Department tasks" body="See and update tasks in Publicity. Move cards across Backlog → Doing → Done." />
        <PermCard ok title="Files (general)" body="Drive folders for design, brand kits, and the team Notion." />
        <PermCard ok title="Submit claims" body="File reimbursements up to RM 200 per claim. Larger claims need approval." />
        <PermCard title="Sponsor financials" body="Sponsor amounts, contracts, and the approval ledger are visible to Head + Treasurer only." />
        <PermCard title="Approve invoices" body="Treasurer + Vice Treasurer can approve. You can submit." />
        <PermCard ok title="Lucky Draw entries" body="View and assist with draws — but only Protocol Team runs the live draw." />
      </div>

      <div className="onb-info-card">
        <div className="ai-orb"></div>
        <div className="body">
          <b>Heads up.</b> Permissions change automatically if you're promoted. Roles are versioned per event — you can be a Head on one event and a member on another.
        </div>
      </div>

      <div className="onb-section-eyebrow">Acknowledgement</div>
      <label style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        padding: 14, border: "1px solid var(--border)", borderRadius: "var(--radius)",
        background: state.ackCode ? "var(--success-soft)" : "var(--bg-elev)",
        cursor: "pointer", transition: "background 140ms ease",
      }}>
        <input
          type="checkbox" checked={state.ackCode}
          onChange={(e) => set("ackCode", e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}
        />
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          I accept the {state.assignedTitle} role and agree to the{" "}
          <a href="#" style={{ color: "var(--text)", textDecoration: "underline" }}>Committee Code of Conduct</a>.
          I understand my activity is logged in Atrium and visible to my supervisor.
        </div>
      </label>
    </div>
  );
}

function PermCard({ ok, title, body }) {
  return (
    <div className="onb-card" style={{ cursor: "default", opacity: ok ? 1 : 0.7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div className="onb-card-title">{title}</div>
        <span className={"pill " + (ok ? "success" : "neutral")} style={{ fontSize: 10.5 }}>
          {ok ? "Granted" : "Restricted"}
        </span>
      </div>
      <div className="onb-card-body">{body}</div>
    </div>
  );
}

// ===== Step 4: Events =====
function StepEvents({ state, set }) {
  const toggle = (id) => {
    const has = state.events.includes(id);
    set("events", has ? state.events.filter(e => e !== id) : [...state.events, id]);
  };
  const activeOnly = EVENTS.filter(e => e.status !== "Completed");
  const past = EVENTS.filter(e => e.status === "Completed");

  return (
    <div>
      <div className="onb-eyebrow">Step 4 of 6</div>
      <h1 className="onb-title">Pick the events you'll work on</h1>
      <p className="onb-sub">
        You can be on multiple events at once. Your Publicity assignments will surface in each event's task board.
      </p>

      <div className="onb-section-eyebrow">Currently active</div>
      <div className="onb-cards" style={{ gridTemplateColumns: "1fr" }}>
        {activeOnly.map(e => {
          const sel = state.events.includes(e.id);
          return (
            <div key={e.id} className={"onb-card" + (sel ? " selected" : "")} onClick={() => toggle(e.id)}>
              <div className="onb-card-check">
                {sel && <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M3.5 8l3 3 6-6" /></svg>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: e.isCompetition ? "linear-gradient(135deg, #075985, #06b6d4)" : "linear-gradient(135deg, #1d1d1f, #3a3a3c)",
                  color: "white", display: "grid", placeItems: "center",
                  fontSize: 12, fontWeight: 700, letterSpacing: "-0.02em",
                }}>{e.cover}</div>
                <div>
                  <div className="onb-card-eyebrow">{e.type}</div>
                  <div className="onb-card-title" style={{ marginBottom: 2 }}>{e.code}</div>
                  <div className="onb-card-body">
                    {e.venue} · {e.startDate.slice(5)} → {e.endDate.slice(5)} · T-{Math.abs(e.daysLeft)} days
                  </div>
                  <div className="onb-card-meta">
                    <span className={"pill " + (e.statusKind || "neutral")}><span className="dot" />{e.status}</span>
                    <span>Progress {e.progress}%</span>
                    <span>{e.registrations.current} {e.registrations.teams ? "teams" : "registrations"}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="tiny muted">Your dept needs</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                    {e.id === "mytech-2027" ? "3 members" : "2 members"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="onb-section-eyebrow">Past — read-only access</div>
      {past.map(e => (
        <div key={e.id} className="onb-card disabled" style={{ cursor: "default" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #c8c8cc, #88888c)",
              color: "white", display: "grid", placeItems: "center",
              fontSize: 11, fontWeight: 700, letterSpacing: "-0.02em",
            }}>{e.cover}</div>
            <div>
              <div className="onb-card-title" style={{ marginBottom: 2 }}>{e.code}</div>
              <div className="onb-card-body">
                Closed · post-mortem & SWOT available for analysis.
              </div>
            </div>
            <span className="pill neutral">Reference</span>
          </div>
        </div>
      ))}

      <div className="onb-info-card">
        <div className="ai-orb"></div>
        <div className="body">
          <b>Recommended.</b> Based on your Publicity role, joining both <b>MYTECH 2027</b> and <b>Code Sprint 2027</b> matches the workload your Head has scoped (~6 hrs/week combined).
        </div>
      </div>
    </div>
  );
}

// ===== Step 5: Connect =====
function StepConnect({ state, set }) {
  return (
    <div>
      <div className="onb-eyebrow">Step 5 of 6</div>
      <h1 className="onb-title">Connect your tools</h1>
      <p className="onb-sub">
        Atrium plays nicely with what your committee already uses. Connect them now and we'll set up the right folders, channels, and reminders automatically.
      </p>

      <ConnectRow
        on={state.calendar} onChange={(v) => set("calendar", v)}
        glyph="GC" bg="#1d4ed8"
        title="Google Calendar"
        sub="Sync committee meetings, sponsor pitches, and event days to your calendar. Two-way."
      />
      <ConnectRow
        on={state.drive} onChange={(v) => set("drive", v)}
        glyph="GD" bg="#047857"
        title="Google Drive · um.edu.my"
        sub="Auto-mount the MYTECH 2027 / Code Sprint 2027 shared drives. We'll only see folders your role unlocks."
      />
      <ConnectRow
        on={state.telegram} onChange={(v) => set("telegram", v)}
        glyph="TG" bg="#0284c7"
        title="Telegram"
        sub="Get pinged on task assignments and approval status. You'll be added to the @MYTECH27_Publicity channel."
      />

      <div className="onb-section-eyebrow">Notification frequency</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { id: "instant", label: "Instant", sub: "Every event" },
          { id: "daily",   label: "Daily digest",  sub: "Bundled · 9 AM" },
          { id: "weekly",  label: "Weekly recap",  sub: "Monday mornings" },
          { id: "off",     label: "Off",           sub: "Email only for approvals" },
        ].map(opt => {
          const sel = state.digest === opt.id;
          return (
            <div
              key={opt.id}
              className={"onb-card" + (sel ? " selected" : "")}
              style={{ flex: 1, padding: "12px 14px" }}
              onClick={() => set("digest", opt.id)}
            >
              <div className="onb-card-check">
                {sel && <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M3.5 8l3 3 6-6" /></svg>}
              </div>
              <div className="onb-card-title" style={{ fontSize: 13 }}>{opt.label}</div>
              <div className="onb-card-body" style={{ fontSize: 11.5 }}>{opt.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="onb-section-eyebrow">Privacy & data</div>
      <label style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        padding: 14, border: "1px solid var(--border)", borderRadius: "var(--radius)",
        background: state.ackPrivacy ? "var(--success-soft)" : "var(--bg-elev)",
        cursor: "pointer", transition: "background 140ms ease",
      }}>
        <input
          type="checkbox" checked={state.ackPrivacy}
          onChange={(e) => set("ackPrivacy", e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}
        />
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
          I understand Atrium stores my activity (tasks, approvals, files I touch) for as long as I'm on the committee plus one event cycle.
          I can export or delete my data anytime from Profile → Data. See the{" "}
          <a href="#" style={{ color: "var(--text)", textDecoration: "underline" }}>full privacy policy</a>.
        </div>
      </label>
    </div>
  );
}

function ConnectRow({ on, onChange, glyph, bg, title, sub }) {
  return (
    <div className="onb-toggle-row">
      <div className="onb-toggle-icon" style={{ background: bg, color: "white", fontWeight: 700, fontSize: 11 }}>
        {glyph}
      </div>
      <div className="onb-toggle-body">
        <div className="onb-toggle-title">{title}</div>
        <div className="onb-toggle-sub">{sub}</div>
      </div>
      <div className={"onb-switch" + (on ? " on" : "")} onClick={() => onChange(!on)} />
    </div>
  );
}

// ===== Step 6: Ready =====
function StepReady({ state }) {
  const evNames = state.events
    .map(id => (EVENTS.find(e => e.id === id) || {}).code)
    .filter(Boolean)
    .join(" + ");

  return (
    <div className="onb-celebrate">
      <div className="onb-celebrate-orb"></div>
      <div className="onb-eyebrow">All set</div>
      <h1 className="onb-title" style={{ marginTop: 6 }}>Welcome to Atrium, {state.fullName.split(" ")[0]}.</h1>
      <p className="onb-sub" style={{ margin: "0 auto 6px" }}>
        Your workspace is ready. Here's what we've set up for you.
      </p>

      <div className="onb-summary" style={{ textAlign: "left", marginTop: 24 }}>
        <div className="onb-summary-row">
          <div className="label">Role</div>
          <div className="value">{state.assignedTitle}</div>
          <div className="sub">{(DEPTS.find(d => d.id === state.assignedDept) || {}).name}</div>
        </div>
        <div className="onb-summary-row">
          <div className="label">Reports to</div>
          <div className="value">{state.supervisor.split(" · ")[0]}</div>
          <div className="sub">{state.supervisor.split(" · ")[1]}</div>
        </div>
        <div className="onb-summary-row full">
          <div className="label">Events</div>
          <div className="value">{evNames || "—"}</div>
          <div className="sub">You'll see these in your sidebar.</div>
        </div>
        <div className="onb-summary-row">
          <div className="label">Connected</div>
          <div className="value">
            {[
              state.calendar && "Calendar",
              state.drive && "Drive",
              state.telegram && "Telegram",
            ].filter(Boolean).join(" · ") || "None yet"}
          </div>
          <div className="sub">Manage in Profile → Integrations</div>
        </div>
        <div className="onb-summary-row">
          <div className="label">Notifications</div>
          <div className="value" style={{ textTransform: "capitalize" }}>{state.digest}</div>
          <div className="sub">Change anytime.</div>
        </div>
      </div>

      <div className="onb-section-eyebrow" style={{ textAlign: "left" }}>First things to do</div>
      <div className="onb-checklist">
        <div className="onb-check-item">
          <div className="check">{ICONS.check}</div>
          <div>
            <b>Read the MYTECH 2027 brief.</b>{" "}
            <span className="muted">8-page event pack — auto-pinned to your dashboard.</span>
          </div>
        </div>
        <div className="onb-check-item">
          <div className="check">{ICONS.check}</div>
          <div>
            <b>Meet your department.</b>{" "}
            <span className="muted">Publicity stand-up Thursday 8 PM · DKU3 / Zoom.</span>
          </div>
        </div>
        <div className="onb-check-item">
          <div className="check">{ICONS.check}</div>
          <div>
            <b>Claim your first task.</b>{" "}
            <span className="muted">3 unassigned cards in Publicity backlog are tagged "good first task".</span>
          </div>
        </div>
        <div className="onb-check-item">
          <div className="check">{ICONS.check}</div>
          <div>
            <b>Take the 90-second tour.</b>{" "}
            <span className="muted">Atrium Intelligence will walk you through the dashboard.</span>
          </div>
        </div>
      </div>

      <div className="onb-cta-row">
        <a className="btn" href="Atrium.html">Skip tour, go to dashboard</a>
        <a className="btn primary" href="Atrium.html">Start the 90-sec tour  {ICONS.arrow}</a>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<OnboardingApp />);
