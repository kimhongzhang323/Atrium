// views-6.jsx — Inventory / Storage tracking + Fuel claim calculator

// ============ INVENTORY DATA ============
const LOCATIONS = [
  { id: "STORE-A",  name: "FCSIT Storeroom A",   floor: "Ground", who: "Rajesh Kumar",  capacity: 60, items: 0 },
  { id: "STORE-B",  name: "FCSIT Storeroom B",   floor: "L1",     who: "Aaron Goh",     capacity: 40, items: 0 },
  { id: "ATRIUM",   name: "Atrium Setup Zone",   floor: "Ground", who: "Hasif Razi",    capacity: 30, items: 0 },
  { id: "OFFICE",   name: "Committee Office",    floor: "L2",     who: "Faris Hakim",   capacity: 20, items: 0 },
  { id: "VENDOR",   name: "Vendor (SoundTech)",  floor: "—",      who: "—",             capacity: 99, items: 0 },
];

const INVENTORY = [
  {
    id: "INV-001",
    name: "JBL EON 715 PA Speaker",
    sku: "JBL-EON715-A",
    category: "AV / Audio",
    qty: 4,
    unit: "unit",
    valuePerUnit: 3200,
    status: "In storage",
    location: "STORE-A",
    custodian: "RK",
    invoice: "INV-104",
    budgetLine: "LOGI · Venue & equipment",
    purchaseDate: "Nov 22, 2026",
    condition: "New",
    serial: "SN-JBL-77241 → 77244",
    notes: "Stored with foam covers. Includes 4× XLR cables, 2× speaker stands.",
  },
  {
    id: "INV-002",
    name: "Shure SM58 Wireless Mic",
    sku: "SHURE-SM58W",
    category: "AV / Audio",
    qty: 6,
    unit: "unit",
    valuePerUnit: 480,
    status: "In storage",
    location: "STORE-A",
    custodian: "RK",
    invoice: "INV-104",
    budgetLine: "LOGI · Venue & equipment",
    purchaseDate: "Nov 22, 2026",
    condition: "New",
    serial: "SN-SHURE-A1..A6",
    notes: "Lithium battery pack × 6 charged Nov 28.",
  },
  {
    id: "INV-003",
    name: "Sponsor Banner — Maybank 4×6ft",
    sku: "BNR-MBB-46",
    category: "Print / Signage",
    qty: 2,
    unit: "pc",
    valuePerUnit: 180,
    status: "In storage",
    location: "STORE-B",
    custodian: "LM",
    invoice: "INV-105",
    budgetLine: "MM · Branding & design",
    purchaseDate: "Nov 28, 2026",
    condition: "New",
    serial: "—",
    notes: "Rolled · stored in tube AT-007. Second copy with TM ONE logo also printed.",
  },
  {
    id: "INV-004",
    name: "T-shirts — Committee crew (size mix)",
    sku: "MERCH-TEE-2027",
    category: "Merchandise",
    qty: 65,
    unit: "pc",
    valuePerUnit: 22,
    status: "In storage",
    location: "OFFICE",
    custodian: "LM",
    invoice: "INV-110",
    budgetLine: "MM · Branding & design",
    purchaseDate: "Dec 02, 2026",
    condition: "New",
    serial: "—",
    notes: "Sizes — S:10 · M:20 · L:20 · XL:10 · XXL:5. Crew distribution Dec 18.",
  },
  {
    id: "INV-005",
    name: "Lanyards — printed 'MYTECH 27'",
    sku: "MERCH-LAN-2027",
    category: "Merchandise",
    qty: 2000,
    unit: "pc",
    valuePerUnit: 1.2,
    status: "In storage",
    location: "STORE-B",
    custodian: "LM",
    invoice: "INV-111",
    budgetLine: "MM · Branding & design",
    purchaseDate: "Dec 03, 2026",
    condition: "New",
    serial: "—",
    notes: "Pre-stuffed with name-tag inserts.",
  },
  {
    id: "INV-006",
    name: "Sony A7C — committee camera",
    sku: "SONY-A7C",
    category: "AV / Photo",
    qty: 1,
    unit: "unit",
    valuePerUnit: 6800,
    status: "Checked out",
    location: "OFFICE",
    custodian: "AC",
    invoice: "—",
    budgetLine: "MM · Branding & design",
    purchaseDate: "Owned · Year-2 acquisition",
    condition: "Good · scuff on grip",
    serial: "SN-SONY-A7C-118822",
    notes: "Currently with Adam Chia for sponsor portrait shoot · due back Dec 10.",
  },
  {
    id: "INV-007",
    name: "Pop-up booth frames",
    sku: "BOOTH-FR-2x3",
    category: "Venue / Booth",
    qty: 16,
    unit: "set",
    valuePerUnit: 420,
    status: "Awaiting delivery",
    location: "VENDOR",
    custodian: "—",
    invoice: "INV-107",
    budgetLine: "LOGI · Venue & equipment",
    purchaseDate: "Expected Dec 18",
    condition: "New",
    serial: "—",
    notes: "Delivered direct from vendor to Atrium on Mar 8.",
  },
  {
    id: "INV-008",
    name: "First-aid kit",
    sku: "FA-KIT-STD",
    category: "Health & Safety",
    qty: 3,
    unit: "kit",
    valuePerUnit: 95,
    status: "In storage",
    location: "ATRIUM",
    custodian: "AG",
    invoice: "INV-112",
    budgetLine: "HC · Admin · contingency",
    purchaseDate: "Nov 30, 2026",
    condition: "New",
    serial: "—",
    notes: "1× at registration desk, 1× backstage, 1× spare.",
  },
];

