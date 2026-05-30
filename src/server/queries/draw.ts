import { desc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { drawEntries, drawResults } from "@/server/db/schema";

export function listDrawResults() {
  return tenantRead((tx) =>
    tx.query.drawResults.findMany({
      orderBy: [desc(drawResults.drawnAt)],
    }),
  );
}

export function listDrawEntries() {
  return tenantRead((tx) =>
    tx.query.drawEntries.findMany({
      orderBy: [desc(drawEntries.createdAt)],
    }),
  );
}
