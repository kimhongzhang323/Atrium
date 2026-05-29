import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/* ───────────────────────────── Enums ───────────────────────────── */

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

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending", "accepted", "expired", "revoked",
]);

export const sponsorStageEnum = pgEnum("sponsor_stage", [
  "prospect", "contacted", "proposal", "committed", "declined",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft", "submitted", "dept_approved", "treasurer_approved", "rejected", "paid",
]);

export const approvalDecisionEnum = pgEnum("approval_decision", [
  "pending", "approved", "rejected",
]);

export const fileClassificationEnum = pgEnum("file_classification", [
  "public", "internal", "restricted", "confidential",
]);

export const fileAccessEnum = pgEnum("file_access", [
  "view", "comment", "edit", "sign",
]);

export const principalTypeEnum = pgEnum("principal_type", [
  "user", "role", "dept",
]);

export const signatureStatusEnum = pgEnum("signature_status", [
  "draft", "sent", "partial", "completed", "declined", "expired",
]);

export const signerStatusEnum = pgEnum("signer_status", [
  "pending", "signed", "declined",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "registered", "waitlist", "cancelled", "checked_in",
]);

export const signalTypeEnum = pgEnum("signal_type", [
  "risk", "opportunity", "nudge", "comparison",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app", "email",
]);

/* ─────────────────────── Stage 1: tenancy & auth ─────────────────── */

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

/* ─────────────────────── Stage 3: people & org ───────────────────── */

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6e6e73"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uqCode: unique().on(t.orgId, t.code),
}));

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default("committee"),
  dept: deptEnum("dept"),
  token: text("token").notNull().unique(),
  status: invitationStatusEnum("status").notNull().default("pending"),
  invitedBy: uuid("invited_by").references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ─────────────────────── Stage 2: core domain ────────────────────── */

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
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uqCode: unique().on(t.orgId, t.code),
}));

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  title: text("title").notNull(),
  dept: deptEnum("dept").notNull(),
  status: taskStatusEnum("status").notNull().default("Backlog"),
  ownerId: uuid("owner_id").references(() => users.id),
  due: timestamp("due", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const taskComments = pgTable("task_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventMembers = pgTable("event_members", {
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: roleEnum("role").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.eventId, t.userId] }),
}));

/* ─────────────────────── Stage 4: money ──────────────────────────── */

export const sponsors = pgTable("sponsors", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id),
  name: text("name").notNull(),
  tier: text("tier"),
  stage: sponsorStageEnum("stage").notNull().default("prospect"),
  amountTarget: integer("amount_target").notNull().default(0),
  amountSecured: integer("amount_secured").notNull().default(0),
  ownerId: uuid("owner_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sponsorContacts = pgTable("sponsor_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  sponsorId: uuid("sponsor_id").notNull().references(() => sponsors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
});

export const sponsorInteractions = pgTable("sponsor_interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  sponsorId: uuid("sponsor_id").notNull().references(() => sponsors.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => users.id),
  kind: text("kind").notNull(),
  note: text("note").notNull(),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
});

export const budgetLines = pgTable("budget_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  dept: deptEnum("dept"),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  amountPlanned: integer("amount_planned").notNull().default(0),
  amountCommitted: integer("amount_committed").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id),
  budgetLineId: uuid("budget_line_id").references(() => budgetLines.id),
  vendor: text("vendor").notNull(),
  reference: text("reference"),
  amount: integer("amount").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  submittedBy: uuid("submitted_by").references(() => users.id),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitAmount: integer("unit_amount").notNull().default(0),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  approverId: uuid("approver_id").notNull().references(() => users.id),
  stage: text("stage").notNull(),
  decision: approvalDecisionEnum("decision").notNull().default("pending"),
  note: text("note"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uqDecision: unique().on(t.targetType, t.targetId, t.approverId, t.stage),
}));

export const paymentRecords = pgTable("payment_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  reference: text("reference"),
  paidBy: uuid("paid_by").references(() => users.id),
  paidAt: timestamp("paid_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ───────── Stage 5: registrations, draw, inventory, files, e-sig ──── */

export const registrations = pgTable("registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: registrationStatusEnum("status").notNull().default("registered"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uqEmail: unique().on(t.eventId, t.email),
}));

export const registrationCheckIns = pgTable("registration_check_ins", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  checkedInBy: uuid("checked_in_by").references(() => users.id),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
});

