// secretary.jsx — Atrium Secretariat
// Document control center. Every header and every line of every document is editable inline.

const { useState, useEffect, useRef } = React;

// ===== Document corpus =====
const DOCS = [
  {
    id: "min-2026-12-03",
    kind: "Minutes",
    title: "Minutes — Committee Meeting #14",
    refNo: "MYTECH27/MIN/2026-014",
    date: "Dec 03, 2026",
    author: "Faris Hakim",
    preview: "Quorum met at 8:04 PM in DKU3. Director chaired. Sponsorship pipeline reviewed…",
    status: "Draft",
    route: "Sec → Director → File",
    routeStep: 1,
  },
  {
    id: "ltr-um-fm-001",
    kind: "Official Letter",
    title: "Application for Atrium Venue Booking",
    refNo: "MYTECH27/LTR/UMFM/001",
    date: "Dec 01, 2026",
    author: "Faris Hakim",
    preview: "We respectfully submit our application to book the FCSIT Atrium for our annual…",
    status: "Sent",
    route: "Sec → Director → UM FM",
    routeStep: 3,
  },
  {
    id: "mou-maybank",
    kind: "MOU",
    title: "Memorandum of Understanding — Maybank Berhad",
    refNo: "MYTECH27/MOU/MBB/v3",
    date: "Nov 28, 2026",
    author: "Faris Hakim",
    preview: "This Memorandum of Understanding is entered into between Universiti Malaya (FCSIT)…",
    status: "Awaiting signatures",
    route: "Sec → Director → Maybank Legal",
    routeStep: 2,
  },
  {
    id: "prop-mytech27",
    kind: "Proposal",
    title: "MYTECH 2027 Event Proposal · Final",
    refNo: "MYTECH27/PROP/v4",
    date: "Nov 14, 2026",
    author: "Faris Hakim",
    preview: "Executive summary: MYTECH 2027 is a 3-day career fair connecting CS students with…",
    status: "Approved",
    route: "Sec → Faculty → HEP",
    routeStep: 4,
  },
  {
    id: "ltr-vip-invite",
    kind: "Official Letter",
    title: "Invitation — VIP Opening Speaker",
    refNo: "MYTECH27/LTR/VIP/002",
    date: "Nov 25, 2026",
    author: "Faris Hakim",
    preview: "On behalf of the MYTECH 2027 organising committee, it is with great honour that…",
    status: "Draft",
    route: "Sec → Director",
    routeStep: 1,
  },
  {
    id: "rep-postm-2026",
    kind: "Report",
    title: "Post-Event Report — MYTECH 2026",
    refNo: "MYTECH26/REP/POSTM/v1",
    date: "Apr 02, 2026",
    author: "Faris Hakim",
    preview: "Closing report covering financial reconciliation, attendance figures, sponsor servicing…",
    status: "Filed",
    route: "Archive",
    routeStep: 4,
  },
  {
    id: "ltr-hep-permit",
    kind: "Official Letter",
    title: "Notification of Activity — HEP",
    refNo: "MYTECH27/LTR/HEP/003",
    date: "Nov 20, 2026",
    author: "Faris Hakim",
    preview: "Pursuant to UM activity guidelines, we hereby notify Bahagian Hal Ehwal Pelajar…",
    status: "Sent",
    route: "Sec → HEP",
    routeStep: 3,
  },
  {
    id: "min-2026-11-26",
    kind: "Minutes",
    title: "Minutes — Committee Meeting #13",
    refNo: "MYTECH27/MIN/2026-013",
    date: "Nov 26, 2026",
    author: "Faris Hakim",
    preview: "Quorum met at 8:00 PM. Discussion centered on sponsor escalation and Brand Toolkit…",
    status: "Filed",
    route: "Filed",
    routeStep: 4,
  },
];

const KINDS = ["All", "Minutes", "Official Letter", "MOU", "Proposal", "Report", "Templates"];
const STATUS_TONE = {
  "Draft":               "neutral",
  "Awaiting signatures": "warn",
  "Sent":                "info",
  "Approved":            "success",
  "Filed":               "neutral",
};