// Custody chain — every movement of an item
const CUSTODY_LOG = {
  "INV-001": [
    { date: "Nov 22, 2026 14:20", action: "Received", from: "SoundTech vendor", to: "STORE-A", by: "Rajesh Kumar", note: "Invoice INV-104 paid · checked all 4 units" },
    { date: "Nov 22, 2026 16:05", action: "Stored",   from: "Receiving",        to: "STORE-A", by: "Rajesh Kumar", note: "Rack 3 · foam covers applied" },
    { date: "Nov 30, 2026 11:00", action: "Inspected",from: "STORE-A",          to: "STORE-A", by: "Aaron Goh",    note: "All 4 units verified · serial match" },
  ],
  "INV-006": [
    { date: "Oct 12, 2026 10:00", action: "Received", from: "Year-1 handover",  to: "OFFICE",  by: "Faris Hakim",   note: "Acquired from MYTECH 2026 committee · inventoried" },
    { date: "Nov 18, 2026 09:30", action: "Checked out", from: "OFFICE",        to: "Adam Chia", by: "Faris Hakim", note: "Sponsor portrait shoot — Maybank HQ" },
    { date: "Nov 19, 2026 18:00", action: "Returned", from: "Adam Chia",        to: "OFFICE",  by: "Adam Chia",     note: "Returned · battery charged" },
    { date: "Dec 04, 2026 13:00", action: "Checked out", from: "OFFICE",        to: "Adam Chia", by: "Faris Hakim", note: "Committee portrait session · due Dec 10" },
  ],
};

const INVENTORY_TOTAL_VALUE = INVENTORY.reduce((s, i) => s + i.qty * i.valuePerUnit, 0);

