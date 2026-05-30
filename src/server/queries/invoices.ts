import { desc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { invoices } from "@/server/db/schema";

export function listInvoices() {
  return tenantRead((tx) =>
    tx.query.invoices.findMany({
      with: { lineItems: true },
      orderBy: [desc(invoices.createdAt)],
    }),
  );
}