// ===== Root =====
function SecretaryApp() {
  const [nav, setNav] = useState("inbox");        // inbox | minutes | letters | mous | proposals | reports | templates | archive
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [openDocId, setOpenDocId] = useState("ltr-vip-invite");

  // Map nav -> kind filter
  const navToKind = {
    inbox: null, minutes: "Minutes", letters: "Official Letter",
    mous: "MOU", proposals: "Proposal", reports: "Report",
    templates: "Templates", archive: "filed-only",
  };

  const docs = DOCS.filter(d => {
    if (nav === "templates") return false; // templates handled separately
    if (nav === "archive") return d.status === "Filed";
    const kindFromNav = navToKind[nav];
    if (kindFromNav && d.kind !== kindFromNav) return false;
    if (filter !== "All" && d.kind !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.preview.toLowerCase().includes(q) && !d.refNo.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openDoc = DOCS.find(d => d.id === openDocId);

  return (
    <div className="sec-app">
      <SecSidebar nav={nav} setNav={(n) => { setNav(n); setFilter("All"); }} />
      {nav === "templates"
        ? <TemplatesPanel />
        : <>
            <SecList
              docs={docs}
              nav={nav}
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
              openDocId={openDocId}
              setOpenDocId={setOpenDocId}
            />
            {openDoc ? <SecEditor doc={openDoc} /> : <div className="sec-edit"><div className="sec-empty"><div className="big">Pick a document</div><div>Or create a new one from the sidebar.</div></div></div>}
          </>
      }
    </div>
  );
}

// ===== Sidebar =====
function SecSidebar({ nav, setNav }) {
  const count = (kind) => DOCS.filter(d => d.kind === kind).length;
  const draftCount = DOCS.filter(d => d.status === "Draft").length;
  const items = [
    { section: "WORKSPACE" },
    { id: "inbox",     label: "All documents", ico: ICONS.files,    badge: DOCS.length },
    { id: "minutes",   label: "Meeting minutes", ico: ICONS.tasks,   badge: count("Minutes") },
    { id: "letters",   label: "Official letters", ico: ICONS.invoices, badge: count("Official Letter"), tone: draftCount ? "warn" : null },
    { id: "mous",      label: "MOUs & contracts", ico: ICONS.approvals, badge: count("MOU") },
    { id: "proposals", label: "Proposals", ico: ICONS.reports, badge: count("Proposal") },
    { id: "reports",   label: "Reports", ico: ICONS.reports, badge: count("Report") },
    { section: "ADMIN" },
    { id: "templates", label: "Header & templates", ico: ICONS.events },
    { id: "archive",   label: "Archive", ico: ICONS.files, badge: DOCS.filter(d => d.status === "Filed").length },
  ];

  return (
    <aside className="sec-side">
      <div className="sec-brand">
        <div className="brand-mark">A</div>
        <div className="label">Secretariat</div>
        <div className="meta">FCSIT</div>
      </div>

      <button className="sec-newdoc">{ICONS.plus} New document</button>

      <div className="sec-side-nav">
        {items.map((it, i) => it.section ? (
          <div key={i} className="sec-side-section">{it.section}</div>
        ) : (
          <div key={it.id} className={"sec-nav" + (nav === it.id ? " active" : "")} onClick={() => setNav(it.id)}>
            <span className="ico">{it.ico}</span>
            <span>{it.label}</span>
            {it.badge != null && <span className={"badge " + (it.tone || "")}>{it.badge}</span>}
          </div>
        ))}
      </div>

      <div className="sec-side-foot">
        <a href="Atrium.html">← Back to Atrium</a>
      </div>
    </aside>
  );
}

// ===== Middle list =====
function SecList({ docs, nav, filter, setFilter, search, setSearch, openDocId, setOpenDocId }) {
  const labels = {
    inbox: "All documents", minutes: "Meeting minutes", letters: "Official letters",
    mous: "MOUs & contracts", proposals: "Proposals", reports: "Reports", archive: "Archive",
  };

  return (
    <div className="sec-list">
      <div className="sec-list-head">
        <div>
          <div className="title">{labels[nav]}</div>
        </div>
        <div className="count" style={{ marginLeft: "auto" }}>{docs.length} items</div>
      </div>
      <div className="sec-search">
        <span className="ico">{ICONS.search}</span>
        <input placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="sec-list-filter">
        {KINDS.filter(k => k !== "Templates").map(k => (
          <button
            key={k}
            className="chip"
            style={filter === k ? { background: "var(--text)", color: "var(--text-inverse)" } : {}}
            onClick={() => setFilter(k)}
          >{k}</button>
        ))}
      </div>
      <div className="sec-list-rows">
        {docs.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>
            No documents in this view.
          </div>
        )}
        {docs.map(d => (
          <div key={d.id} className={"sec-doc-row" + (openDocId === d.id ? " active" : "")} onClick={() => setOpenDocId(d.id)}>
            <div className="spacer" />
            <div className="body">
              <div className="title">{d.title}</div>
              <div className="preview">{d.preview}</div>
              <div className="meta">
                <span className={"pill " + STATUS_TONE[d.status]} style={{ fontSize: 10 }}>
                  <span className="dot" />{d.status}
                </span>
                <span className="when">{d.refNo}</span>
              </div>
            </div>
            <div className="right">
              <div className="stamp">{d.date}</div>
              <span className="dept-tag" style={{ fontSize: 9.5 }}>{d.kind.split(" ")[0].toUpperCase().slice(0,4)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Editor =====
function SecEditor({ doc }) {
  const [savedLabel, setSavedLabel] = useState("All changes saved · 2 min ago");
  const [docMounted, setDocMounted] = useState(0);

  // re-mount editable areas when switching docs
  useEffect(() => { setDocMounted(m => m + 1); }, [doc.id]);

  // Track last edit (debounced "saved" label)
  const onEdit = () => {
    setSavedLabel("Saving…");
    clearTimeout(window.__secTimer);
    window.__secTimer = setTimeout(() => {
      const t = new Date();
      setSavedLabel("All changes saved · just now");
    }, 600);
  };

  const exec = (cmd, val) => { document.execCommand(cmd, false, val); onEdit(); };

  return (
    <div className="sec-edit">
      <div className="sec-edit-head">
        <div className="crumb">
          <span>Documents</span>
          <span className="sep">›</span>
          <span>{doc.kind}</span>
          <span className="sep">›</span>
          <strong>{doc.title}</strong>
        </div>
        <div style={{ marginLeft: 14 }}>
          <span className={"pill " + STATUS_TONE[doc.status]}>
            <span className="dot" />{doc.status}
          </span>
        </div>
        <div className="right">
          <span className="saved"><span className="dot"></span>{savedLabel}</span>
          <button className="btn">History</button>
          <button className="btn">Export PDF</button>
          <button className="btn primary">Send for signature</button>
        </div>
      </div>

      <div className="sec-doc-toolbar">
        <select className="select" defaultValue="body" onChange={(e) => exec("formatBlock", e.target.value)}>
          <option value="p">Body</option>
          <option value="h2">Section heading</option>
          <option value="h3">Sub-heading</option>
        </select>
        <select className="select" defaultValue="13.5" onChange={(e) => exec("fontSize", "3")} title="Font size">
          <option>11</option><option>12</option><option>13.5</option><option>15</option><option>18</option>
        </select>
        <div className="div"></div>
        <button onClick={() => exec("bold")} title="Bold"><b>B</b></button>
        <button onClick={() => exec("italic")} title="Italic"><i>I</i></button>
        <button onClick={() => exec("underline")} title="Underline"><u>U</u></button>
        <div className="div"></div>
        <button onClick={() => exec("insertUnorderedList")} title="Bullet list">•—</button>
        <button onClick={() => exec("insertOrderedList")} title="Number list">1.</button>
        <div className="div"></div>
        <button onClick={() => exec("justifyLeft")} title="Align left">⇤</button>
        <button onClick={() => exec("justifyCenter")} title="Center">↔</button>
        <button onClick={() => exec("justifyRight")} title="Align right">⇥</button>
        <div className="div"></div>
        <button onClick={() => exec("undo")} title="Undo">↶</button>
        <button onClick={() => exec("redo")} title="Redo">↷</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{doc.refNo}</span>
        </div>
      </div>

      <div className="sec-edit-wrap">
        <div className="sec-edit-main">
          <div className="sec-doc-scroll">
            <div className="sec-hint">
              <span>✎</span>
              <span><b>Everything on this sheet is editable.</b> Click any line — letterhead, title, body, signatures, footer — and type. Highlight text first to use the toolbar above.</span>
              <span style={{ marginLeft: "auto" }}><span className="kbd">⌘</span> + <span className="kbd">B</span> · <span className="kbd">⌘</span> + <span className="kbd">S</span></span>
            </div>

            <Paper key={docMounted} doc={doc} onEdit={onEdit} />
          </div>
        </div>

        <aside className="sec-meta-rail">
          <div className="sec-meta-section">Document</div>
          <div className="sec-meta-row"><span className="l">Reference</span><span className="v mono" style={{ fontSize: 11 }}>{doc.refNo}</span></div>
          <div className="sec-meta-row"><span className="l">Kind</span><span className="v">{doc.kind}</span></div>
          <div className="sec-meta-row"><span className="l">Author</span><span className="v">{doc.author}</span></div>
          <div className="sec-meta-row"><span className="l">Created</span><span className="v">{doc.date}</span></div>
          <div className="sec-meta-row"><span className="l">Status</span><span className="v">{doc.status}</span></div>

          <div className="sec-meta-section">Routing</div>
          <div className="sec-route">
            {["Secretary draft", "Director sign", "External party", "Filed"].map((s, i) => (
              <div key={i} className={"step " + (i < doc.routeStep ? "done" : i === doc.routeStep ? "current" : "")}>
                <div className="num">{i < doc.routeStep ? "✓" : i + 1}</div>
                <div>{s}</div>
              </div>
            ))}
          </div>

          <div className="sec-meta-section">Linked</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <div>📁 Approvals & Forms</div>
            <div>🏷 MYTECH 2027</div>
            <div>👤 Aisyah Rahman</div>
          </div>

          <div className="sec-meta-section">Actions</div>
          <button className="btn" style={{ width: "100%", marginBottom: 6 }}>Duplicate</button>
          <button className="btn" style={{ width: "100%", marginBottom: 6 }}>Move to template</button>
          <button className="btn danger" style={{ width: "100%" }}>Archive</button>
        </aside>
      </div>
    </div>
  );
}

// ===== Paper / sheet =====
function Paper({ doc, onEdit }) {
  // Document-specific body templates. Letterhead + signatures + footer are shared.
  return (
    <div className="sec-paper">
      <div className="corner-mark">{doc.status} · v3</div>

      {/* Letterhead — every line editable */}
      <header className="sec-letterhead">
        <div className="seal" contentEditable suppressContentEditableWarning className="editable seal" onInput={onEdit}>UM</div>
        <div>
          <div className="org editable" contentEditable suppressContentEditableWarning onInput={onEdit}>
            Faculty of Computer Science & Information Technology · Universiti Malaya
          </div>
          <h1 className="title editable" contentEditable suppressContentEditableWarning onInput={onEdit}>
            MYTECH 2027 Organising Committee
          </h1>
          <div className="subtitle editable" contentEditable suppressContentEditableWarning onInput={onEdit}>
            Office of the Secretary — Faris Hakim · faris@um.edu.my
          </div>
        </div>
        <div className="addr editable" contentEditable suppressContentEditableWarning onInput={onEdit}>
          Block A, FCSIT{"\n"}50603 Kuala Lumpur{"\n"}Malaysia{"\n"}+60 3-7967 6300
        </div>
      </header>

      {/* Body — depends on doc kind */}
      <DocBody doc={doc} onEdit={onEdit} />

      {/* Footer — editable */}
      <footer className="sec-paper-foot">
        <span className="editable" contentEditable suppressContentEditableWarning onInput={onEdit}>
          {doc.refNo}
        </span>
        <span className="editable" contentEditable suppressContentEditableWarning onInput={onEdit}>
          Page 1 of 1 · Issued under MYTECH 2027 Secretariat
        </span>
        <span className="editable" contentEditable suppressContentEditableWarning onInput={onEdit}>
          fcsit.um.edu.my/mytech27
        </span>
      </footer>
    </div>
  );
}

// ===== Per-doc body =====
function DocBody({ doc, onEdit }) {
  const ed = { contentEditable: true, suppressContentEditableWarning: true, onInput: onEdit, className: "editable" };

  if (doc.kind === "Minutes") {
    return (
      <div className="sec-doc-body">
        <h2 {...ed}>Minutes of Committee Meeting #14</h2>
        <div className="meta-line">
          <div><span className="label">Date:</span><span {...ed}>3 December 2026</span></div>
          <div><span className="label">Time:</span><span {...ed}>8:04 PM – 9:42 PM</span></div>
          <div><span className="label">Venue:</span><span {...ed}>DKU3, FCSIT</span></div>
        </div>
        <p {...ed}><b>1. Attendance.</b> Quorum was met at 8:04 PM. Director Aisyah Rahman chaired the meeting. Vice Directors, Treasurer, Secretary, and all six department Heads were present. Two Vice Heads tendered apologies.</p>
        <p {...ed}><b>2. Adoption of previous minutes.</b> Minutes of meeting #13 (26 Nov 2026) were tabled. Moved by VD Daniel Tan, seconded by Treasurer Jia Hui Chong. <b>Carried unanimously.</b></p>
        <p {...ed}><b>3. Sponsorship update.</b> Head NI reported RM 18,500 secured against target RM 45,000. Four Platinum/Gold prospects remain stalled. Action: escalation calls to be initiated by 10 Dec.</p>
        <p {...ed}><b>4. Publicity.</b> Brand Toolkit submitted to UM Branding 1 Dec; awaiting approval (est. 12 days based on 2026 cadence).</p>
        <p {...ed}><b>5. Treasurer's report.</b> Bank balance RM 51,040. Pending approvals RM 6,754. Variance is +RM 500 on LOGI — Treasurer to investigate AV upgrade line.</p>
        <p {...ed}><b>6. Any other business.</b> Code Sprint 2027 registration crossed 142 participants. Atrium AI flagged MDEC grant window closing 10 Jan; assigned to Treasurer + VD Daniel Tan.</p>
        <p {...ed}><b>7. Next meeting.</b> 10 December 2026, 8:00 PM, DKU3.</p>
        <p {...ed}>Meeting adjourned at 9:42 PM.</p>
        <SignatureBlock onEdit={onEdit} left={{ role: "Secretary",   name: "Faris Hakim",     signed: "Faris" }} right={{ role: "Director", name: "Aisyah Rahman", signed: "Aisyah" }} />
      </div>
    );
  }

  if (doc.kind === "MOU") {
    return (
      <div className="sec-doc-body">
        <h2 {...ed}>Memorandum of Understanding</h2>
        <p className="salutation" {...ed}>This Memorandum of Understanding ("MOU") is entered into on this 28th day of November 2026, by and between:</p>
        <p {...ed}><b>Party A:</b> Universiti Malaya, acting through the Faculty of Computer Science and Information Technology (hereinafter "FCSIT"), represented by the MYTECH 2027 Organising Committee.</p>
        <p {...ed}><b>Party B:</b> Maybank Berhad, a company incorporated under the laws of Malaysia, with its principal office at Menara Maybank, Kuala Lumpur (hereinafter "Maybank").</p>
        <p {...ed}><b>1. Purpose.</b> The Parties wish to collaborate on MYTECH 2027 — a career fair to be held 9–11 March 2027 — with Maybank as Platinum Sponsor.</p>
        <p {...ed}><b>2. Contribution.</b> Maybank shall contribute a sum of Ringgit Malaysia Twenty-Five Thousand (RM 25,000) by 15 February 2027, in exchange for the deliverables enumerated in Annex A.</p>
        <p {...ed}><b>3. Deliverables.</b> FCSIT shall provide: keynote speaking slot (Day 1, 30 minutes), Platinum-tier branding on all event collateral, prime booth placement (4×3 m), and dedicated MC mentions across the 3-day programme.</p>
        <p {...ed}><b>4. Term.</b> This MOU shall be effective from the date of execution and shall remain in force until 30 April 2027.</p>
        <p {...ed}><b>5. Confidentiality.</b> Either Party shall not disclose confidential information shared during this engagement, save for what is required for fulfilment of the deliverables.</p>
        <p {...ed} style={{ marginTop: 24 }}>IN WITNESS WHEREOF, the Parties hereto have executed this MOU on the date first above written.</p>
        <SignatureBlock onEdit={onEdit} left={{ role: "Director, MYTECH 2027",  name: "Aisyah Rahman",  signed: "Aisyah", stamp: "FCSIT\nUNIVERSITI\nMALAYA" }} right={{ role: "Head of Branding, Maybank",  name: "Ms. Alia Rosli",  signed: "Alia R.", stamp: "MAYBANK\nBERHAD" }} />
      </div>
    );
  }

  if (doc.kind === "Proposal") {
    return (
      <div className="sec-doc-body">
        <h2 {...ed}>MYTECH 2027 — Event Proposal</h2>
        <div className="meta-line">
          <div><span className="label">Reference:</span><span {...ed}>{doc.refNo}</span></div>
          <div><span className="label">Submitted by:</span><span {...ed}>Aisyah Rahman, Director</span></div>
        </div>
        <p {...ed}><b>Executive summary.</b> MYTECH 2027 is a three-day career fair (9–11 March 2027) connecting Computer Science students with leading industry employers in the Klang Valley. Anticipated reach: 1,800 students, 32 sponsors, 28 industry talks.</p>
        <p {...ed}><b>Objectives.</b></p>
        <ol {...ed}>
          <li>Increase graduating-class employment readiness by ≥18% (vs. 2026).</li>
          <li>Secure ≥ RM 45,000 in industry sponsorship.</li>
          <li>Establish 5 new industry partnerships for the FCSIT alumni programme.</li>
        </ol>
        <p {...ed}><b>Budget.</b> Total approved budget: RM 78,000. Revenue target: RM 45,000 (sponsorship) + RM 4,000 (booth fees). Net target: ≤ RM 29,000 from faculty operating fund.</p>
        <p {...ed}><b>Approvals required.</b> Faculty (FCSIT), HEP (Bahagian Hal Ehwal Pelajar), UM Central (for VIP speakers).</p>
        <p {...ed}><b>Risk register.</b> Sponsor budget compression (mitigation: diversified outreach); venue availability (mitigation: UMPoint pre-booked); volunteer attrition (mitigation: T-2 recruitment buffer).</p>
        <SignatureBlock onEdit={onEdit} left={{ role: "Director",  name: "Aisyah Rahman",  signed: "Aisyah" }} right={{ role: "Faculty Advisor",  name: "Dr. Tan H.W.",  signed: "T.H.W." }} />
      </div>
    );
  }

  if (doc.kind === "Report") {
    return (
      <div className="sec-doc-body">
        <h2 {...ed}>MYTECH 2026 — Post-Event Report</h2>
        <p {...ed}><b>1. Attendance.</b> 1,684 verified participants (target 1,500). Day 2 saw 720 walk-ins.</p>
        <p {...ed}><b>2. Financial summary.</b> Revenue RM 38,200. Expenses RM 71,240. Net subsidy from faculty operating fund: RM 33,040.</p>
        <p {...ed}><b>3. Sponsor servicing.</b> All Platinum and Gold deliverables fulfilled. Two Silver booths under-utilized (Day 3 afternoon).</p>
        <p {...ed}><b>4. Lessons learned.</b> PA system failure on Day 1 (20-min outage) prompted backup vendor sourcing for 2027. Registration database fragmentation (47 duplicates) prompts centralized Atrium build for 2027.</p>
        <p {...ed}><b>5. Recommendations for 2027.</b> Lock backup AV by T-6. Centralized registration. Expand Sponsorship pipeline by 30 leads. Reserve RM 2,500 LOGI contingency line.</p>
        <SignatureBlock onEdit={onEdit} left={{ role: "Secretary 2026",  name: "Lim Hooi Yi",  signed: "L.H.Y." }} right={{ role: "Director 2026",  name: "Khairul Anwar",  signed: "K.A." }} />
      </div>
    );
  }

  // Default — Official Letter
  return (
    <div className="sec-doc-body">
      <div className="meta-line">
        <div><span className="label">Date:</span> <span {...ed}>25 November 2026</span></div>
        <div><span className="label">Reference:</span> <span {...ed}>{doc.refNo}</span></div>
      </div>
      <p {...ed} style={{ marginTop: 6 }}>
        Dato' Sri Hjh. Nik Aishah binti Mohamed<br/>
        Senior Vice President, Group Marketing<br/>
        Maybank Berhad, Menara Maybank<br/>
        Jalan Tun Perak, 50050 Kuala Lumpur
      </p>
      <p {...ed} className="salutation"><b>Dear Dato' Sri,</b></p>
      <p {...ed} style={{ textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700, margin: "18px 0" }}>
        INVITATION TO DELIVER THE OPENING KEYNOTE — MYTECH 2027
      </p>
      <p {...ed}>On behalf of the Faculty of Computer Science & Information Technology, Universiti Malaya, and the MYTECH 2027 Organising Committee, it is with great honour that we extend to you an invitation to deliver the opening keynote address at our flagship annual career fair.</p>
      <p {...ed}>MYTECH 2027 will be held from <b>9 to 11 March 2027</b> at the FCSIT Atrium, Universiti Malaya. The event is expected to gather over 1,800 students and 32 industry partners. Your keynote on the future of digital banking and talent in Malaysia would be a defining moment for our graduating cohort.</p>
      <p {...ed}>We propose the following arrangement, subject to your kind acceptance:</p>
      <ol {...ed}>
        <li>Date and time: 9 March 2027, 9:30 AM – 10:15 AM (45-minute address with Q&A).</li>
        <li>Topic: <i>"Code in Service of Community — Banking in the Next Decade"</i> (suggested; open to your preference).</li>
        <li>Hosting: full transportation, refreshments, and a closing recognition ceremony.</li>
      </ol>
      <p {...ed}>We would be deeply grateful for the opportunity to confirm your participation. Should you require any clarification, kindly contact the undersigned at <i>faris@um.edu.my</i> or +60 12-345 6789.</p>
      <p {...ed}>We look forward to your gracious response.</p>
      <p {...ed} style={{ marginTop: 20 }}>Yours sincerely,</p>
      <SignatureBlock
        onEdit={onEdit}
        left={{ role: "Director, MYTECH 2027",  name: "Aisyah Rahman",  signed: "Aisyah" }}
        right={{ role: "Secretary, MYTECH 2027",  name: "Faris Hakim",  signed: "Faris", stamp: "MYTECH\n2027\nSEAL" }}
      />
    </div>
  );
}

// ===== Signature block =====
function SignatureBlock({ left, right, onEdit }) {
  const ed = { contentEditable: true, suppressContentEditableWarning: true, onInput: onEdit, className: "editable" };
  const Sig = ({ p }) => (
    <div className="sec-sign">
      <div className="sig-line">
        <span className="signed" {...ed}>{p.signed}</span>
        {p.stamp && <span className="stamp" {...ed} style={{ whiteSpace: "pre" }}>{p.stamp}</span>}
      </div>
      <div className="name" {...ed}>{p.name}</div>
      <div className="role" {...ed}>{p.role}</div>
    </div>
  );
  return (
    <div className="sec-sign-block">
      <Sig p={left} />
      <Sig p={right} />
    </div>
  );
}

// ===== Templates panel — edit the letterhead + footer that EVERY document uses =====
function TemplatesPanel() {
  const [savedLabel, setSavedLabel] = useState("Templates saved");
  const onEdit = () => {
    setSavedLabel("Saving…");
    clearTimeout(window.__secTplTimer);
    window.__secTplTimer = setTimeout(() => setSavedLabel("Templates saved · just now"), 600);
  };
  const ed = { contentEditable: true, suppressContentEditableWarning: true, onInput: onEdit, className: "editable" };

  return (
    <div className="sec-edit" style={{ gridColumn: "2 / 4" }}>
      <div className="sec-edit-head">
        <div className="crumb"><span>Admin</span><span className="sep">›</span><strong>Header &amp; templates</strong></div>
        <div className="right">
          <span className="saved"><span className="dot"></span>{savedLabel}</span>
          <button className="btn">Restore default</button>
          <button className="btn primary">Publish to all documents</button>
        </div>
      </div>

      <div className="sec-doc-scroll">
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div className="sec-hint" style={{ maxWidth: "none" }}>
            <span>⚙</span>
            <span>Edit the institutional header and footer once — every letter, MOU, and minutes you create afterwards will use this template. Click any block to edit.</span>
          </div>

          <div className="sec-template-card">
            <div className="label">Master letterhead</div>
            <div className="preview">
              <header className="sec-letterhead" style={{ padding: "24px 32px 16px" }}>
                <div className="seal" {...ed}>UM</div>
                <div>
                  <div className="org" {...ed}>Faculty of Computer Science & Information Technology · Universiti Malaya</div>
                  <h1 className="title" {...ed} style={{ fontSize: 20 }}>MYTECH 2027 Organising Committee</h1>
                  <div className="subtitle" {...ed}>Office of the Secretary — Faris Hakim · faris@um.edu.my</div>
                </div>
                <div className="addr" {...ed}>
                  Block A, FCSIT{"\n"}50603 Kuala Lumpur{"\n"}Malaysia{"\n"}+60 3-7967 6300
                </div>
              </header>
            </div>
          </div>

          <div className="sec-template-card">
            <div className="label">Master footer</div>
            <div className="preview foot">
              <span {...ed}>{"MYTECH27/<DOC-TYPE>/<NUM>"}</span> · <span {...ed}>Issued under MYTECH 2027 Secretariat</span> · <span {...ed}>fcsit.um.edu.my/mytech27</span>
            </div>
          </div>

          <div className="sec-template-card">
            <div className="label">Document numbering scheme</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, fontSize: 12.5 }}>
              <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                <div className="muted tiny">Minutes</div>
                <div className="mono" {...ed}>MYTECH27/MIN/{`{YYYY}-{###}`}</div>
              </div>
              <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                <div className="muted tiny">Official letter</div>
                <div className="mono" {...ed}>MYTECH27/LTR/{`{RECIPIENT}/{###}`}</div>
              </div>
              <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                <div className="muted tiny">MOU</div>
                <div className="mono" {...ed}>MYTECH27/MOU/{`{PARTY}/v{N}`}</div>
              </div>
              <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                <div className="muted tiny">Proposal</div>
                <div className="mono" {...ed}>MYTECH27/PROP/v{`{N}`}</div>
              </div>
            </div>
          </div>

          <div className="sec-template-card">
            <div className="label">Stamp / seal</div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div className="sec-sign" style={{ width: 200 }}>
                <div className="sig-line">
                  <span className="stamp" {...ed} style={{ whiteSpace: "pre", position: "static", transform: "rotate(-12deg)" }}>
                    {"MYTECH\n2027\nSEAL"}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", maxWidth: 360 }}>
                The seal is applied to MOUs and official correspondence. Edit the inner text — the ring is generated.
              </div>
            </div>
          </div>

          <div className="sec-template-card">
            <div className="label">Quick templates · click to copy a new draft</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { name: "Meeting minutes",          desc: "Quorum, agenda items, votes, action items.", emoji: "📋" },
                { name: "Official invitation",      desc: "VIP, sponsor, faculty advisor.",              emoji: "✉️" },
                { name: "Sponsor MOU",              desc: "Standard 5-clause memorandum.",               emoji: "🤝" },
                { name: "Event proposal",           desc: "Executive summary + budget + approvals.",     emoji: "📑" },
                { name: "Post-event report",        desc: "Attendance, finance, lessons learned.",       emoji: "📊" },
                { name: "Acknowledgement letter",   desc: "Thank-you to sponsors / speakers.",           emoji: "🙏" },
              ].map((t, i) => (
                <div key={i} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", cursor: "pointer" }}>
                  <div style={{ fontSize: 18 }}>{t.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{t.name}</div>
                  <div className="muted tiny" style={{ marginTop: 2 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SecretaryApp />);
