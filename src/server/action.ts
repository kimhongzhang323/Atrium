import { ZodError, type ZodSchema } from "zod";

import { auth } from "@/server/auth";
import { withTenantTx, type TenantTx } from "@/server/db/client";
import { requirePermission } from "@/server/rbac";
import { AppError, err, ok, type Result } from "@/lib/result";
import { auditLog, domainEvents } from "@/server/db/schema";
import type { Permission, RoleId, DeptId } from "@/lib/types";

export interface ActionSession {
  userId: string;
  orgId: string;
  role: RoleId;
  dept: DeptId | null;
}

export interface ActionCtx {
  session: ActionSession;
  tx: TenantTx;
  audit: (entry: {
    action: string;
    targetType: string;
    targetId: string | null;
    before?: unknown;
    after?: unknown;
  }) => Promise<void>;
  emit: (event: { type: string; payload: unknown }) => Promise<void>;
}

export interface DefineActionOpts<TInput, TOutput> {
  name: string;
  input: ZodSchema<TInput>;
  permission?: Permission;
  handler: (ctx: ActionCtx, input: TInput) => Promise<TOutput>;
}

export function defineAction<TInput, TOutput>(
  opts: DefineActionOpts<TInput, TOutput>,
): (raw: unknown) => Promise<Result<TOutput>> {
  return async function action(raw: unknown): Promise<Result<TOutput>> {
    const start = Date.now();
    let outcome: "ok" | "validation" | "auth" | "forbidden" | "error" = "ok";
    let userId: string | undefined;
    let orgId: string | undefined;
    try {
      const parsed = opts.input.safeParse(raw);
      if (!parsed.success) {
        outcome = "validation";
        return err({
          code: "VALIDATION",
          message: "Invalid input",
          fields: zodErrorToFields(parsed.error),
        });
      }

      const authSession = await auth();
      if (!authSession?.user) {
        outcome = "auth";
        return err({ code: "UNAUTHENTICATED", message: "Sign in required" });
      }

      const session: ActionSession = {
        userId: authSession.user.id,
        orgId: authSession.user.orgId,
        role: authSession.user.role,
        dept: authSession.user.dept,
      };
      userId = session.userId;
      orgId = session.orgId;

      if (opts.permission) requirePermission(session.role, opts.permission);

      const data = await withTenantTx(session.orgId, async (tx) => {
        const ctx: ActionCtx = {
          session,
          tx,
          async audit(entry) {
            await tx.insert(auditLog).values({
              orgId: session.orgId,
              actorUserId: session.userId,
              action: entry.action,
              targetType: entry.targetType,
              targetId: entry.targetId,
              before: (entry.before ?? null) as never,
              after: (entry.after ?? null) as never,
            });
          },
          async emit(event) {
            await tx.insert(domainEvents).values({
              orgId: session.orgId,
              eventType: event.type,
              payload: event.payload as never,
            });
          },
        };
        return opts.handler(ctx, parsed.data);
      });

      return ok(data);
    } catch (e) {
      if (e instanceof AppError) {
        outcome = e.code === "FORBIDDEN" ? "forbidden" : "error";
        return err(e.toJSON());
      }
      outcome = "error";
      console.error(`[action:${opts.name}] unhandled`, e);
      return err({ code: "INTERNAL", message: "Something went wrong" });
    } finally {
      const durationMs = Date.now() - start;
      console.log(
        JSON.stringify({
          tag: "action",
          name: opts.name,
          orgId,
          userId,
          outcome,
          durationMs,
        }),
      );
    }
  };
}

function zodErrorToFields(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    if (!(path in out)) out[path] = issue.message;
  }
  return out;
}