// ============ INVENTORY VIEW ============
function InventoryView({ onOpenItem }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const categories = [...new Set(INVENTORY.map(i => i.category))];

  const filtered = INVENTORY.filter(i => {
    if (filter !== "All" && i.category !== filter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <h1 className="view-title">Inventory & Storage</h1>
          <p className="view-subtitle">Every physical item linked to its invoice, budget line, and custodian.</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn">Scan QR</button>
          <button className="btn">Export</button>
          <button className="btn primary">{ICONS.plus} Add item</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KPI label="Total items" value={INVENTORY.reduce((s,i)=>s+i.qty,0).toLocaleString()} delta={INVENTORY.length + " distinct SKUs"} />
        <KPI label="Inventory value" value={fmtMoney(INVENTORY_TOTAL_VALUE)} delta="auto-rolled to budget" deltaDir="up" />
        <KPI label="In storage" value={INVENTORY.filter(i=>i.status==="In storage").length} delta={LOCATIONS.length + " locations"} />
        <KPI label="Checked out" value={INVENTORY.filter(i=>i.status==="Checked out").length} delta="requires return" deltaDir="down" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px", gap: 14 }}>
        <div className="col">
          <div className="card">
            <div className="card-header">
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <button className="chip" style={filter === "All" ? { background: "var(--text)", color: "var(--text-inverse)" } : {}} onClick={() => setFilter("All")}>All · {INVENTORY.length}</button>
                {categories.map(c => (
                  <button key={c} className="chip" style={filter === c ? { background: "var(--text)", color: "var(--text-inverse)" } : {}} onClick={() => setFilter(c)}>{c}</button>
                ))}
              </div>
              <input
                className="search-input"
                style={{ width: 200, padding: "5px 10px" }}
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Item</th><th>Qty</th><th className="num">Value</th><th>Location</th><th>Custodian</th><th>Status</th><th>Linked</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => {
                    const loc = LOCATIONS.find(l => l.id === i.location);
                    return (
                      <tr key={i.id} style={{ cursor: "pointer" }} onClick={() => onOpenItem(i.id)}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <ItemGlyph cat={i.category} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{i.name}</div>
                              <div className="tiny muted mono">{i.id} · {i.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="mono">{i.qty} {i.unit}</td>
                        <td className="num mono">{fmtMoney(i.qty * i.valuePerUnit)}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="pill neutral" style={{ padding: "1px 6px", fontSize: 10.5 }}>{loc.id}</span>
                            <span className="tiny muted">{loc.floor}</span>
                          </div>
                        </td>
                        <td>{i.custodian !== "—" ? <div className="av-md" style={{ width: 22, height: 22, fontSize: 9.5 }}>{i.custodian}</div> : <span className="muted">—</span>}</td>
                        <td>
                          <span className={"pill " + (
                            i.status === "In storage" ? "success" :
                            i.status === "Checked out" ? "warn" :
                            "info")}>
                            <span className="dot"></span>{i.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            {i.invoice !== "—" && <span className="pill neutral" style={{ padding: "1px 6px", fontSize: 10.5, fontFamily: "var(--font-mono)" }}>{i.invoice}</span>}
                          </div>
                        </td>
                        <td><button className="icon-btn">{ICONS.arrow}</button></td>
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
            <div className="card-header"><h3 className="card-title">Storage locations</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {LOCATIONS.map(l => {
                const count = INVENTORY.filter(i => i.location === l.id).reduce((s,i)=>s+i.qty,0);
                return (
                  <div key={l.id} className="list-row">
                    <span className="pill neutral" style={{ padding: "1px 6px", fontFamily: "var(--font-mono)", fontSize: 10 }}>{l.id}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{l.name}</div>
                      <div className="tiny muted">{l.who} · {l.floor}</div>
                    </div>
                    <div className="mono tiny">{count} pcs</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Linked data</h3></div>
            <div className="card-body">
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>
                Inventory items are linked across the platform.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <LinkRow a="Inventory item" b="Invoice" rel="one → one" />
                <LinkRow a="Invoice" b="Budget line" rel="one → one" />
                <LinkRow a="Custodian" b="Team member" rel="one → many" />
                <LinkRow a="Fuel claim" b="Vehicle trip" rel="auto-calc" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkRow({ a, b, rel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 8 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500 }}>{a}</span>
      <span className="muted">{ICONS.arrow}</span>
      <span style={{ fontSize: 11.5, fontWeight: 500 }}>{b}</span>
      <span className="muted tiny mono" style={{ marginLeft: "auto" }}>{rel}</span>
    </div>
  );
}

function ItemGlyph({ cat }) {
  const map = {
    "AV / Audio":      { bg: "#1d4ed8", l: "🔊" },
    "AV / Photo":      { bg: "#6b21a8", l: "📷" },
    "Print / Signage": { bg: "#b25e00", l: "🖼" },
    "Merchandise":     { bg: "#047857", l: "👕" },
    "Venue / Booth":   { bg: "#075985", l: "🏛" },
    "Health & Safety": { bg: "#c53030", l: "+" },
  };
  const m = map[cat] || { bg: "var(--text)", l: "•" };
  return (
    <div style={{ width: 32, height: 32, borderRadius: 7, background: m.bg + "20", color: m.bg, display: "grid", placeItems: "center", fontSize: 14 }}>
      {m.l}
    </div>
  );
}

// ============ ITEM DETAIL ============
function ItemDetailView({ itemId, onBack }) {
  const item = INVENTORY.find(i => i.id === itemId);
  if (!item) return <div className="view">Item not found</div>;
  const loc = LOCATIONS.find(l => l.id === item.location);
  const invoice = INVOICES.find(i => i.id === item.invoice);
  const log = CUSTODY_LOG[item.id] || [];

  return (
    <div className="view view-wide">
      <button className="btn ghost" onClick={onBack} style={{ marginBottom: 12, padding: "3px 8px" }}>← Back to inventory</button>

      <div className="event-hero">
        <ItemGlyph cat={item.category} />
        <div className="event-hero-meta" style={{ marginLeft: 14 }}>
          <div className="eyebrow">{item.id} · {item.sku}</div>
          <h1>{item.name}</h1>
          <div className="event-hero-tags">
            <span className="pill neutral">{item.category}</span>
            <span className={"pill " + (item.status === "In storage" ? "success" : item.status === "Checked out" ? "warn" : "info")}><span className="dot"></span>{item.status}</span>
            <span className="pill neutral">{item.qty} {item.unit} · {fmtMoney(item.qty * item.valuePerUnit)}</span>
            {invoice && <span className="pill info">📄 {invoice.id}</span>}
          </div>
        </div>
        <div className="event-hero-actions">
          <button className="btn">Print QR label</button>
          <button className="btn">Check out</button>
          <button className="btn primary">Move location</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 360px", gap: 14 }}>
        <div className="col">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Custody chain</h3><span className="muted tiny">{log.length} events</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              {log.length === 0 ? (
                <div style={{ padding: 20, fontSize: 12.5, color: "var(--text-secondary)" }}>No movement recorded yet.</div>
              ) : (
                <div style={{ padding: "8px 0" }}>
                  {log.map((e, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "10px 16px", borderBottom: i < log.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div>
                        <div className="mono tiny" style={{ color: "var(--text-tertiary)" }}>{e.date}</div>
                        <div style={{ marginTop: 4 }}>
                          <span className={"pill " + (
                            e.action === "Received" ? "info" :
                            e.action === "Stored" ? "success" :
                            e.action === "Checked out" ? "warn" :
                            e.action === "Returned" ? "success" : "neutral"
                          )}>{e.action}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {e.from} → {e.to}
                        </div>
                        <div className="tiny muted" style={{ marginTop: 2 }}>By {e.by}</div>
                        {e.note && <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>{e.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Details</h3></div>
            <div className="card-body">
              <DetailRow label="Serial" v={item.serial} />
              <DetailRow label="Condition" v={item.condition} />
              <DetailRow label="Purchase date" v={item.purchaseDate} />
              <DetailRow label="Notes" v={item.notes} />
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Current location</h3></div>
            <div className="card-body">
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>{loc.id}</div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 2 }}>{loc.name}</div>
              <div className="tiny muted">{loc.floor}</div>
              <div className="divider"></div>
              <div className="eyebrow">CURRENT CUSTODIAN</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <div className="av-md">{item.custodian}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{ALL_MEMBERS.find(m => m.initials === item.custodian)?.name || "—"}</div>
                  <div className="tiny muted">since {log[log.length - 1]?.date || "—"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Linked records</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {invoice && (
                <div className="list-row">
                  <span className="pill info" style={{ padding: "1px 6px", fontFamily: "var(--font-mono)", fontSize: 10 }}>{invoice.id}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{invoice.vendor}</div>
                    <div className="tiny muted">{fmtMoney(invoice.amount)} · {invoice.status}</div>
                  </div>
                  <span>{ICONS.arrow}</span>
                </div>
              )}
              <div className="list-row">
                <span className="pill purple" style={{ padding: "1px 6px", fontSize: 10 }}>BUDGET</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{item.budgetLine}</div>
                  <div className="tiny muted">absorbed {fmtMoney(item.qty * item.valuePerUnit)}</div>
                </div>
                <span>{ICONS.arrow}</span>
              </div>
              <div className="list-row">
                <span className="pill warn" style={{ padding: "1px 6px", fontSize: 10 }}>EVENT</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>MYTECH 2027</div>
                  <div className="tiny muted">scheduled use Mar 9–11</div>
                </div>
                <span>{ICONS.arrow}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, v }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12.5 }}>
      <span className="muted">{label}</span>
      <span>{v}</span>
    </div>
  );
}

// ============ FUEL CLAIM MODAL ============
function FuelClaimModal({ onClose }) {
  const [origin, setOrigin] = useState("UM, Kuala Lumpur");
  const [dest, setDest]     = useState("Maybank HQ, Menara Maybank, KL");
  const [trips, setTrips]   = useState(1);
  const [purpose, setPurpose] = useState("Sponsor meeting — Maybank HQ");
  const [vehicleType, setVehicleType] = useState("car-medium");
  const [date, setDate] = useState("Dec 06, 2026");
  const [tolls, setTolls] = useState(8.40);

  // Pre-loaded mileage between known locations
  const ROUTES = {
    "UM, Kuala Lumpur → Maybank HQ, Menara Maybank, KL": 13.4,
    "UM, Kuala Lumpur → Petronas Twin Towers, KLCC": 14.8,
    "UM, Kuala Lumpur → Grab HQ, Bangsar": 7.6,
    "UM, Kuala Lumpur → TM Tower, Jalan Pantai Baharu": 5.2,
    "UM, Kuala Lumpur → MDEC, Cyberjaya": 28.5,
  };

  const VEHICLES = {
    "motorcycle":  { label: "Motorcycle",      lkm: 28, rate: 0.30 },
    "car-small":   { label: "Car · small (≤1.6L)",  lkm: 13, rate: 0.50 },
    "car-medium":  { label: "Car · medium (1.6–2.0L)", lkm: 11, rate: 0.60 },
    "car-large":   { label: "Car · large (>2.0L)",  lkm: 9,  rate: 0.70 },
  };

  const key = origin + " → " + dest;
  const oneWayKm = ROUTES[key] || 12.0;
  const totalKm = oneWayKm * 2 * trips; // round-trip × trips
  const v = VEHICLES[vehicleType];
  const fuelClaim = +(totalKm * v.rate).toFixed(2);
  const total = +(fuelClaim + tolls).toFixed(2);

  // Fuel pricing assumption (RON95 RM 2.05 / L)
  const litres = +(totalKm / v.lkm).toFixed(2);
  const fuelCost = +(litres * 2.05).toFixed(2);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal" style={{ width: "min(960px, 94vw)" }}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">NEW CLAIM · FUEL / TRAVEL</div>
            <div className="modal-title">Auto-calculated mileage reimbursement</div>
          </div>
          <button className="icon-btn" onClick={onClose}>{ICONS.close}</button>
        </div>

        <div className="modal-body" style={{ padding: 0, background: "var(--bg)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", minHeight: 480 }}>
            <div style={{ padding: 22, borderRight: "1px solid var(--border)", background: "var(--bg-elev)" }}>
              <div className="grid grid-2">
                <div className="field">
                  <label>From (origin)</label>
                  <select className="select" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                    {["UM, Kuala Lumpur"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>To (destination)</label>
                  <select className="select" value={dest} onChange={(e) => setDest(e.target.value)}>
                    <option>Maybank HQ, Menara Maybank, KL</option>
                    <option>Petronas Twin Towers, KLCC</option>
                    <option>Grab HQ, Bangsar</option>
                    <option>TM Tower, Jalan Pantai Baharu</option>
                    <option>MDEC, Cyberjaya</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Purpose of trip</label>
                <input className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </div>

              <div className="grid grid-3">
                <div className="field">
                  <label>Date</label>
                  <input className="input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="field">
                  <label>Vehicle type</label>
                  <select className="select" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                    {Object.entries(VEHICLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Trips</label>
                  <input className="input" type="number" min="1" value={trips} onChange={(e) => setTrips(parseInt(e.target.value) || 1)} />
                </div>
              </div>

              <div className="field">
                <label>Tolls + parking (RM)</label>
                <input className="input" type="number" step="0.10" value={tolls} onChange={(e) => setTolls(parseFloat(e.target.value) || 0)} />
                <div className="hint">Attach receipts in the next step</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, background: "var(--info-soft)", borderRadius: 8, marginTop: 12 }}>
                <div className="ai-orb" style={{ width: 16, height: 16 }}></div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Atrium auto-pulled <strong>{oneWayKm} km one-way</strong> from the route library. Override if your route differed.
                </div>
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <label>Receipts (optional)</label>
                <div style={{ border: "1.5px dashed var(--border-strong)", borderRadius: 8, padding: 16, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>
                  Drag fuel receipts or toll slips here, or click to upload
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg)", padding: 22, overflowY: "auto" }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>CLAIM SUMMARY</div>

              <RouteVisual originLabel="UM" destLabel={dest.split(",")[0]} km={oneWayKm} />

              <div className="card" style={{ marginTop: 14 }}>
                <div className="card-body" style={{ padding: 14 }}>
                  <CalcRow label="One-way distance"   v={oneWayKm + " km"} />
                  <CalcRow label="Round-trip × trips" v={totalKm.toFixed(1) + " km"} />
                  <CalcRow label="Vehicle"            v={v.label} />
                  <CalcRow label="Reimbursement rate" v={"RM " + v.rate.toFixed(2) + " / km"} />
                  <div className="divider" style={{ margin: "8px 0" }}></div>
                  <CalcRow label="Estimated fuel used" v={litres + " L"} muted />
                  <CalcRow label="≈ Fuel cost (RON95)" v={"RM " + fuelCost.toFixed(2)} muted />
                </div>
              </div>

              <div className="card" style={{ marginTop: 10 }}>
                <div className="card-body" style={{ padding: 14 }}>
                  <CalcRow label="Mileage claim" v={"RM " + fuelClaim.toFixed(2)} />
                  <CalcRow label="Tolls + parking" v={"RM " + tolls.toFixed(2)} />
                  <div className="divider" style={{ margin: "8px 0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Total reimbursement</span>
                    <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em", fontVariantNumeric: "tabular-nums" }}>RM {total.toFixed(2)}</span>
                  </div>
                  <div className="muted tiny" style={{ textAlign: "right", marginTop: 2 }}>routes to Treasurer · Jia Hui Chong</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn">Save draft</button>
            <button className="btn primary" onClick={onClose}>Submit claim · RM {total.toFixed(2)}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalcRow({ label, v, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, color: muted ? "var(--text-tertiary)" : "var(--text)" }}>
      <span>{label}</span>
      <span className="mono">{v}</span>
    </div>
  );
}

function RouteVisual({ originLabel, destLabel, km }) {
  return (
    <div style={{ position: "relative", padding: 16, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 10 }}>
      <svg viewBox="0 0 320 80" style={{ width: "100%", height: 70 }}>
        {/* road */}
        <path d="M 24 60 Q 100 10 160 40 T 296 60" stroke="var(--text-tertiary)" strokeWidth="2.4" strokeDasharray="4 3" fill="none" />
        <circle cx="24" cy="60" r="6" fill="var(--success)" />
        <circle cx="24" cy="60" r="11" fill="none" stroke="var(--success)" strokeOpacity="0.3" strokeWidth="2" />
        <circle cx="296" cy="60" r="6" fill="var(--danger)" />
        {/* midpoint km label */}
        <rect x="130" y="14" width="60" height="22" rx="6" fill="var(--bg-elev)" stroke="var(--border)" />
        <text x="160" y="29" textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight="600">{km} km</text>
        <text x="24" y="78" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">{originLabel}</text>
        <text x="296" y="78" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">{destLabel}</text>
      </svg>
    </div>
  );
}

Object.assign(window, { InventoryView, ItemDetailView, FuelClaimModal, INVENTORY, LOCATIONS, CUSTODY_LOG });
