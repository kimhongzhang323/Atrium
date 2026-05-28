// viewer.jsx — direct renderer for spreadsheet / doc / pdf inside Atrium

const FILE_BLOBS = {
  // ===== Spreadsheet — Sponsorship Pipeline =====
  "Sponsorship_Pipeline_Tracker.xlsx": {
    kind: "sheet",
    title: "Sponsorship Pipeline Tracker",
    sheets: ["Pipeline", "Targets", "Notes"],
    cols: ["Sponsor", "Tier", "Amount (RM)", "Status", "Contact", "Owner", "Last Touch"],
    widths: [180, 90, 110, 130, 150, 80, 120],
    rows: [
      ["Maybank",          "Platinum", 25000, "Signed",        "Alia Rosli",  "NI", "Dec 03"],
      ["Petronas",         "Platinum", 22000, "Negotiating",   "Encik Hadi",  "NI", "Nov 30"],
      ["TM ONE",           "Gold",     12000, "Signed",        "Daphne Yew",  "KL", "Dec 02"],
      ["GXBank",           "Gold",     12000, "Proposal Sent", "Marcus Tan",  "KL", "Nov 28"],
      ["Shopee",           "Silver",    7500, "Signed",        "Lim Wei",     "SM", "Dec 01"],
      ["Grab",             "Silver",    7500, "Negotiating",   "Adlin Hashim","SM", "Nov 27"],
      ["Accenture",        "Silver",    6000, "Cold",          "Vikram Singh","LK", "—"],
      ["AirAsia",          "Booth",     3500, "Signed",        "Faiz Anuar",  "SM", "Nov 29"],
      ["Carsome",          "Booth",     3500, "Proposal Sent", "Jia Wen",     "LK", "Nov 25"],
      ["iflix / IOI",      "Booth",     3500, "Declined",      "Ravi K.",     "LK", "Nov 22"],
      ["",                 "",            "", "",              "",            "",   ""],
      ["TOTAL",            "",        102500, "",              "",            "",   ""],
      ["Signed",           "",         48000, "",              "",            "",   ""],
      ["Pipeline",         "",         54500, "",              "",            "",   ""],
    ],
    formula: "=SUM(C2:C11)",
  },

  // ===== Spreadsheet — Budget Revision =====
  "Budget_Revision_Q4.gsheet": {
    kind: "sheet",
    title: "Budget Revision · Q4 2026",
    sheets: ["By Department", "Line items", "2026 actuals"],
    cols: ["Department", "Category", "Budget", "Committed", "Spent", "Free"],
    widths: [80, 220, 120, 120, 120, 110],
    rows: [
      ["LOGI", "Venue & equipment",   22000, 14000, 8500, 8000],
      ["PnP",  "Speakers & program",  14000,  4200, 1200, 9800],
      ["MM",   "Branding & design",    9000,  4500, 2800, 4500],
      ["PUB",  "Marketing & ads",      8000,  3200, 1400, 4800],
      ["TECH", "Web, AV, IT",         11000,  6500, 2200, 4500],
      ["SPR",  "Sponsor servicing",    6000,  3500, 1100, 2500],
      ["HC",   "Admin · contingency",  8000,  6600, 1000, 1400],
      ["",     "",                       "",    "",    "",  ""],
      ["TOTAL","",                    78000, 42500,18200,35500],
    ],
    formula: "=B2/SUM($B$2:$B$8)",
  },

  // ===== Doc — Maybank MOU =====
  "Maybank_MOU_Draft_v2.docx": {
    kind: "doc",
    title: "Maybank — Memorandum of Understanding (Draft v2)",
    meta: "11 pages · 4,820 words · Last edited 8h ago by Kelvin Lim",
    blocks: [
      { type: "h1", text: "Memorandum of Understanding" },
      { type: "small", text: "Between Universiti Malaya (FCSIT Career Fair Committee) and Malayan Banking Berhad" },
      { type: "p", text: "This Memorandum of Understanding (the \"MOU\") is entered into on this 15th day of December 2026 between the Faculty of Computer Science and Information Technology of Universiti Malaya (hereinafter referred to as \"FCSIT\") and Malayan Banking Berhad (hereinafter referred to as \"Maybank\")." },
      { type: "h2", text: "1.0  Background" },
      { type: "p", text: "FCSIT shall organise MYTECH 2027, a three-day career fair held at the Faculty of Computer Science and Information Technology, Universiti Malaya, from 9 to 11 March 2027. Maybank wishes to participate as the Platinum-tier sponsor of MYTECH 2027." },
      { type: "h2", text: "2.0  Sponsorship Contribution" },
      { type: "p", text: "2.1  Maybank agrees to contribute Ringgit Malaysia Twenty-Five Thousand (RM 25,000.00) as the Platinum-tier sponsor of MYTECH 2027." },
      { type: "p", text: "2.2  Payment shall be made in two (2) tranches: fifty percent (50%) upon execution of this MOU and the balance fifty percent (50%) within fourteen (14) days following the conclusion of MYTECH 2027." },
      { type: "h2", text: "3.0  Sponsor Deliverables" },
      { type: "bullets", items: [
        "Premium booth placement (4m × 3m) in the FCSIT Atrium across all three event days",
        "Logo placement on all printed and digital collateral as the Platinum-tier sponsor",
        "Twenty (20) minute keynote slot on Day 1 (10 March 2027) at the Opening Ceremony",
        "Naming rights to the Grand Lucky Draw prize (\"Maybank Grand Prize\")",
        "Two (2) social-media features on the MYTECH 2027 channels (Instagram, LinkedIn)",
        "Inclusion in the official press release distributed at T-2 weeks",
      ]},
      { type: "h2", text: "4.0  Term and Termination" },
      { type: "p", text: "4.1  This MOU shall come into effect on the date first written above and shall remain valid until thirty (30) days after the conclusion of MYTECH 2027, unless terminated earlier by mutual written agreement." },
      { type: "p", text: "4.2  Either party may terminate this MOU by giving fourteen (14) days' written notice to the other party in the event of material breach." },
      { type: "h2", text: "5.0  Confidentiality" },
      { type: "p", text: "Each party undertakes to keep confidential all information of a commercial or technical nature disclosed by the other party in connection with this MOU." },
    ],
    comments: [
      { who: "Faris H.", at: "p. 3, §2.2", note: "UM Finance prefers single-tranche payment T-2 weeks. Flag with treasurer." },
      { who: "Aisyah R.", at: "p. 5, §3", note: "Confirm booth size with LOGI — Atrium pillars limit to 4×2.5m on the east wall." },
    ],
  },

  // ===== Doc — Speaker Bios =====
  "Speaker_Bios_Industry_Talk.gdoc": {
    kind: "doc",
    title: "Speaker Bios — Industry Talk Track",
    meta: "6 pages · 1,840 words · Hafiz Idris",
    blocks: [
      { type: "h1", text: "Industry Talk — Speaker Bios" },
      { type: "small", text: "For internal MYTECH 2027 use. Final bios pending speaker sign-off." },
      { type: "h2", text: "Day 1 · Opening Keynote" },
      { type: "p", text: "Datin Sarah Chen — Group CTO, Maybank. Sarah leads engineering across Maybank's digital banking platform serving 12 million customers across ASEAN. A graduate of the University of Malaya's Faculty of Computer Science (1998), she previously held senior roles at AmBank and TM. She is a recipient of the National ICT Leadership Award 2023." },
      { type: "h2", text: "Day 1 · Industry Panel" },
      { type: "p", text: "Encik Hadi Mokhtar — Head of Digital Transformation, Petronas. Hadi has spent the past decade building Petronas' cloud and data engineering capability." },
      { type: "p", text: "Marcus Tan — Founding Engineer, GXBank. Marcus was employee #4 at GXBank, Malaysia's first digital-only bank, and now leads platform engineering." },
      { type: "h2", text: "Day 2 · Career Workshop" },
      { type: "p", text: "Lim Wei — Engineering Manager, Shopee Malaysia. A career coach for under-represented founders, Wei runs Shopee's intern programme." },
      { type: "p", text: "Adlin Hashim — Senior Recruiter, Grab. Adlin has hired more than 200 engineers across the SEA region in the past three years." },
    ],
    comments: [
      { who: "Sara Y.", at: "p. 2", note: "Need confirmed photo for Datin Sarah — MM dept to chase by Dec 18." },
    ],
  },

  // ===== PDF — Platinum Deck =====
  "MYTECH27_Platinum_Deck_v3.pdf": {
    kind: "pdf",
    title: "MYTECH 2027 — Platinum Sponsorship Deck",
    meta: "14 pages · 12.4 MB · Nurul Izzati",
    pages: [
      { kind: "title", a: "MYTECH 2027", b: "Platinum Sponsorship Proposal", c: "9–11 March · FCSIT, Universiti Malaya" },
      { kind: "intro", a: "About the event", b: "Three days. One thousand eight hundred students. Direct hiring pipeline to Malaysia's largest CS faculty.", stats: [["1,684","2026 attendees"],["86","CS / SE / DS students per booth"],["RM 38.2k","2026 sponsor revenue"]] },
      { kind: "tiers" },
      { kind: "stats" },
      { kind: "deliverables" },
      { kind: "outro", a: "Thank you", b: "Nurul Izzati — Head of Sponsorship", c: "nurul@mytech-um.edu.my  ·  +60 12 345 6789" },
    ],
  },

  // ===== PDF — Floor plan (uses .fig as a stand-in) =====
  "Atrium_Floor_v2.fig": {
    kind: "image",
    title: "Atrium Floor Plan — v2",
    meta: "Figma export · 1.8 MB · Rajesh Kumar",
    body: "floor",
  },

  // ===== Image — Logo zip =====
  "Logo_Final_MYTECH27.zip": {
    kind: "archive",
    title: "Logo Final — MYTECH 2027",
    meta: "ZIP archive · 84 MB · Lee Sze Min",
    contents: [
      "MYTECH27_Primary_Logo.svg",
      "MYTECH27_Primary_Logo.png",
      "MYTECH27_Monochrome.svg",
      "MYTECH27_Lockup_Horizontal.svg",
      "MYTECH27_Lockup_Stacked.svg",
      "MYTECH27_Wordmark.svg",
      "Brand_Guidelines_v4.pdf",
      "Social_Avatar_512.png",
      "Social_Avatar_1024.png",
      "Favicon_64.ico",
    ],
  },
};

