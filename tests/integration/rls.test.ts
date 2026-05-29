import { beforeEach, describe, expect, it } from "vitest";

import { withTenantTx } from "@/server/db/client";
import { auditLog } from "@/server/db/schema";

import { resetDb, seedOrg, seedUser } from "../helpers/db";

describe("RLS tenant isolation", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("a session scoped to Org A cannot see Org B's audit_log rows", async () => {
    const orgA = await seedOrg("Org A");
    const orgB = await seedOrg("Org B");
    const userA = await seedUser(orgA.id, "a@example.edu");
    const userB = await seedUser(orgB.id, "b@example.edu");

    await withTenantTx(orgA.id, async (tx) => {
      await tx.insert(auditLog).values({
        orgId: orgA.id,
        actorUserId: userA.id,
        action: "test.event",
        targetType: "user",
        targetId: userA.id,
      });
    });
    await withTenantTx(orgB.id, async (tx) => {
      await tx.insert(auditLog).values({
        orgId: orgB.id,
        actorUserId: userB.id,
        action: "test.event",
        targetType: "user",
        targetId: userB.id,
      });
    });

    const visibleFromA = await withTenantTx(orgA.id, (tx) =>
      tx.query.auditLog.findMany(),
    );
    expect(visibleFromA).toHaveLength(1);
    expect(visibleFromA[0]!.orgId).toBe(orgA.id);

    const visibleFromB = await withTenantTx(orgB.id, (tx) =>
      tx.query.auditLog.findMany(),
    );
    expect(visibleFromB).toHaveLength(1);
    expect(visibleFromB[0]!.orgId).toBe(orgB.id);
  });

  it("a session scoped to Org A cannot insert a row with Org B's org_id", async () => {
    const orgA = await seedOrg("Org A");
    const orgB = await seedOrg("Org B");

    await expect(
      withTenantTx(orgA.id, async (tx) => {
        await tx.insert(auditLog).values({
          orgId: orgB.id,
          action: "tamper",
          targetType: "user",
          targetId: null,
        });
      }),
    ).rejects.toThrow();
  });
});
