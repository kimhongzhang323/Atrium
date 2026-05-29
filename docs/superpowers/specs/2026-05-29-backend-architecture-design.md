# Atrium Backend Architecture — Roadmap

**Status**: Approved roadmap (not an implementation spec)
**Date**: 2026-05-29
**Scope**: High-level architecture for the full Atrium backend, decomposed into six sequenced stages. Each stage will get its own implementation spec before code is written.

---

## 1. Goals

- Production-grade backend for a multi-tenant event operations platform serving university committees.
- Tenant isolation strong enough that an application bug cannot leak data across organizations.
- Single deployable Next.js app on Vercel — no separate backend service.
- Every sensitive mutation is auditable. Money and signatures never move without a trail.
- Files behave like Google Drive (because they *are* Google Drive), with Atrium acting as the governance and permissions layer.

## 2. Non-goals (v1)

- Native mobile apps or a public third-party API.
- Cross-organization user accounts (a user belongs to exactly one org).
- Bank integration, receipt OCR, NFC check-in, DLP scanning, document watermarking.
- LLM-generated insight summaries (signals are rule-based for v1; LLM swap-in deferred).

## 3. Architectural foundations

### Runtime and deployment
- Next.js 16 App Router on Vercel Fluid Compute (Node.js 24 LTS).
- Server Actions are the primary mutation surface. Route Handlers only for Auth.js endpoints and external webhooks (e-sig provider, Drive activity).
- Neon Postgres, one project, branch-per-preview-deploy.
- Drizzle ORM + Drizzle Kit for migrations.

### Tenancy
- `organizations` is the root. Every domain table carries `org_id uuid not null references organizations(id)`.
- Postgres Row Level Security on every tenant-scoped table, predicate `org_id = current_setting('app.org_id')::uuid`.
- The Drizzle client opens every action in a transaction and sets `app.org_id` from the session. Defense in depth: an application bug cannot read or write across orgs.
- One user belongs to one org. Multi-org users deferred.

### Authentication and authorization
- Auth.js v5 with the Drizzle adapter.
- Providers: Google OAuth (university accounts) primary, email magic link fallback.
- Session shape: `{ userId, orgId, role, dept }`. Cached per request via `getSession()`.
- RBAC: `requirePermission(session, "invoice.approve")` enforced inside every action. Permission matrix in `src/lib/roles.ts`. RLS is the second layer.

### Server Action conventions
- Return a discriminated union: `{ ok: true, data } | { ok: false, error: { code, message, fields? } }`. No thrown errors cross the boundary.
- Standard pipeline per action:
  1. Parse with Zod
  2. Load session
  3. `requirePermission`
  4. Open RLS-scoped transaction
  5. Mutate
  6. Insert into `domain_events` outbox if other systems care
  7. `revalidateTag` or `updateTag`
  8. Return `Result`
- Wrapped by a single `defineAction(...)` helper so the pipeline cannot be skipped.

### Caching
- Next 16 Cache Components (`"use cache"`) on read-heavy server components.
- Tag scheme: `org:{id}`, `event:{id}`, `user:{id}`, `dept:{org}:{dept}`.
- Mutations call `updateTag()` for the narrowest affected tag.
- TanStack Query only for client-interactive flows (live filtering, optimistic Kanban drag).

### Observability
- Vercel logs + Sentry for errors.
- Structured action logs: `{ action, orgId, userId, durationMs, outcome, errorCode? }`.
- `audit_log` table — append-only, written for any mutation classified as sensitive (approvals, money, role changes, file permissions, signatures).

### Background work
- **Vercel Workflow** — durable multi-step flows (invoice approval chain, sponsor email sequences, signature request orchestration).
- **Vercel Queues** — fan-out for domain events (registration → notify SPR + LOGI + PUB).
- **Vercel Cron** — daily KPI rollups, signal generation, Drive permission reconciliation.

### Outbox pattern
- Mutations insert into `domain_events` in the same transaction as the business write. A Queue consumer fans out to notifications, AI signal generation, and analytics. Guarantees at-least-once delivery without distributed transactions.

---

## 4. The six stages

Each stage lists owned tables, key actions/flows, dependencies, and what it explicitly defers.

### Stage 1 — Foundation
*A tenant-safe Server Action runs end-to-end: auth, RBAC, validation, RLS, logging.*