function DocViewer({ filename, onClose }) {
  const blob = FILE_BLOBS[filename];
  if (!blob) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal" style={{ width: "min(1080px, 94vw)", maxHeight: "92vh" }}>
        <div className="modal-head" style={{ padding: "10px 14px 10px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <FileGlyph kind={blob.kind} />
            <div style={{ minWidth: 0 }}>
              <div className="modal-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{blob.title}</div>
              <div className="tiny muted">{blob.meta || filename}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button className="btn ghost">Share</button>
            <button className="btn">Download</button>
            <button className="btn">{ICONS.drive} Open in Drive</button>
            <button className="icon-btn" onClick={onClose}>{ICONS.close}</button>
          </div>
        </div>
        <div className="modal-body" style={{ padding: 0, background: "var(--bg)" }}>
          {blob.kind === "sheet"   && <SheetView blob={blob} />}
          {blob.kind === "doc"     && <DocView blob={blob} />}
          {blob.kind === "pdf"     && <PdfView blob={blob} />}
          {blob.kind === "image"   && <ImageView blob={blob} />}
          {blob.kind === "archive" && <ArchiveView blob={blob} />}
        </div>
      </div>
    </div>
  );
}

function FileGlyph({ kind }) {
  const map = {
    sheet:   { bg: "#1d8a3a", letter: "S" },
    doc:     { bg: "#1d4ed8", letter: "D" },
    pdf:     { bg: "#c53030", letter: "P" },
    image:   { bg: "#6b21a8", letter: "I" },
    archive: { bg: "#6e6e73", letter: "Z" },
  };
  const m = map[kind] || map.doc;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 6,
      background: m.bg, color: "white",
      display: "grid", placeItems: "center",
      fontSize: 12, fontWeight: 700,
    }}>{m.letter}</div>
  );
}

