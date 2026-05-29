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
  const [org] = await dbAdmin
    .insert(organizations)
    .values({ name, slug: name.toLowerCase().replace(/\s+/g, "-") })
    .returning();
  if (!org) throw new Error("seed failed");
  return org;
}

export async function seedUser(
  orgId: string,
  email: string,
  role: "director" | "committee" = "director",
) {
  const [u] = await dbAdmin
    .insert(users)
    .values({
      email,
      name: email.split("@")[0]!,
      initials: email.slice(0, 2).toUpperCase(),
      orgId,
      role,
    })
    .returning();
  if (!u) throw new Error("seed failed");
  await dbAdmin.insert(orgMembers).values({ orgId, userId: u.id, role });
  return u;
}
