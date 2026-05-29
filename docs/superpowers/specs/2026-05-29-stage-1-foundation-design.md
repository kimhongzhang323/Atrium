# Stage 1 — Foundation: Implementation Spec

**Status**: Approved design
**Date**: 2026-05-29
**Parent roadmap**: `2026-05-29-backend-architecture-design.md`
**Branch**: `stage-1-foundation`

## 1. Goal

Establish the load-bearing primitives every later stage depends on: multi-tenant data isolation, authentication, RBAC, a uniform Server Action pipeline, audit logging, and an outbox table. End state: a tenant-safe `updateProfile` Server Action runs end-to-end with auth, RBAC, RLS, validation, and audit logging working.

## 2. Non-goals

- Full onboarding UI (Stage 3).
- Invitations, role reassignment UI (Stage 3).
- Event/task/sponsor/file functionality.
- Outbox consumer (Stage 6) — Stage 1 only writes the table.
- Notification dispatch (Stage 6).

## 3. Database schema

All tables created via Drizzle Kit migrations. RLS enabled on every tenant-scoped table.

### `organizations`
| column      | type          | notes                                    |
|-------------|---------------|------------------------------------------|
| id          | uuid pk       | `defaultRandom()`                        |
| name        | text not null |                                          |
| slug        | text unique   | derived from email domain on first sign-in |
| created_by  | uuid          | the founding user                        |
| created_at  | timestamptz   | `defaultNow()`                           |

### `users` (extends current `users` table)
| column     | type        | notes                                       |
|------------|-------------|---------------------------------------------|
| id         | uuid pk     | Auth.js managed                             |
| email      | text unique |                                             |
| name       | text        |                                             |
| image      | text        | from OAuth                                  |
| initials   | text        | derived from name                           |
| org_id     | uuid fk     | not null after first sign-in                |
| role       | role_enum   | default `committee`                         |
| dept       | dept_enum   | nullable                                    |
| created_at | timestamptz |                                             |

### `accounts`, `sessions`, `verification_tokens`
Standard Auth.js v5 Drizzle adapter schemas. Not RLS-scoped (auth flow needs to query before knowing `org_id`).

### `org_members`
| column     | type        | notes                                       |
|------------|-------------|---------------------------------------------|
| org_id     | uuid fk     |                                             |
| user_id    | uuid fk     |                                             |
| role       | role_enum   |                                             |
| dept       | dept_enum   | nullable                                    |
| joined_at  | timestamptz |                                             |

Primary key: `(org_id, user_id)`. RLS-scoped.

### `audit_log`
| column        | type        | notes                                  |
|---------------|-------------|----------------------------------------|
| id            | uuid pk     |                                        |
| org_id        | uuid not null |                                      |
| actor_user_id | uuid        | nullable for system actions            |
| action        | text        | e.g. `profile.update`                  |
| target_type   | text        | e.g. `user`                            |
| target_id     | uuid        |                                        |
| before        | jsonb       |                                        |
| after         | jsonb       |                                        |
| at            | timestamptz | `defaultNow()`                         |
| ip            | text        |                                        |
| user_agent    | text        |                                        |

Append-only (no UPDATE/DELETE policy). RLS-scoped.

### `domain_events` (outbox)
| column       | type        | notes                                   |
|--------------|-------------|-----------------------------------------|
| id           | uuid pk     |                                         |
| org_id       | uuid not null |                                       |
| event_type   | text        | e.g. `profile.updated`                  |
| payload      | jsonb       |                                         |
| created_at   | timestamptz | `defaultNow()`                          |
| processed_at | timestamptz | nullable                                |
| attempts     | int         | default 0                               |

RLS-scoped. Stage 6 will add the consumer.

### RLS policies

For each tenant-scoped table:
```sql
ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON <t>
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);
```

Two Postgres roles:
- `app_user` — used by the tenant client. RLS enforced.
- `app_admin` — used by Auth.js callbacks and migrations. `BYPASSRLS` granted. Never used by Server Actions.

## 4. Drizzle client

`src/server/db/client.ts`:

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

export const dbAdmin = drizzle(/* admin conn string */, { schema });
const tenantDb = drizzle(/* app_user conn string */, { schema });

