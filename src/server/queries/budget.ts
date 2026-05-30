import { desc } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { budgetLines } from "@/server/db/schema";

export function listBudgetLines() {
  return tenantRead((tx) =>
    tx.query.budgetLines.findMany({
      orderBy: [desc(budgetLines.createdAt)],
    }),
  );
}