export const drawEntries = pgTable("draw_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  registrationId: uuid("registration_id").references(() => registrations.id),
  label: text("label").notNull(),
  weight: integer("weight").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const drawResults = pgTable("draw_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  entryId: uuid("entry_id").notNull().references(() => drawEntries.id),
  prize: text("prize").notNull(),
  drawnBy: uuid("drawn_by").references(() => users.id),
  drawnAt: timestamp("drawn_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id),
  name: text("name").notNull(),
  sku: text("sku"),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  itemId: uuid("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
});

export const fileLinks = pgTable("file_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id),
  driveFileId: text("drive_file_id").notNull(),
  driveMimeType: text("drive_mime_type").notNull(),
  name: text("name").notNull(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  classification: fileClassificationEnum("classification").notNull().default("internal"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const filePermissions = pgTable("file_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  fileLinkId: uuid("file_link_id").notNull().references(() => fileLinks.id, { onDelete: "cascade" }),
  principalType: principalTypeEnum("principal_type").notNull(),
  principalId: text("principal_id").notNull(),
  access: fileAccessEnum("access").notNull(),
  grantedBy: uuid("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const fileAccessLog = pgTable("file_access_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  fileLinkId: uuid("file_link_id").notNull().references(() => fileLinks.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
});

export const fileVersions = pgTable("file_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  fileLinkId: uuid("file_link_id").notNull().references(() => fileLinks.id, { onDelete: "cascade" }),
  revisionId: text("revision_id").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  summary: text("summary"),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
});

export const signatureRequests = pgTable("signature_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  fileLinkId: uuid("file_link_id").notNull().references(() => fileLinks.id),
  requestedBy: uuid("requested_by").references(() => users.id),
  provider: text("provider").notNull(),
  providerRequestId: text("provider_request_id"),
  status: signatureStatusEnum("status").notNull().default("draft"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const signatureRequestSigners = pgTable("signature_request_signers", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  requestId: uuid("request_id").notNull().references(() => signatureRequests.id, { onDelete: "cascade" }),
  signerUserId: uuid("signer_user_id").references(() => users.id),
  email: text("email"),
  order: integer("order").notNull().default(0),
  status: signerStatusEnum("status").notNull().default("pending"),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  providerCertificateRef: text("provider_certificate_ref"),
});

/* ─────────────────────── Stage 6: intelligence & async ───────────── */

export const eventSnapshots = pgTable("event_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
  kpis: jsonb("kpis").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uqDay: unique().on(t.eventId, t.snapshotDate),
}));

export const aiSignals = pgTable("ai_signals", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  eventId: uuid("event_id").references(() => events.id),
  type: signalTypeEnum("type").notNull(),
  severity: integer("severity").notNull().default(0),
  title: text("title").notNull(),
  body: text("body").notNull(),
  dedupeKey: text("dedupe_key").notNull(),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uqDedupe: unique().on(t.orgId, t.dedupeKey),
}));

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: notificationChannelEnum("channel").notNull().default("in_app"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  inApp: boolean("in_app").notNull().default(true),
  email: boolean("email").notNull().default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.eventType] }),
}));

/* ───────────────────────────── Relations ─────────────────────────── */

export const eventsRelations = relations(events, ({ many }) => ({
  tasks: many(tasks),
  members: many(eventMembers),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  event: one(events, { fields: [tasks.eventId], references: [events.id] }),
  owner: one(users, { fields: [tasks.ownerId], references: [users.id] }),
  comments: many(taskComments),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
  author: one(users, { fields: [taskComments.authorId], references: [users.id] }),
}));

export const eventMembersRelations = relations(eventMembers, ({ one }) => ({
  event: one(events, { fields: [eventMembers.eventId], references: [events.id] }),
  user: one(users, { fields: [eventMembers.userId], references: [users.id] }),
}));

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  contacts: many(sponsorContacts),
  interactions: many(sponsorInteractions),
}));

export const sponsorContactsRelations = relations(sponsorContacts, ({ one }) => ({
  sponsor: one(sponsors, { fields: [sponsorContacts.sponsorId], references: [sponsors.id] }),
}));

export const sponsorInteractionsRelations = relations(sponsorInteractions, ({ one }) => ({
  sponsor: one(sponsors, { fields: [sponsorInteractions.sponsorId], references: [sponsors.id] }),
}));

export const invoicesRelations = relations(invoices, ({ many }) => ({
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
}));

export const fileLinksRelations = relations(fileLinks, ({ many }) => ({
  permissions: many(filePermissions),
  versions: many(fileVersions),
}));

export const signatureRequestsRelations = relations(signatureRequests, ({ many, one }) => ({
  signers: many(signatureRequestSigners),
  file: one(fileLinks, { fields: [signatureRequests.fileLinkId], references: [fileLinks.id] }),
}));

export const signatureRequestSignersRelations = relations(signatureRequestSigners, ({ one }) => ({
  request: one(signatureRequests, { fields: [signatureRequestSigners.requestId], references: [signatureRequests.id] }),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
  checkIns: many(registrationCheckIns),
}));
