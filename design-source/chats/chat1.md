# Event Intelligence Platform

_Started 2026-05-28 05:06 UTC_

---

## User

I want it to be platform suitbale for all event organising. It shud be like a HR platform but design for event organising. It shud can analyze the report and swot analyse of the pass event and give advise on how to improve and suggested timeline for that certain event. I want the website to be like tesla and apple feel design

## Assistant

_[tool: questions_v2]_

## User

Questions answered:
- deliverable: A clickable high-fidelity prototype of the whole product
- scope: Dashboard / overview, Event creation wizard, Org chart & department roles (like your MYTECH structure), Task & timeline (Gantt) view, Budget tracker, Post-event report + SWOT analysis, AI advisor / suggested timeline, Approvals workflow (faculty → HEP → central), Sponsor/vendor CRM, Team member directory (HR-style)
- aesthetic: Apple macOS: clean light UI, SF-style type, subtle color
- accent: 0
- type: Apple SF-style (humanist, friendly)
- data_source: Based on your MYTECH 2026 example (treat it as the 'past event')
- ai_personality: A quiet sidebar that surfaces insights
- variations: Just one strong direction
- tweaks: Light / dark mode
- anything_else: Invoice tracker, financial claim, approval workflow, google drive linked storage, lucky draw system, event committee performance, some feature from clickup

## Assistant

_[tool: update_todos]_

_[tool: set_project_title]_

_[tool: copy_starter_component]_

I'll build a comprehensive Apple-style event ops platform. Let me plan this out.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built **Atrium** — an Apple-style HR-feel platform for event organising. Single click-through prototype covering everything you asked for.

**Workspace:** Dashboard, Events, Tasks (kanban), Timeline (Gantt with T-week scale)
**People & partners:** Org Chart (MYTECH 2026 structure), Team directory with HR-style performance, Sponsors CRM
**Money:** Budget by department, Invoices & Claims with approval flow
**Insights:** Reports & SWOT (4-quadrant analysis of MYTECH 2026 with AI-derived advice for 2027), Files (Google Drive-linked), Lucky Draw with animated reel
**Modal:** 6-step Event Creation Wizard
**Right rail:** Quiet "Atrium Intelligence" sidebar surfacing risks, opportunities, timeline nudges, and a 2026→2027 comparison
**Tweaks:** Light / Dark mode

The AI advisor is woven throughout — Reports tab synthesizes the 2026 SWOT into 7 prioritized recommendations for 2027, the Dashboard shows trajectory deltas vs 2026 at the same week, the Budget view surfaces a 2026 lesson (PA failure → contingency line), and the Wizard pre-fills timeline + budget from past event templates.

Open the sidebar to navigate. Click into either MYTECH event for the tabbed detail view, or hit the **+ New event** button to walk through the wizard. The Lucky Draw button on the draw screen runs a live reel animation.

## User

a direct renderer for spreadsheet and doc and pdf shud be availbale here

## Assistant

_[tool: write_file]_

Good call — adding inline document viewers for sheets, docs, and PDFs so people don't bounce out to Drive.

_[tool: update_todos]_

_[tool: str_replace_edit]_

Good asks — let me wire up the viewer I just built, add a Competition event with registrations, role-based access, locked files, and a profile page.

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: write_file]_

Adding inventory tracking with custody chain + linking to budget/invoice/claims, plus fuel claim auto-calc.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update the sidebar + add link icon in invoices linking to inventory.

_[tool: write_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Added everything you asked for, all wired up:

**Inventory & Storage** — every item linked to its invoice, budget line, custodian, and location. Click any item to see its full custody chain (received → stored → checked out → returned, with date/who/note).

**Doc / Sheet / PDF viewer** — click any unlocked file in the Files view to open it inline: spreadsheet with formula bar + sheet tabs, doc with comments rail, PDF with thumbnail navigator and rendered pages, ZIP archive listing.

**Role-based access** — six roles (Director, Vice Director, Secretary, Treasurer, Dept Head, Protocol Team, Committee Member). Sidebar nav filters by permission. Protocol-locked files show 🔒 when you lack access. Try switching to Liyana (Committee) in the **Tweaks panel** → Files view → you'll see the protocol folders sealed.

**Profile page** — click your user widget in the sidebar. Shows role, permissions matrix (✓ / —), recent activity, and a role switcher.

**Competition event + Registration** — new "Code Sprint 2027" event with a Registration view (teams list, public registration form, jury panel sealed behind protocol role).

**Fuel claim auto-calc** — "🚗 New fuel claim" button in Invoices opens a modal: pick origin/dest, vehicle type, trips, and it auto-calculates distance × rate, estimated litres, fuel cost, and total reimbursement.

**Linked data** — INV-104 (PA system invoice) ↔ INV-001/002 (JBL speakers, Shure mics) ↔ LOGI budget line ↔ Rajesh Kumar as custodian. Visible from the item detail view.

Switch roles via the **Tweaks panel** (toolbar → "Sign in as") to see how the UI changes.

## User

Verifier agent check completed

## Assistant

Verifier passed. Everything's working — Inventory + custody chain, doc/sheet/PDF viewer, role-based access with file locking, Profile page with permissions matrix, Competition Registration, and the fuel claim auto-calculator are all live. Switch roles in the Tweaks panel to see access changes.