// ============ SHEET ============
function SheetView({ blob }) {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState({ r: 1, c: 2 });
  const colLetter = (i) => String.fromCharCode(65 + i);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "72vh" }}>
      {/* Formula bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderBottom: "1px solid var(--border)", background: "var(--bg-elev)", fontSize: 12 }}>
        <span className="mono muted" style={{ width: 50 }}>{colLetter(selected.c)}{selected.r}</span>
        <span className="mono" style={{ color: "var(--text-tertiary)" }}>ƒx</span>
        <span className="mono">{blob.rows[selected.r - 1]?.[selected.c] ?? ""}</span>
      </div>

      {/* Spreadsheet body */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--bg-elev)" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "var(--font-mono)", width: "100%", minWidth: 720 }}>
          <thead>
            <tr>
              <th style={th()}></th>
              {blob.cols.map((_, i) => (
                <th key={i} style={{ ...th(), width: blob.widths[i] || 120, textAlign: "center", fontWeight: 500 }}>{colLetter(i)}</th>
              ))}
            </tr>
            <tr>
              <th style={th()}>1</th>
              {blob.cols.map((c, i) => (
                <th key={i} style={{ ...td(), background: "var(--bg)", fontWeight: 600, textAlign: i >= 2 && typeof blob.rows[0]?.[i] === "number" ? "right" : "left" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blob.rows.map((row, ri) => (
              <tr key={ri}>
                <td style={{ ...th(), background: "var(--bg)" }}>{ri + 2}</td>
                {row.map((cell, ci) => {
                  const isNum = typeof cell === "number";
                  const isSel = selected.r === ri + 1 && selected.c === ci;
                  const isTotalRow = row[0] === "TOTAL" || row[0] === "Signed" || row[0] === "Pipeline";
                  return (
                    <td key={ci}
                      onClick={() => setSelected({ r: ri + 1, c: ci })}
                      style={{
                        ...td(),
                        textAlign: isNum ? "right" : "left",
                        background: isSel ? "rgba(29, 78, 216, 0.10)" : isTotalRow ? "var(--bg)" : "transparent",
                        outline: isSel ? "2px solid var(--info)" : "none",
                        outlineOffset: "-1px",
                        fontWeight: isTotalRow ? 600 : 400,
                        cursor: "cell",
                      }}>
                      {isNum ? cell.toLocaleString("en-MY") : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
            {Array.from({ length: 18 - blob.rows.length }, (_, ri) => (
              <tr key={"e"+ri}>
                <td style={{ ...th(), background: "var(--bg)" }}>{blob.rows.length + ri + 2}</td>
                {blob.cols.map((_, ci) => <td key={ci} style={{ ...td() }}></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 8px", borderTop: "1px solid var(--border)", background: "var(--bg)", fontSize: 12 }}>
        {blob.sheets.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            border: "none", background: active === i ? "var(--bg-elev)" : "transparent",
            padding: "4px 12px", borderRadius: "5px 5px 0 0",
            color: active === i ? "var(--text)" : "var(--text-secondary)",
            fontWeight: active === i ? 500 : 400, cursor: "pointer",
            borderTop: active === i ? "2px solid var(--success)" : "2px solid transparent",
          }}>{s}</button>
        ))}
        <button className="icon-btn" style={{ marginLeft: 2 }}>{ICONS.plus}</button>
        <span style={{ flex: 1 }}></span>
        <span className="muted tiny">{blob.rows.length} rows · sum updated live</span>
      </div>
    </div>
  );
}
function th() { return { padding: "5px 8px", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", color: "var(--text-tertiary)", fontSize: 11, position: "sticky", top: 0, background: "var(--bg)", zIndex: 1 }; }
function td() { return { padding: "5px 10px", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }; }

// ============ DOC ============
function DocView({ blob }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", height: "78vh" }}>
      <div style={{ overflow: "auto", padding: "40px 0", background: "var(--bg)" }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
          background: "var(--bg-elev)",
          boxShadow: "var(--shadow)",
          borderRadius: 6,
          padding: "64px 80px",
          fontSize: 14, lineHeight: 1.7,
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "var(--text)",
        }}>
          {blob.blocks.map((b, i) => {
            if (b.type === "h1")     return <h1 key={i} style={{ fontSize: 26, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em", textAlign: "center", fontFamily: "var(--font)" }}>{b.text}</h1>;
            if (b.type === "small")  return <p key={i} style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 12.5, margin: "0 0 30px", fontFamily: "var(--font)" }}>{b.text}</p>;
            if (b.type === "h2")     return <h2 key={i} style={{ fontSize: 16, fontWeight: 600, margin: "22px 0 8px", fontFamily: "var(--font)", letterSpacing: "-0.005em" }}>{b.text}</h2>;
            if (b.type === "p")      return <p key={i} style={{ margin: "0 0 12px", textAlign: "justify" }}>{b.text}</p>;
            if (b.type === "bullets")return <ul key={i} style={{ margin: "0 0 14px 18px" }}>{b.items.map((it, j) => <li key={j} style={{ marginBottom: 6 }}>{it}</li>)}</ul>;
            return null;
          })}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, fontSize: 12.5, fontFamily: "var(--font)" }}>
            <div>
              <div style={{ height: 30, borderBottom: "1px solid var(--text)" }}></div>
              <div style={{ marginTop: 4, color: "var(--text-secondary)" }}>Datin Sarah Chen<br/>Group CTO, Maybank</div>
            </div>
            <div>
              <div style={{ height: 30, borderBottom: "1px solid var(--text)" }}></div>
              <div style={{ marginTop: 4, color: "var(--text-secondary)" }}>Aisyah Rahman<br/>Director, MYTECH 2027</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderLeft: "1px solid var(--border)", background: "var(--bg-elev)", overflow: "auto" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600 }}>
          Comments <span className="muted" style={{ fontWeight: 400 }}>· {blob.comments?.length || 0}</span>
        </div>
        {(blob.comments || []).map((c, i) => (
          <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div className="av-md" style={{ width: 22, height: 22, fontSize: 9.5 }}>{c.who.split(" ").map(n=>n[0]).join("")}</div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{c.who}</div>
            </div>
            <div className="tiny muted" style={{ marginBottom: 4 }}>{c.at}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>{c.note}</div>
          </div>
        ))}
        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
          <div className="ai-orb" style={{ width: 16, height: 16 }}></div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Atrium summary available</div>
          <button className="btn ghost" style={{ marginLeft: "auto", padding: "2px 8px" }}>Show</button>
        </div>
      </div>
    </div>
  );
}

// ============ PDF ============
function PdfView({ blob }) {
  const [page, setPage] = useState(1);
  const total = blob.pages.length;
  const p = blob.pages[page - 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "82vh", background: "#3a3a3c" }}>
      <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, background: "#2c2c2e", color: "white", fontSize: 12 }}>
        <button className="icon-btn" style={{ color: "white" }} onClick={() => setPage(Math.max(1, page - 1))}>‹</button>
        <span className="mono">{page} / {total}</span>
        <button className="icon-btn" style={{ color: "white" }} onClick={() => setPage(Math.min(total, page + 1))}>›</button>
        <span style={{ flex: 1 }}></span>
        <button className="btn ghost" style={{ color: "white", borderColor: "transparent" }}>Fit width</button>
        <button className="btn ghost" style={{ color: "white", borderColor: "transparent" }}>Outline</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "30px 24px", display: "flex", gap: 24, justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {blob.pages.map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 56, height: 72, borderRadius: 3,
              border: page === i + 1 ? "2px solid var(--info)" : "1px solid #555",
              background: "white", cursor: "pointer", padding: 0,
              fontSize: 9, color: "#999",
              display: "grid", placeItems: "center",
            }}>{i + 1}</button>
          ))}
        </div>
        <div style={{
          width: 720, minHeight: 960,
          background: "white", color: "#222",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          padding: 0,
          fontFamily: "var(--font)",
          overflow: "hidden",
        }}>
          <PdfPage page={p} pageNum={page} total={total} />
        </div>
      </div>
    </div>
  );
}

