import { auth } from "@/server/auth";
import { withTenantTx, type TenantTx } from "@/server/db/client";
import { AppError } from "@/lib/result";
import type { ActionSession } from "@/server/action";
import type { RoleId, DeptId } from "@/lib/types";

/**
 * Run a read inside an RLS-scoped transaction for the current session's org.
 * Use from Server Components. Throws AppError("UNAUTHENTICATED") if no session.
 */
export async function tenantRead<T>(
  fn: (tx: TenantTx, session: ActionSession) => Promise<T>,
): Promise<T> {
  const authSession = await auth();
  if (!authSession?.user) {
    throw new AppError({ code: "UNAUTHENTICATED", message: "Sign in required" });
  }
  const session: ActionSession = {
    userId: authSession.user.id,
    orgId: authSession.user.orgId,
    role: authSession.user.role as RoleId,
    dept: (authSession.user.dept ?? null) as DeptId | null,
  };
  return withTenantTx(session.orgId, (tx) => fn(tx, session));
}
