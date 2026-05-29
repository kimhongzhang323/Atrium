# Stage 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a tenant-safe Server Action pipeline (auth, RLS, RBAC, audit, outbox) and prove it end-to-end with a working `updateProfile` action.

**Architecture:** Next.js 16 Server Actions wrapped by `defineAction`, which validates input, loads the session, checks permissions, opens a Postgres transaction with `SET LOCAL app.org_id` to engage Row Level Security, calls the handler, and returns a `Result` discriminated union. Auth.js v5 (Google + Resend) creates an org on first sign-in via a privileged `BYPASSRLS` connection.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, postgres-js, Postgres (Neon), Auth.js v5, Resend, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-05-29-stage-1-foundation-design.md`

---

## File Structure

**Schema & DB:**
- `src/server/db/schema.ts` (extend) — all Stage 1 tables
- `src/server/db/client.ts` (rewrite) — `dbAdmin` + `withTenantTx`
- `drizzle/migrations/*` — generated SQL + a manual RLS migration

**Action pipeline:**
- `src/lib/result.ts` — `Result<T>` type, `ok`, `err`, `AppError` class
- `src/server/action.ts` — `defineAction` wrapper
- `src/server/rbac.ts` — `requirePermission`
- `src/lib/roles.ts` (extend) — permission matrix

**Auth:**
- `src/server/auth.ts` (rewrite) — providers, adapter, first-sign-in callback
- `src/app/api/auth/[...nextauth]/route.ts` — handlers

**Proof-of-life:**
- `src/server/actions/profile.ts` — `updateProfile`
- `src/app/(app)/profile/page.tsx` (modify) — server-rendered form
- `src/components/views/profile-form.tsx` — `"use client"` form island

**Tests & tooling:**
- `vitest.config.ts`, `vitest.setup.ts`
- `tests/integration/rls.test.ts` — cross-tenant isolation test
- `tests/integration/action.test.ts` — validation/permission/result tests
- `eslint-rules/require-define-action.js` — custom rule
- `eslint.config.mjs` (modify) — register the rule

---

## Task 1: Add dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
pnpm add resend
```

- [ ] **Step 2: Install dev deps**

```bash
pnpm add -D vitest @vitest/ui dotenv tsx
```

- [ ] **Step 3: Verify install**

```bash
pnpm list resend vitest
```
Expected: both versions printed, no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add resend, vitest, dotenv, tsx"
```

---

## Task 2: Extend Drizzle schema with Stage 1 tables

**Files:**
- Modify: `src/server/db/schema.ts`

- [ ] **Step 1: Replace `src/server/db/schema.ts` with the full Stage 1 schema**

```ts
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "director", "vice_director", "secretary", "treasurer",
  "dept_head", "protocol", "committee",
]);

export const deptEnum = pgEnum("dept", [
  "SPR", "PnP", "PUB", "LOGI", "MM", "TECH",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "Planning", "Live", "Completed",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "Backlog", "In Progress", "Review", "Done",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  name: text("name").notNull().default(""),
  image: text("image"),
  initials: text("initials").notNull().default(""),
  orgId: uuid("org_id").references(() => organizations.id),
  role: roleEnum("role").notNull().default("committee"),
  dept: deptEnum("dept"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}));

export const orgMembers = pgTable("org_members", {
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  dept: deptEnum("dept"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.orgId, t.userId] }),
}));

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  actorUserId: uuid("actor_user_id"),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
});

export const domainEvents = pgTable("domain_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),
});

// Existing tables retained for Stage 2 — kept here so migrations stay coherent.
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  status: eventStatusEnum("status").notNull().default("Planning"),
  venue: text("venue").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  budgetTotal: integer("budget_total").notNull().default(0),
  budgetCommitted: integer("budget_committed").notNull().default(0),
  sponsorTarget: integer("sponsor_target").notNull().default(0),
  sponsorSecured: integer("sponsor_secured").notNull().default(0),
  registrationsTarget: integer("registrations_target").notNull().default(0),
  registrationsCurrent: integer("registrations_current").notNull().default(0),
  isCompetition: boolean("is_competition").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  title: text("title").notNull(),
  dept: deptEnum("dept").notNull(),
  status: taskStatusEnum("status").notNull().default("Backlog"),
  ownerId: uuid("owner_id").references(() => users.id),
  due: timestamp("due", { withTimezone: true }),
});

export const eventMembers = pgTable("event_members", {
  eventId: uuid("event_id").references(() => events.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: roleEnum("role").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.eventId, t.userId] }),
}));
```

- [ ] **Step 2: Generate the migration**

```bash
pnpm db:generate
```
Expected: a new SQL file under `drizzle/migrations/` is created.

- [ ] **Step 3: Commit**

```bash
git add src/server/db/schema.ts drizzle/
git commit -m "feat(db): add Stage 1 schema (orgs, members, audit, outbox)"
```

---

## Task 3: Add RLS migration

**Files:**
- Create: `drizzle/migrations/manual_001_rls.sql`
- Modify: `drizzle.config.ts` (if needed to include the migration)

- [ ] **Step 1: Create the RLS migration**

Create `drizzle/migrations/manual_001_rls.sql`:

```sql
-- Two Postgres roles. Run by a superuser (Neon's owner role is fine).
DO $$ BEGIN
  CREATE ROLE app_admin BYPASSRLS NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE ROLE app_user NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Schema-level usage
GRANT USAGE ON SCHEMA public TO app_admin, app_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user, app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- Enable RLS on tenant-scoped tables
ALTER TABLE organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events  ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation ON organizations
  USING (id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON users
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON org_members
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON audit_log
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON domain_events
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

-- audit_log is append-only for app_user
REVOKE UPDATE, DELETE ON audit_log FROM app_user;
```

- [ ] **Step 2: Apply the migration**

```bash
pnpm db:migrate
psql "$DATABASE_URL" -f drizzle/migrations/manual_001_rls.sql
```
Expected: no errors. (If running against Neon, `psql` works; or paste into the Neon SQL editor.)

- [ ] **Step 3: Verify with psql**

```bash
psql "$DATABASE_URL" -c "\d+ users" -c "SELECT polname FROM pg_policy WHERE polrelid = 'users'::regclass;"
```
Expected: `tenant_isolation` policy listed for `users`.

- [ ] **Step 4: Commit**

```bash
git add drizzle/migrations/manual_001_rls.sql
git commit -m "feat(db): enable RLS with tenant_isolation policies"
```

---

## Task 4: Rewrite Drizzle client with admin + tenant connections

**Files:**
- Rewrite: `src/server/db/client.ts`

- [ ] **Step 1: Replace `src/server/db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

import * as schema from "./schema";

const adminUrl = process.env.DATABASE_ADMIN_URL;
const appUrl = process.env.DATABASE_URL;
if (!adminUrl) throw new Error("DATABASE_ADMIN_URL is not set");
if (!appUrl) throw new Error("DATABASE_URL is not set");

const adminClient = postgres(adminUrl, { prepare: false });
export const dbAdmin = drizzle(adminClient, { schema });

const tenantClient = postgres(appUrl, { prepare: false });
const tenantDb = drizzle(tenantClient, { schema });

export type TenantTx = Parameters<Parameters<typeof tenantDb.transaction>[0]>[0];

export async function withTenantTx<T>(
  orgId: string,
  fn: (tx: TenantTx) => Promise<T>,
): Promise<T> {
  return tenantDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.org_id', ${orgId}, true)`);
    return fn(tx);
  });
}
```

> **Note on `SET LOCAL`**: we use `set_config(name, value, is_local=true)` instead of `SET LOCAL` because it accepts a bound parameter, avoiding SQL injection risk and supporting prepared statements.

- [ ] **Step 2: Update `.env.example`**

Create or edit `.env.example` to include:

```
DATABASE_URL=postgres://app_user:...@host/db
DATABASE_ADMIN_URL=postgres://app_admin:...@host/db
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_RESEND_KEY=
AUTH_EMAIL_FROM=no-reply@atrium.local
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/server/db/client.ts .env.example
git commit -m "feat(db): split admin and tenant clients with withTenantTx"
```

---

## Task 5: Result type + AppError

**Files:**
- Create: `src/lib/result.ts`

- [ ] **Step 1: Create `src/lib/result.ts`**

```ts
export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export interface AppErrorShape {
  code: ErrorCode;
  message: string;
  fields?: Record<string, string>;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fields?: Record<string, string>;

  constructor(shape: AppErrorShape) {
    super(shape.message);
    this.code = shape.code;
    this.fields = shape.fields;
  }

  toJSON(): AppErrorShape {
    return { code: this.code, message: this.message, fields: this.fields };
  }
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppErrorShape };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = (error: AppErrorShape): Result<never> => ({ ok: false, error });
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/result.ts
git commit -m "feat(lib): add Result type and AppError"
```

---

## Task 6: RBAC matrix and requirePermission

**Files:**
- Modify: `src/lib/roles.ts`
- Create: `src/server/rbac.ts`

- [ ] **Step 1: Replace `src/lib/roles.ts`**

```ts
import type { Role } from "./types";

export type Permission =
  | "profile.update"
  | "org.invite"
  | "org.assign_role";

const ALL: Permission[] = ["profile.update", "org.invite", "org.assign_role"];

export const PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  director:      new Set<Permission>(ALL),
  vice_director: new Set<Permission>(["profile.update", "org.invite"]),
  secretary:     new Set<Permission>(["profile.update"]),
  treasurer:     new Set<Permission>(["profile.update"]),
  dept_head:     new Set<Permission>(["profile.update"]),
  protocol:      new Set<Permission>(["profile.update"]),
  committee:     new Set<Permission>(["profile.update"]),
};
```

> If `Role` in `src/lib/types.ts` doesn't include all seven values, fix it now to match the `roleEnum` in the schema.

- [ ] **Step 2: Create `src/server/rbac.ts`**

```ts
import { AppError } from "@/lib/result";
import { PERMISSIONS, type Permission } from "@/lib/roles";
import type { Role } from "@/lib/types";

export function requirePermission(role: Role, perm: Permission): void {
  if (!PERMISSIONS[role].has(perm)) {
    throw new AppError({
      code: "FORBIDDEN",
      message: `Missing permission: ${perm}`,
    });
  }
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/roles.ts src/server/rbac.ts
git commit -m "feat(rbac): permission matrix and requirePermission"
```

---

## Task 7: defineAction wrapper

**Files:**
- Create: `src/server/action.ts`

- [ ] **Step 1: Create `src/server/action.ts`**

```ts
import { ZodError, type ZodSchema } from "zod";

import { auth } from "@/server/auth";
import { withTenantTx, type TenantTx } from "@/server/db/client";
import { requirePermission } from "@/server/rbac";
import { AppError, err, ok, type Result } from "@/lib/result";
import { auditLog, domainEvents } from "@/server/db/schema";
import type { Permission } from "@/lib/roles";
import type { Role } from "@/lib/types";

export interface Session {
  userId: string;
  orgId: string;
  role: Role;
  dept: string | null;
}

export interface ActionCtx {
  session: Session;
  tx: TenantTx;
  audit: (entry: {
    action: string;
    targetType: string;
    targetId: string | null;
    before?: unknown;
    after?: unknown;
  }) => Promise<void>;
  emit: (event: { type: string; payload: unknown }) => Promise<void>;
}

export interface DefineActionOpts<TInput, TOutput> {
  name: string;
  input: ZodSchema<TInput>;
  permission?: Permission;
  handler: (ctx: ActionCtx, input: TInput) => Promise<TOutput>;
}

export function defineAction<TInput, TOutput>(
  opts: DefineActionOpts<TInput, TOutput>,
): (raw: unknown) => Promise<Result<TOutput>> {
  return async function action(raw: unknown): Promise<Result<TOutput>> {
    const start = Date.now();
    let outcome: "ok" | "validation" | "auth" | "forbidden" | "error" = "ok";
    let userId: string | undefined;
    let orgId: string | undefined;
    try {
      const parsed = opts.input.safeParse(raw);
      if (!parsed.success) {
        outcome = "validation";
        return err({
          code: "VALIDATION",
          message: "Invalid input",
          fields: zodErrorToFields(parsed.error),
        });
      }

      const authSession = await auth();
      if (!authSession?.user) {
        outcome = "auth";
        return err({ code: "UNAUTHENTICATED", message: "Sign in required" });
      }

      const session: Session = {
        userId: authSession.user.id as string,
        orgId: authSession.user.orgId as string,
        role: authSession.user.role as Role,
        dept: (authSession.user.dept as string | null) ?? null,
      };
      userId = session.userId;
      orgId = session.orgId;

      if (opts.permission) requirePermission(session.role, opts.permission);

      const data = await withTenantTx(session.orgId, async (tx) => {
        const ctx: ActionCtx = {
          session,
          tx,
          async audit(entry) {
            await tx.insert(auditLog).values({
              orgId: session.orgId,
              actorUserId: session.userId,
              action: entry.action,
              targetType: entry.targetType,
              targetId: entry.targetId,
              before: (entry.before ?? null) as never,
              after: (entry.after ?? null) as never,
            });
          },
          async emit(event) {
            await tx.insert(domainEvents).values({
              orgId: session.orgId,
              eventType: event.type,
              payload: event.payload as never,
            });
          },
        };
        return opts.handler(ctx, parsed.data);
      });

      return ok(data);
    } catch (e) {
      if (e instanceof AppError) {
        outcome = e.code === "FORBIDDEN" ? "forbidden" : "error";
        return err(e.toJSON());
      }
      outcome = "error";
      console.error(`[action:${opts.name}] unhandled`, e);
      return err({ code: "INTERNAL", message: "Something went wrong" });
    } finally {
      const durationMs = Date.now() - start;
      console.log(
        JSON.stringify({
          tag: "action",
          name: opts.name,
          orgId,
          userId,
          outcome,
          durationMs,
        }),
      );
    }
  };
}

function zodErrorToFields(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    if (!(path in out)) out[path] = issue.message;
  }
  return out;
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```
Expected: errors only on `authSession.user.orgId` etc. — these are resolved in Task 8 by augmenting the next-auth session type. Leave for now.

- [ ] **Step 3: Commit**

```bash
git add src/server/action.ts
git commit -m "feat(server): defineAction wrapper with audit + emit"
```

---

## Task 8: Auth.js v5 — providers, adapter, first-sign-in

**Files:**
- Rewrite: `src/server/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`

- [ ] **Step 1: Rewrite `src/server/auth.ts`**

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { dbAdmin } from "@/server/db/client";
import {
  accounts,
  organizations,
  orgMembers,
  sessions as sessionsTable,
  users,
  verificationTokens,
} from "@/server/db/schema";

function slugFromEmail(email: string): string {
  const domain = email.split("@")[1] ?? "org";
  return domain.replace(/\..*$/, "").toLowerCase();
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(dbAdmin, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async signIn({ user }) {
      if (!user.id || !user.email) return false;

      const existing = await dbAdmin.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      if (existing?.orgId) return true;

      await dbAdmin.transaction(async (tx) => {
        const slugBase = slugFromEmail(user.email!);
        const slug = `${slugBase}-${user.id!.slice(0, 6)}`;
        const [org] = await tx
          .insert(organizations)
          .values({
            name: `${slugBase.toUpperCase()} Organization`,
            slug,
            createdBy: user.id!,
          })
          .returning();
        if (!org) throw new Error("Failed to create organization");

        await tx
          .update(users)
          .set({
            orgId: org.id,
            role: "director",
            initials: initialsOf(user.name ?? user.email!),
          })
          .where(eq(users.id, user.id!));

        await tx.insert(orgMembers).values({
          orgId: org.id,
          userId: user.id!,
          role: "director",
        });
      });
      return true;
    },
    async session({ session, user }) {
      const row = await dbAdmin.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      if (row) {
        session.user.id = row.id;
        session.user.orgId = row.orgId!;
        session.user.role = row.role;
        session.user.dept = row.dept;
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: Create the route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
export { GET, POST } from "@/server/auth";
```

Wait — `handlers` is exported from `NextAuth()`. Use:

```ts
import { handlers } from "@/server/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Augment next-auth session types**

Create `src/types/next-auth.d.ts`:

```ts
import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      orgId: string;
      role: Role;
      dept: string | null;
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/server/auth.ts src/app/api/auth src/types/next-auth.d.ts
git commit -m "feat(auth): Google + Resend providers, first-sign-in org bootstrap"
```

---

## Task 9: updateProfile action

**Files:**
- Create: `src/server/actions/profile.ts`

- [ ] **Step 1: Create `src/server/actions/profile.ts`**

```ts
"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { defineAction } from "@/server/action";
import { users } from "@/server/db/schema";

const updateProfileInput = z.object({
  name: z.string().min(1, "Name is required").max(80),
});

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export const updateProfile = defineAction({
  name: "profile.update",
  input: updateProfileInput,
  permission: "profile.update",
  async handler({ session, tx, audit }, { name }) {
    const before = await tx.query.users.findFirst({
      where: eq(users.id, session.userId),
    });
    const [after] = await tx
      .update(users)
      .set({ name, initials: initialsOf(name) })
      .where(eq(users.id, session.userId))
      .returning();
    if (!after) throw new Error("User not found after update");

    await audit({
      action: "profile.update",
      targetType: "user",
      targetId: session.userId,
      before,
      after,
    });

    revalidateTag(`user:${session.userId}`);
    return { user: after };
  },
});
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/server/actions/profile.ts
git commit -m "feat(actions): updateProfile proof-of-life action"
```

---

## Task 10: Profile page wiring

**Files:**
- Modify: `src/app/(app)/profile/page.tsx`
- Create: `src/components/views/profile-form.tsx`

- [ ] **Step 1: Replace `src/app/(app)/profile/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/server/auth";
import { dbAdmin } from "@/server/db/client";
import { users } from "@/server/db/schema";

import { ProfileForm } from "@/components/views/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const user = await dbAdmin.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user) redirect("/api/auth/signin");

  return (
    <div className="max-w-md p-6">
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <ProfileForm initialName={user.name} />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/views/profile-form.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";

import { updateProfile } from "@/server/actions/profile";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await updateProfile({ name });
      if (res.ok) setSuccess(true);
      else setError(res.error.fields?.name ?? res.error.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-[--text-secondary]">Name</span>
        <input
          className="border border-[--border] rounded px-3 py-2 bg-[--bg-elev]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
        />
      </label>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      {success && <p className="text-sm text-green-600">Saved.</p>}
      <button
        type="submit"
        className="rounded bg-[--accent] text-white px-3 py-2 text-sm disabled:opacity-50"
        disabled={pending || name.trim() === ""}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 4: Run the app and manually verify**

```bash
pnpm dev
```
- Open `http://localhost:3000/profile` → sign-in redirect.
- Sign in with Google (with `AUTH_GOOGLE_ID/SECRET` set), or magic link.
- After sign-in, hit `/profile`, change name, submit, see "Saved."
- Reload: name persists.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(app\)/profile/page.tsx src/components/views/profile-form.tsx
git commit -m "feat(profile): wire updateProfile end-to-end"
```

---

## Task 11: Vitest setup and integration test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `tests/helpers/db.ts`
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 20_000,
    pool: "forks",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import "dotenv/config";
```

- [ ] **Step 3: Create `tests/helpers/db.ts`**

```ts
import { sql } from "drizzle-orm";

import { dbAdmin } from "@/server/db/client";
import {
  auditLog,
  domainEvents,
  orgMembers,
  organizations,
  users,
} from "@/server/db/schema";

export async function resetDb() {
  await dbAdmin.execute(sql`TRUNCATE TABLE
    ${auditLog},
    ${domainEvents},
    ${orgMembers},
    ${users},
    ${organizations}
    RESTART IDENTITY CASCADE`);
}

export async function seedOrg(name: string) {
  const [org] = await dbAdmin.insert(organizations).values({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
  }).returning();
  if (!org) throw new Error("seed failed");
  return org;
}

export async function seedUser(orgId: string, email: string, role: "director" | "committee" = "director") {
  const [u] = await dbAdmin.insert(users).values({
    email,
    name: email.split("@")[0]!,
    initials: email.slice(0, 2).toUpperCase(),
    orgId,
    role,
  }).returning();
  if (!u) throw new Error("seed failed");
  await dbAdmin.insert(orgMembers).values({ orgId, userId: u.id, role });
  return u;
}
```

- [ ] **Step 4: Add test scripts**

In `package.json` `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts tests/helpers/db.ts package.json
git commit -m "test: vitest setup and db helpers"
```

---

## Task 12: Cross-tenant isolation integration test

**Files:**
- Create: `tests/integration/rls.test.ts`

- [ ] **Step 1: Create `tests/integration/rls.test.ts`**

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { withTenantTx } from "@/server/db/client";
import { auditLog } from "@/server/db/schema";
import { resetDb, seedOrg, seedUser } from "../helpers/db";

describe("RLS tenant isolation", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("a session scoped to Org A cannot see Org B's audit_log rows", async () => {
    const orgA = await seedOrg("Org A");
    const orgB = await seedOrg("Org B");
    const userA = await seedUser(orgA.id, "a@example.edu");
    const userB = await seedUser(orgB.id, "b@example.edu");

    await withTenantTx(orgA.id, async (tx) => {
      await tx.insert(auditLog).values({
        orgId: orgA.id,
        actorUserId: userA.id,
        action: "test.event",
        targetType: "user",
        targetId: userA.id,
      });
    });
    await withTenantTx(orgB.id, async (tx) => {
      await tx.insert(auditLog).values({
        orgId: orgB.id,
        actorUserId: userB.id,
        action: "test.event",
        targetType: "user",
        targetId: userB.id,
      });
    });

    const visibleFromA = await withTenantTx(orgA.id, (tx) =>
      tx.query.auditLog.findMany(),
    );
    expect(visibleFromA).toHaveLength(1);
    expect(visibleFromA[0]!.orgId).toBe(orgA.id);

    const visibleFromB = await withTenantTx(orgB.id, (tx) =>
      tx.query.auditLog.findMany(),
    );
    expect(visibleFromB).toHaveLength(1);
    expect(visibleFromB[0]!.orgId).toBe(orgB.id);
  });

  it("a session scoped to Org A cannot insert a row with Org B's org_id", async () => {
    const orgA = await seedOrg("Org A");
    const orgB = await seedOrg("Org B");

    await expect(
      withTenantTx(orgA.id, async (tx) => {
        await tx.insert(auditLog).values({
          orgId: orgB.id,
          action: "tamper",
          targetType: "user",
          targetId: null,
        });
      }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run the test**

```bash
pnpm test tests/integration/rls.test.ts
```
Expected: both tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/rls.test.ts
git commit -m "test(rls): cross-tenant isolation passes"
```

---

## Task 13: defineAction validation/permission tests

**Files:**
- Create: `tests/integration/action.test.ts`
- Create: `tests/helpers/session.ts`

- [ ] **Step 1: Create `tests/helpers/session.ts`**

```ts
import { vi } from "vitest";

export function mockSession(user: {
  id: string;
  orgId: string;
  role: string;
  dept?: string | null;
}) {
  vi.doMock("@/server/auth", () => ({
    auth: async () => ({
      user: {
        id: user.id,
        orgId: user.orgId,
        role: user.role,
        dept: user.dept ?? null,
        email: "test@example.edu",
        name: "Test User",
      },
    }),
  }));
}

export function mockNoSession() {
  vi.doMock("@/server/auth", () => ({
    auth: async () => null,
  }));
}
```

- [ ] **Step 2: Create `tests/integration/action.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetDb, seedOrg, seedUser } from "../helpers/db";

afterEach(() => vi.resetModules());

describe("updateProfile via defineAction", () => {
  beforeEach(async () => {
    await resetDb();
    vi.resetModules();
  });

  it("returns VALIDATION error on empty name", async () => {
    const org = await seedOrg("Org A");
    const user = await seedUser(org.id, "a@example.edu", "director");
    const { mockSession } = await import("../helpers/session");
    mockSession({ id: user.id, orgId: org.id, role: "director" });

    const { updateProfile } = await import("@/server/actions/profile");
    const res = await updateProfile({ name: "" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("VALIDATION");
      expect(res.error.fields?.name).toBeDefined();
    }
  });

  it("returns UNAUTHENTICATED when no session", async () => {
    const { mockNoSession } = await import("../helpers/session");
    mockNoSession();

    const { updateProfile } = await import("@/server/actions/profile");
    const res = await updateProfile({ name: "Alice" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("UNAUTHENTICATED");
  });

  it("updates the user and writes an audit_log row", async () => {
    const org = await seedOrg("Org A");
    const user = await seedUser(org.id, "a@example.edu", "director");
    const { mockSession } = await import("../helpers/session");
    mockSession({ id: user.id, orgId: org.id, role: "director" });

    const { updateProfile } = await import("@/server/actions/profile");
    const res = await updateProfile({ name: "Alice Tan" });
    expect(res.ok).toBe(true);

    const { withTenantTx } = await import("@/server/db/client");
    const logs = await withTenantTx(org.id, (tx) =>
      tx.query.auditLog.findMany(),
    );
    expect(logs).toHaveLength(1);
    expect(logs[0]!.action).toBe("profile.update");
  });
});
```

- [ ] **Step 3: Run the tests**

```bash
pnpm test tests/integration/action.test.ts
```
Expected: all three pass.

- [ ] **Step 4: Commit**

```bash
git add tests/integration/action.test.ts tests/helpers/session.ts
git commit -m "test(action): validation, auth, audit log assertions"
```

---

## Task 14: ESLint rule — require defineAction

**Files:**
- Create: `eslint-rules/require-define-action.js`
- Modify: `eslint.config.mjs`

- [ ] **Step 1: Create `eslint-rules/require-define-action.js`**

```js
/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Exports in src/server/actions/** must be created by defineAction()",
    },
    schema: [],
    messages: {
      mustUseDefineAction:
        "Server Actions in src/server/actions must be defined via defineAction(...)",
    },
  },
  create(context) {
    const filename = context.getFilename().replace(/\\/g, "/");
    if (!filename.includes("/src/server/actions/")) return {};
    return {
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        if (!decl || decl.type !== "VariableDeclaration") return;
        for (const d of decl.declarations) {
          if (
            !d.init ||
            d.init.type !== "CallExpression" ||
            d.init.callee.type !== "Identifier" ||
            d.init.callee.name !== "defineAction"
          ) {
            context.report({ node: d, messageId: "mustUseDefineAction" });
          }
        }
      },
    };
  },
};
```

- [ ] **Step 2: Register the rule**

Edit `eslint.config.mjs` to include:

```js
import requireDefineAction from "./eslint-rules/require-define-action.js";

export default [
  // ...existing config...
  {
    files: ["src/server/actions/**/*.ts"],
    plugins: {
      local: { rules: { "require-define-action": requireDefineAction } },
    },
    rules: { "local/require-define-action": "error" },
  },
];
```

> If `eslint.config.mjs` doesn't yet exist (only the legacy `eslint-config-next` is present), create it with the existing Next config plus this block.

- [ ] **Step 3: Verify**

```bash
pnpm lint
```
Expected: no errors. Then add a temporary `src/server/actions/_test.ts` with `export const bad = async () => {}` and run again — expect the rule to fire. Delete the temp file.

- [ ] **Step 4: Commit**

```bash
git add eslint-rules eslint.config.mjs
git commit -m "lint: enforce defineAction in server/actions"
```

---

## Task 15: End-to-end manual verification + acceptance checklist

- [ ] **Step 1: Run typecheck, lint, tests**

```bash
pnpm typecheck && pnpm lint && pnpm test
```
Expected: all green.

- [ ] **Step 2: Walk the acceptance criteria from the spec**

For each item in §10 of `docs/superpowers/specs/2026-05-29-stage-1-foundation-design.md`, confirm:

1. Migrations created every table with RLS — `\d+ users` in psql shows the policy.
2. `app_user` role exists and lacks `BYPASSRLS` — `\du app_user`.
3. Sign in with Google → org auto-created → land on `/`.
4. Sign in with Resend magic link → equivalent.
5. `/profile` form updates name + audit row written + UI reflects change.
6. RLS test in Task 12 passes.
7. Permission test: temporarily set the test user's role to `committee` and confirm a `FORBIDDEN` result for an action gated on `org.invite`. (No production code change needed.)
8. Validation test in Task 13 passes.
9. ESLint rule in Task 14 fires on a bad file and not on good files.
10. Action log line printed for every action call (check terminal during the `/profile` flow).

- [ ] **Step 3: Open a PR**

```bash
git push -u origin stage-1-foundation
gh pr create --title "Stage 1: foundation — RLS, auth, defineAction" --body "$(cat <<'EOF'
## Summary
- Multi-tenant schema with RLS on all tenant-scoped tables
- Drizzle admin/tenant clients, `withTenantTx`
- Auth.js v5 (Google + Resend) with first-sign-in org bootstrap
- `defineAction` wrapper: Zod → session → RBAC → tx → audit/emit → Result
- `updateProfile` proof-of-life end-to-end
- Vitest integration tests for RLS isolation and action pipeline
- ESLint rule requiring `defineAction` in `src/server/actions/**`

## Test plan
- [ ] `pnpm typecheck && pnpm lint && pnpm test` green
- [ ] Sign in with Google end-to-end, edit profile, see audit row
- [ ] Sign in with magic link end-to-end
- [ ] Second sign-in from a different domain lands in a different org
EOF
)"
```

---

## Self-Review notes

- All ten acceptance criteria from the spec map to a task: schema (T2), RLS (T3), tenant client (T4), Result (T5), RBAC (T6), defineAction (T7), Auth.js + first-sign-in (T8), updateProfile (T9), profile UI (T10), RLS test (T12), validation/auth test (T13), ESLint rule (T14), walk-through (T15).
- `Role` type in `src/lib/types.ts` may need extension to match all seven enum values — flagged inline in Task 6.
- Stage 2 tables (`events`, `tasks`, `event_members`) are kept in the schema but get `org_id` columns added in Task 2 so Stage 2 doesn't need a schema rewrite.
- Tests use `vi.doMock` + dynamic import to swap `@/server/auth` per case; this is why `vi.resetModules()` runs between tests.
