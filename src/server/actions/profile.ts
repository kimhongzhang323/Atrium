"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";

import { defineAction } from "@/server/action";
import { users } from "@/server/db/schema";

const updateProfileInput = z.object({
  name: z.string().min(1, "Name is required").max(80),
});

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export const updateProfile = defineAction({
  name: "profile.update",
  input: updateProfileInput,
  permission: "profile.update",
  async handler({ session, tx, audit }, { name }) {
    const before = await tx.query.users.findFirst({
      where: eq(users.id, session.userId),
    });
    const [after] = await tx
      .update(users)
      .set({ name, initials: initialsOf(name) })
      .where(eq(users.id, session.userId))
      .returning();
    if (!after) throw new Error("User not found after update");

    await audit({
      action: "profile.update",
      targetType: "user",
      targetId: session.userId,
      before,
      after,
    });

    updateTag(`user:${session.userId}`);
    return { user: after };
  },
});
