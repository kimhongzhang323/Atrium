import { desc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { sponsors } from "@/server/db/schema";

export function listSponsors() {
  return tenantRead((tx) =>
    tx.query.sponsors.findMany({
      orderBy: [desc(sponsors.createdAt)],
    }),
  );
}
