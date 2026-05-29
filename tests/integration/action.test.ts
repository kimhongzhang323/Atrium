import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetDb, seedOrg, seedUser } from "../helpers/db";

afterEach(() => vi.resetModules());

describe("updateProfile via defineAction", () => {
  beforeEach(async () => {
    await resetDb();
    vi.resetModules();
  });

  it("returns VALIDATION error on empty name", async () => {
    const org = await seedOrg("Org A");
    const user = await seedUser(org.id, "a@example.edu", "director");
    const { mockSession } = await import("../helpers/session");
    mockSession({ id: user.id, orgId: org.id, role: "director" });

    const { updateProfile } = await import("@/server/actions/profile");
    const res = await updateProfile({ name: "" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("VALIDATION");
      expect(res.error.fields?.name).toBeDefined();
    }
  });

  it("returns UNAUTHENTICATED when no session", async () => {
    const { mockNoSession } = await import("../helpers/session");
    mockNoSession();

    const { updateProfile } = await import("@/server/actions/profile");
    const res = await updateProfile({ name: "Alice" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("UNAUTHENTICATED");
  });

  it("updates the user and writes an audit_log row", async () => {
    const org = await seedOrg("Org A");
    const user = await seedUser(org.id, "a@example.edu", "director");
    const { mockSession } = await import("../helpers/session");
    mockSession({ id: user.id, orgId: org.id, role: "director" });

    const { updateProfile } = await import("@/server/actions/profile");
    const res = await updateProfile({ name: "Alice Tan" });
    expect(res.ok).toBe(true);

    const { withTenantTx } = await import("@/server/db/client");
    const logs = await withTenantTx(org.id, (tx) =>
      tx.query.auditLog.findMany(),
    );
    expect(logs).toHaveLength(1);
    expect(logs[0]!.action).toBe("profile.update");
  });
});
