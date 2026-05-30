import { desc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { registrations } from "@/server/db/schema";

export function listRegistrations() {
  return tenantRead((tx) =>
    tx.query.registrations.findMany({
      with: { event: true },
      orderBy: [desc(registrations.createdAt)],
    }),
  );
}
