import { desc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { fileLinks } from "@/server/db/schema";

export function listFileLinks() {
  return tenantRead((tx) =>
    tx.query.fileLinks.findMany({
      with: { permissions: true },
      orderBy: [desc(fileLinks.createdAt)],
    }),
  );
}
