import { desc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { tasks } from "@/server/db/schema";

export function listTasks() {
  return tenantRead((tx) =>
    tx.query.tasks.findMany({
      with: { event: true, owner: true },
      orderBy: [desc(tasks.createdAt)],
    }),
  );
}