function PdfPage({ page, pageNum, total }) {
  if (page.kind === "title") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, background: "linear-gradient(180deg, #0a0a0a 0%, #1d1d1f 100%)", color: "white", textAlign: "center", minHeight: 960 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>FCSIT · UNIVERSITI MALAYA</div>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>{page.a}</div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.85)", marginTop: 14, fontWeight: 300 }}>{page.b}</div>
        <div style={{ width: 60, height: 1, background: "rgba(255,255,255,0.4)", margin: "40px 0" }}></div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", letterSpacing: "0.06em" }}>{page.c}</div>
      </div>
    );
  }
  if (page.kind === "intro") {
    return (
      <div style={{ padding: 64, color: "#222", minHeight: 960 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#888" }}>01 · ABOUT</div>
        <h2 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", margin: "8px 0 24px" }}>{page.a}</h2>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: "#444", maxWidth: 520, margin: "0 0 48px" }}>{page.b}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginTop: 60 }}>
          {page.stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>{s[0]}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s[1]}</div>
            </div>
          ))}
        </div>
        <Footer n={pageNum} total={total} />
      </div>
    );
  }
  if (page.kind === "tiers") {
    return (
      <div style={{ padding: 64, color: "#222", minHeight: 960 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#888" }}>02 · SPONSORSHIP TIERS</div>
        <h2 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", margin: "8px 0 32px" }}>Choose your tier</h2>
        {[
          { name: "Platinum", price: "RM 25,000", color: "#1d1d1f", perks: ["Premium booth · 4×3m","20-min Day 1 keynote","Grand Prize naming","2 social features","Press release inclusion"] },
          { name: "Gold",     price: "RM 12,000", color: "#b25e00", perks: ["Standard booth · 3×3m","10-min Day 2 slot","1 social feature","Logo on all collateral"] },
          { name: "Silver",   price: "RM 7,500",  color: "#6e6e73", perks: ["Standard booth · 2×3m","Workshop participation","Logo on website"] },
        ].map((t, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 110px 1fr", padding: "16px 0", borderTop: "1px solid #ddd", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: t.color }}>{t.name}</div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{t.price}</div>
            <div style={{ fontSize: 12.5, color: "#555", lineHeight: 1.5 }}>{t.perks.join(" · ")}</div>
          </div>
        ))}
        <Footer n={pageNum} total={total} />
      </div>
    );
  }
  if (page.kind === "stats") {
    return (
      <div style={{ padding: 64, color: "#222", minHeight: 960 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#888" }}>03 · 2026 IN NUMBERS</div>
        <h2 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", margin: "8px 0 32px" }}>The audience you'll reach</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {[
            ["1,684", "Attendees in 2026"],
            ["+12%", "Above attendance target"],
            ["86", "Year 2–4 students per sponsor booth"],
            ["62", "Attendee NPS"],
            ["184k", "Social media reach"],
            ["11", "Press mentions"],
          ].map((s, i) => (
            <div key={i} style={{ paddingBottom: 14, borderBottom: "1px solid #eee" }}>
              <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>{s[0]}</div>
              <div style={{ fontSize: 12.5, color: "#666", marginTop: 4 }}>{s[1]}</div>
            </div>
          ))}
        </div>
        <Footer n={pageNum} total={total} />
      </div>
    );
  }
  if (page.kind === "deliverables") {
    return (
      <div style={{ padding: 64, color: "#222", minHeight: 960 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#888" }}>04 · WHAT YOU GET</div>
        <h2 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", margin: "8px 0 32px" }}>Platinum deliverables</h2>
        {[
          ["Before the event", "Logo + bio on the official website (T-10 weeks) · Dedicated Instagram post · LinkedIn feature · Press release inclusion"],
          ["During the event", "4×3m premium booth in FCSIT Atrium · 20-min Day 1 keynote · Lounge co-branding · Lucky-draw segment in your name"],
          ["After the event",  "Attendee data report (anonymized) · 2× thank-you posts · Inclusion in 2028 first-look pitch"],
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#1d1d1f" }}>{s[0]}</div>
            <div style={{ fontSize: 14.5, color: "#444", marginTop: 6, lineHeight: 1.55 }}>{s[1]}</div>
          </div>
        ))}
        <Footer n={pageNum} total={total} />
      </div>
    );
  }
  if (page.kind === "outro") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, background: "#fafafa", color: "#222", textAlign: "center", minHeight: 960 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#888" }}>05 · CONTACT</div>
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em", margin: "12px 0 20px" }}>{page.a}</div>
        <div style={{ fontSize: 17, color: "#444", marginBottom: 6 }}>{page.b}</div>
        <div style={{ fontSize: 13, color: "#888", fontFamily: "var(--font-mono)" }}>{page.c}</div>
      </div>
    );
  }
  return null;
}