- **Owned tables**: `organizations`, `users`, `accounts`, `sessions`, `verification_tokens`, `org_members`, `audit_log`, `domain_events`.
- **Code surface**: `src/server/db/client.ts` (RLS-scoped tx helper), `src/server/auth.ts`, `src/server/rbac.ts`, `src/server/action.ts` (`defineAction` wrapper), `src/lib/result.ts`.
- **Proof-of-life flow**: sign in with Google, land in your org, call `updateProfile` action successfully.
- **Depends on**: nothing.
- **Defers**: organization creation UI (Stage 3), outbound email (Stage 6).

### Stage 2 — Core domain: events, tasks, members
*Directors create events. Dept heads see their slice. Tasks move across the Kanban.*

- **Owned tables**: `events` (extend existing), `tasks` (extend), `event_members`, `task_comments`.
- **Key actions**: `createEvent`, `updateEvent`, `archiveEvent`, `createTask`, `updateTaskStatus`, `assignTask`, `addEventMember`, `commentOnTask`.
- **Reads**: `getEventById`, `listEventsForUser`, `listTasksForEvent`, `getEventKpis`.
- **Cache tags**: `event:{id}`, `org:{id}:events`, `dept:{org}:{dept}:tasks`.
- **Depends on**: Stage 1.
- **Defers**: Gantt materialization (Stage 6), task notifications (Stage 6).

### Stage 3 — People and org
*A new committee onboards, structures itself, assigns roles.*

- **Owned tables**: `org_members` (extend), `departments` (replace the dept enum — make it data so other committees use their own department names), `invitations`.
- **Key actions**: `createOrganization` (called from `/onboarding`), `inviteMember`, `acceptInvitation`, `assignRole`, `assignDepartment`, `createDepartment`, `removeMember`.
- **Flow**: 6-step `/onboarding` page maps 1:1 to these actions. Director invites → invitee gets magic link → joins org → role assigned.
- **Depends on**: Stage 1.
- **Defers**: bulk CSV import, SAML/SSO.

### Stage 4 — Money: sponsors, budget, invoices, approvals
*Treasurer console works end-to-end. Money never moves without an audit trail.*

- **Owned tables**: `sponsors`, `sponsor_contacts`, `sponsor_interactions`, `budget_lines`, `invoices`, `invoice_line_items`, `approvals` (polymorphic: `target_type` + `target_id`), `payment_records`.
- **Key actions**: `createSponsor`, `logSponsorInteraction`, `moveSponsorStage`, `createBudgetLine`, `submitInvoice`, `approveInvoice`, `rejectInvoice`, `recordPayment`.
- **Durable workflow**: invoice submission → dept head approval → treasurer approval → payment. Implemented in Vercel Workflow. Timeouts auto-escalate to the next approver.
- **Audit**: every money action writes to `audit_log` with before/after snapshots.
- **Depends on**: Stage 2.
- **Defers**: bank integration, OCR receipts.

### Stage 5 — Operations: registrations, lucky draw, inventory, files, e-signatures
*Secretary console and day-of-event ops work. Files have Drive-level security.*

#### Registrations, draw, inventory
- **Tables**: `registrations`, `registration_check_ins`, `draw_entries`, `draw_results`, `inventory_items`, `inventory_movements`.
- **Actions**: `registerForEvent` (public, Vercel BotID + captcha), `checkInAttendee`, `runDraw` (Queue job, returns job id), `recordInventoryMovement`.

#### Files — Drive-backed governance layer
Atrium does **not** store file blobs. It stores metadata, permissions, and audit. The file itself lives in Google Drive.

- **Drive ownership**: one **Google Workspace service account per org** owns the org's "Atrium" shared Drive folder. Users never own files individually — when a director graduates, ownership stays with the org.
- **Tables**:
  - `file_links` — `id, org_id, event_id?, drive_file_id, drive_mime_type, name, owner_user_id, classification (public/internal/restricted/confidential), created_at`
  - `file_permissions` — `file_link_id, principal_type (user/role/dept), principal_id, access (view/comment/edit/sign), granted_by, granted_at, expires_at?`
  - `file_access_log` — append-only `{file_link_id, user_id, action, at, ip, user_agent}`. Drive-level events ingested via Drive Activity API webhook.
  - `file_versions` — snapshots of Drive's `revisionId` with `changed_by, summary`.