export async function withTenantTx<T>(
  orgId: string,
  fn: (tx: TenantTx) => Promise<T>,
): Promise<T> {
  return tenantDb.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.org_id = ${orgId}`);
    return fn(tx);
  });
}

export type TenantTx = Parameters<Parameters<typeof tenantDb.transaction>[0]>[0];
```

Rules:
- Server Actions **must** use `withTenantTx`. ESLint rule blocks imports of `tenantDb` directly from action files.
- `dbAdmin` only imported by `src/server/auth.ts` and migration scripts.

## 5. `Result` type

`src/lib/result.ts`:

```ts
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type AppError = {
  code:
    | "VALIDATION"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "INTERNAL";
  message: string;
  fields?: Record<string, string>;
};

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = (error: AppError): Result<never> => ({ ok: false, error });
```

## 6. `defineAction` wrapper

`src/server/action.ts`:

```ts
export function defineAction<TInput, TOutput>(opts: {
  name: string;                          // for logs
  input: ZodSchema<TInput>;
  permission?: Permission;
  handler: (ctx: ActionCtx, input: TInput) => Promise<TOutput>;
}): (raw: unknown) => Promise<Result<TOutput>>;

type ActionCtx = {
  session: Session;
  tx: TenantTx;
  log: (event: { type: string; data?: unknown }) => void;
  audit: (entry: AuditEntry) => Promise<void>;
  emit: (event: DomainEvent) => Promise<void>;
};
```

Pipeline executed per call:
1. Parse input with `opts.input` → on fail, `{ ok: false, error: { code: "VALIDATION", fields } }`.
2. `getSession()` → on fail, `UNAUTHENTICATED`.
3. If `opts.permission` set, `requirePermission(session, opts.permission)` → on fail, `FORBIDDEN`.
4. `withTenantTx(session.orgId, async (tx) => handler(...))`.
5. Catch typed `AppError`s thrown inside the handler → return them as `{ ok: false, error }`.
6. Catch anything else → log to Sentry + structured logger, return `INTERNAL`.
7. Log `{ action, orgId, userId, durationMs, outcome }`.
8. Return `{ ok: true, data }`.

`ctx.audit()` and `ctx.emit()` write to `audit_log` / `domain_events` inside the same `tx`.

## 7. Auth.js v5

`src/server/auth.ts`:

- Providers: `Google` (OAuth) + `Resend` (magic link).
- Drizzle adapter against `dbAdmin`.
- Callbacks:
  - `signIn`: if the user has no `org_id`, create an `organizations` row (slug from email domain), insert `org_members` row with role `director`, set `users.org_id`. Wrapped in a transaction on `dbAdmin`.
  - `session`: enrich session with `{ orgId, role, dept }` loaded from `org_members`.
- Env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_RESEND_KEY`, `DATABASE_URL`, `DATABASE_ADMIN_URL`.

## 8. RBAC

`src/lib/roles.ts`:

```ts
export type Permission = "profile.update" | "org.invite" | "org.assign_role" /* ... */;

export const PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  director: new Set(["profile.update", "org.invite", "org.assign_role", /* ... */]),
  vice_director: new Set([/* ... */]),
  // ...
};
```

`src/server/rbac.ts`:

```ts
export function requirePermission(session: Session, perm: Permission): void {
  if (!PERMISSIONS[session.role].has(perm)) {
    throw new AppError({ code: "FORBIDDEN", message: `Missing ${perm}` });
  }
}
```

Stage 1 ships only the permissions actually used. Later stages extend the union and the matrix.

Dept-scoping (e.g., "SPR head edits only SPR tasks") is **not** in `requirePermission`. Stage 2+ actions do explicit `session.dept === resource.dept` checks for this — keeps the permission matrix flat.

## 9. Proof-of-life action

`src/server/actions/profile.ts`:

```ts
export const updateProfile = defineAction({
  name: "profile.update",
  input: z.object({ name: z.string().min(1).max(80) }),
  permission: "profile.update",
  async handler({ session, tx, audit }, { name }) {
    const before = await tx.query.users.findFirst({
      where: eq(users.id, session.userId),
    });
    const after = await tx
      .update(users)
      .set({ name, initials: initialsOf(name) })
      .where(eq(users.id, session.userId))
      .returning()
      .then((r) => r[0]);

    await audit({
      action: "profile.update",
      targetType: "user",
      targetId: session.userId,
      before, after,
    });

    revalidateTag(`user:${session.userId}`);
    return { user: after };
  },
});
```

A `/profile` page (Server Component) renders the user's name in an editable form; submission calls `updateProfile`.

## 10. Acceptance criteria

The Stage 1 implementation is done when all of the following are true:

1. Migrations create every table in §3 with the RLS policies in place.
2. `app_user` Postgres role exists and has `BYPASSRLS = false`.
3. Signing in with Google with a new email creates an organization, makes the user its director, and lands them on `/`.
4. Signing in with magic link via Resend works equivalently.
5. `updateProfile` action returns `{ ok: true }`, writes an `audit_log` row, and the UI shows the new name after revalidation.
6. **Cross-tenant isolation test**: a test signs in as User A in Org A, creates an audit_log row, then signs in as User B in Org B and asserts that `tx.query.auditLog.findMany()` returns zero rows belonging to Org A.
7. **Permission test**: a user without `profile.update` permission calling `updateProfile` gets `{ ok: false, error: { code: "FORBIDDEN" } }`.
8. **Validation test**: calling `updateProfile({ name: "" })` returns `{ ok: false, error: { code: "VALIDATION", fields: { name: ... } } }`.
9. **Wrapper enforcement**: ESLint rule fails CI if any file in `src/server/actions/**` exports a `"use server"` function that is not the result of `defineAction(...)`.
10. Structured action log line is emitted for every action call.

## 11. Out-of-scope / explicitly deferred

- Email send for non-auth flows (Stage 6).
- Outbox consumer / event dispatch (Stage 6).
- Invitations (Stage 3).
- Org name/slug editing UI (Stage 3).
- Sentry wiring (added later — Stage 1 logs to console with a clear hook for Sentry).
- Drizzle migration CI gate (added when CI is set up).

## 12. Risks

| Risk | Mitigation |
|------|------------|
| `SET LOCAL` not honored by Neon HTTP pooling | Verify with an integration test before building on top. Fallback: TCP pooler. |
| Auth.js callback runs outside a tx → partial org creation | Wrap the first-sign-in callback in a single `dbAdmin.transaction`. |
| Developer adds a Server Action without `defineAction` | ESLint rule + code review checklist item. |
| Forgetting RLS on a new table | Migration template includes the `ENABLE ROW LEVEL SECURITY` + policy block. PR review checks for it. |
