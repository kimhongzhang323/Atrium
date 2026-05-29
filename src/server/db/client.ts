import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

import * as schema from "./schema";

const adminUrl = process.env.DATABASE_ADMIN_URL;
const appUrl = process.env.DATABASE_URL;
if (!adminUrl) throw new Error("DATABASE_ADMIN_URL is not set");
if (!appUrl) throw new Error("DATABASE_URL is not set");

const adminClient = postgres(adminUrl, { prepare: false });
export const dbAdmin = drizzle(adminClient, { schema });

const tenantClient = postgres(appUrl, { prepare: false });
const tenantDb = drizzle(tenantClient, { schema });

export type TenantTx = Parameters<Parameters<typeof tenantDb.transaction>[0]>[0];

export async function withTenantTx<T>(
  orgId: string,
  fn: (tx: TenantTx) => Promise<T>,
): Promise<T> {
  return tenantDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.org_id', ${orgId}, true)`);
    return fn(tx);
  });
}