function Footer({ n, total }) {
  return (
    <div style={{ position: "absolute", bottom: 24, left: 64, right: 64, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", letterSpacing: "0.06em" }}>
      <span>MYTECH 2027 · PLATINUM PROPOSAL</span>
      <span>{n} / {total}</span>
    </div>
  );
}

// ============ IMAGE / FLOOR PLAN ============
function ImageView({ blob }) {
  return (
    <div style={{ height: "76vh", overflow: "auto", padding: 24, background: "var(--bg)", display: "grid", placeItems: "center" }}>
      <div style={{ background: "var(--bg-elev)", boxShadow: "var(--shadow)", borderRadius: 8, padding: 24 }}>
        <FloorPlan />
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", marginTop: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          FCSIT Atrium · Floor Plan v2 · Scale 1:200
        </div>
      </div>
    </div>
  );
}

function FloorPlan() {
  return (
    <svg viewBox="0 0 760 480" style={{ width: 720, height: 460 }}>
      {/* Outer wall */}
      <rect x="20" y="20" width="720" height="440" fill="none" stroke="var(--text)" strokeWidth="2.5" />
      {/* Entrance */}
      <line x1="380" y1="20" x2="420" y2="20" stroke="var(--bg-elev)" strokeWidth="4" />
      <text x="400" y="14" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">ENTRANCE</text>

      {/* Booths along walls */}
      {[...Array(8)].map((_, i) => (
        <g key={"top"+i}>
          <rect x={50 + i * 80} y={50} width={70} height={50} fill="var(--accent-soft)" stroke="var(--border-strong)" />
          <text x={85 + i * 80} y={80} fontSize="10" textAnchor="middle" fill="var(--text)">S{i+1}</text>
        </g>
      ))}
      {[...Array(8)].map((_, i) => (
        <g key={"bot"+i}>
          <rect x={50 + i * 80} y={380} width={70} height={50} fill="var(--accent-soft)" stroke="var(--border-strong)" />
          <text x={85 + i * 80} y={410} fontSize="10" textAnchor="middle" fill="var(--text)">S{i+9}</text>
        </g>
      ))}

      {/* Platinum booths center */}
      <rect x="260" y="170" width="100" height="80" fill="rgba(29,29,31,0.9)" stroke="var(--text)" />
      <text x="310" y="215" fontSize="12" fontWeight="600" textAnchor="middle" fill="white">MAYBANK</text>
      <text x="310" y="230" fontSize="9" textAnchor="middle" fill="rgba(255,255,255,0.7)">Platinum</text>

      <rect x="400" y="170" width="100" height="80" fill="rgba(29,29,31,0.9)" stroke="var(--text)" />
      <text x="450" y="215" fontSize="12" fontWeight="600" textAnchor="middle" fill="white">PETRONAS</text>
      <text x="450" y="230" fontSize="9" textAnchor="middle" fill="rgba(255,255,255,0.7)">Platinum</text>

      {/* Stage */}
      <rect x="540" y="170" width="170" height="80" fill="var(--info-soft)" stroke="var(--info)" strokeDasharray="4,3" />
      <text x="625" y="215" fontSize="12" fontWeight="600" textAnchor="middle" fill="var(--info)">STAGE</text>
      <text x="625" y="230" fontSize="9" textAnchor="middle" fill="var(--info)">Day 1 keynote</text>

      {/* Registration */}
      <rect x="50" y="170" width="180" height="80" fill="var(--success-soft)" stroke="var(--success)" strokeDasharray="4,3" />
      <text x="140" y="215" fontSize="12" fontWeight="600" textAnchor="middle" fill="var(--success)">REGISTRATION</text>
      <text x="140" y="230" fontSize="9" textAnchor="middle" fill="var(--success)">+ photo wall</text>

      {/* Dimensions */}
      <text x="400" y="455" fontSize="10" textAnchor="middle" fill="var(--text-tertiary)">42m wide</text>
      <text x="10" y="240" fontSize="10" textAnchor="middle" fill="var(--text-tertiary)" transform="rotate(-90 10 240)">28m deep</text>

      {/* Legend */}
      <g transform="translate(540, 30)">
        <rect x="0" y="0" width="14" height="10" fill="rgba(29,29,31,0.9)" />
        <text x="20" y="9" fontSize="10" fill="var(--text)">Platinum</text>
        <rect x="90" y="0" width="14" height="10" fill="var(--accent-soft)" stroke="var(--border-strong)" />
        <text x="110" y="9" fontSize="10" fill="var(--text)">Sponsor booth</text>
      </g>
    </svg>
  );
}

// ============ ARCHIVE ============
function ArchiveView({ blob }) {
  return (
    <div style={{ height: "70vh", overflow: "auto", padding: 18 }}>
      <div className="muted tiny" style={{ marginBottom: 12 }}>{blob.contents.length} files · double-click to extract</div>
      <div className="card" style={{ background: "var(--bg-elev)" }}>
        <div className="card-body" style={{ padding: 0 }}>
          {blob.contents.map((f, i) => (
            <div key={i} className="list-row">
              <div className="file-icon"></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{f}</div>
                <div className="tiny muted">{f.endsWith(".svg") ? "Scalable Vector Graphics" : f.endsWith(".png") ? "PNG image" : f.endsWith(".pdf") ? "PDF document" : f.endsWith(".ico") ? "Icon file" : "File"}</div>
              </div>
              <button className="btn ghost" style={{ padding: "3px 8px" }}>Preview</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DocViewer, FILE_BLOBS });
