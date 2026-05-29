import { vi } from "vitest";

export function mockSession(user: {
  id: string;
  orgId: string;
  role: string;
  dept?: string | null;
}) {
  vi.doMock("@/server/auth", () => ({
    auth: async () => ({
      user: {
        id: user.id,
        orgId: user.orgId,
        role: user.role,
        dept: user.dept ?? null,
        email: "test@example.edu",
        name: "Test User",
      },
    }),
  }));
}

export function mockNoSession() {
  vi.doMock("@/server/auth", () => ({
    auth: async () => null,
  }));
}
