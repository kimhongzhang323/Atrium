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
