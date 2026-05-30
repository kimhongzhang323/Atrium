import { asc, eq } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { departments, organizations, users } from "@/server/db/schema";

export function getOrganization() {
  return tenantRead((tx, session) =>
    tx.query.organizations.findFirst({ where: eq(organizations.id, session.orgId) }),
  );
}

export function listDepartments() {
  return tenantRead((tx) =>
    tx.query.departments.findMany({ orderBy: [asc(departments.code)] }),
  );
}

export function listMembers() {
  return tenantRead((tx) =>
    tx.query.users.findMany({ orderBy: [asc(users.name)] }),
  );
}