- **Permission reconciliation**: Atrium is source of truth. Permission grants/revokes mirror to Drive via API. A nightly cron detects drift (someone shared the file directly in Drive) and either auto-revokes or flags for review.
- **UI**: Drive viewer embedded via iframe. Edits happen in Drive. Atrium polls Drive for revision changes and via webhook subscriptions.

#### E-signatures — qualified, via licensed provider
Rolling our own is not legally sufficient for sponsor MOUs under the Malaysia Digital Signature Act 1997. We integrate a licensed e-signature provider.

- **Provider**: Dropbox Sign or Adobe Sign (decide at Stage 5 spec time — both have licensed-CA partners for Malaysia DSA compliance). Atrium owns the request lifecycle; the provider does the cryptographic signing and issues the certificate.
- **Tables**:
  - `signature_requests` — `id, file_link_id, requested_by, provider, provider_request_id, status (draft/sent/partial/completed/declined/expired), expires_at, completed_at?`
  - `signature_request_signers` — `request_id, signer_user_id? (internal) or email (external), order, status, signed_at?, provider_certificate_ref`
- **Flow**:
  1. Director selects a Drive file, drops signature/date fields, adds signers in order, sends.
  2. Atrium calls the provider API with the document and signer list.
  3. Signers receive the provider's email, sign on the provider's qualified-signature page.
  4. Provider fires webhook on each status change → Atrium updates `signature_requests` and `audit_log`.
  5. On completion: signed PDF + provider's audit certificate are written back to Drive as a new revision, request marked `completed`.
- **External signers** (sponsors) do not need an Atrium account. Provider handles their identity.

- **Depends on**: Stages 1, 2, 3.
- **Defers**: bulk Drive folder import, watermarking, DLP scanning, QR/NFC check-in.

### Stage 6 — Intelligence and async
*The AI Rail has data. The system runs on its own when nobody's watching.*

- **Owned tables**: `event_snapshots` (daily KPI rollup), `ai_signals` (risks/opportunities/nudges), `notifications`, `notification_preferences`.
- **Outbox consumer**: Vercel Queue worker reads `domain_events`, fans out to notification dispatch and signal regeneration.
- **AI Rail signals**: Cron daily + on relevant domain events. Rule-based for v1, e.g., "MT26 sponsorship pace 23% behind MT25 by day 40." Stored in `ai_signals`, served as a Server Component on every page.
- **Notifications**: in-app + email (Resend). Per-user preferences. Future: Slack/Discord webhooks per org.
- **YoY analytics**: materialized views refreshed nightly via cron.
- **Depends on**: all prior stages.
- **Defers**: LLM-powered insight summarization (swap rule-based for LLM via Vercel AI Gateway when ready).

---

## 5. Critical path

```
Stage 1 ──► Stage 2 ──► Stage 3
                 │           │
                 ├──► Stage 4 (needs events + people)
                 └──► Stage 5 (needs events + people)
                              │
                              └──► Stage 6 (consumes everything)
```

Stages 4 and 5 are parallelizable once 2 and 3 land.

---

## 6. Key risks and mitigations

| Risk | Mitigation |
|------|------------|
| RLS misconfiguration leaks tenant data | Test harness asserts cross-org read returns zero rows for every table; CI blocks new tables without an RLS policy. |
| Drive permission drift | Nightly reconciler + alert when drift detected. |
| E-sig provider outage blocks contract closing | Status webhook is idempotent; manual "resend" action; provider choice supports SLA. |
| Workflow steps not idempotent → double approvals | Every workflow step keyed by `(workflow_id, step_id)`; approvals table has unique constraint on `(target_type, target_id, approver_id, decision)`. |
| Action wrapper bypassed | ESLint rule: Server Actions must be wrapped in `defineAction`. Pre-commit check. |
| Drizzle migrations diverge from Neon preview branches | Drizzle Kit `push` only in dev; production uses generated SQL migrations reviewed in PR. |

---

## 7. What this roadmap is not

This is a sequencing and shape document. It does not specify table column types, action signatures, or UI flows in detail. Each stage will get its own implementation spec — built from this roadmap, refined with stage-specific clarifying questions, and reviewed before code is written.

The next step is to brainstorm Stage 1 in detail, then writing-plans for the implementation.
