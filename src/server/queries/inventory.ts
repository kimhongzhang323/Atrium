import { asc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { inventoryItems } from "@/server/db/schema";

export function listInventoryItems() {
  return tenantRead((tx) =>
    tx.query.inventoryItems.findMany({
      orderBy: [asc(inventoryItems.name)],
    }),
  );
}
