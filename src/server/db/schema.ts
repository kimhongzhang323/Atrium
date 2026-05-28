import {
  boolean,
  integer,
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

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  role: roleEnum("role").notNull().default("committee"),
  dept: deptEnum("dept"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  status: eventStatusEnum("status").notNull().default("Planning"),
  venue: text("venue").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  budgetTotal: integer("budget_total").notNull().default(0),
  budgetCommitted: integer("budget_committed").notNull().default(0),
  sponsorTarget: integer("sponsor_target").notNull().default(0),
  sponsorSecured: integer("sponsor_secured").notNull().default(0),
  registrationsTarget: integer("registrations_target").notNull().default(0),
  registrationsCurrent: integer("registrations_current").notNull().default(0),
  isCompetition: boolean("is_competition").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  title: text("title").notNull(),
  dept: deptEnum("dept").notNull(),
  status: taskStatusEnum("status").notNull().default("Backlog"),
  ownerId: uuid("owner_id").references(() => users.id),
  due: timestamp("due"),
});

export const eventMembers = pgTable("event_members", {
  eventId: uuid("event_id").references(() => events.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: roleEnum("role").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.eventId, t.userId] }),
}));
