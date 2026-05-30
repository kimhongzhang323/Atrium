"use server";

import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { budgetLines } from "@/server/db/schema";

import { createBudgetLineSchema } from "./budget.schema";

export const createBudgetLine = defineAction({
  name: "budget.create",
  input: createBudgetLineSchema,
  permission: "budget.create",
  async handler({ session, tx, audit }, input) {
    const [row] = await tx
      .insert(budgetLines)
      .values({
        orgId: session.orgId,
        eventId: input.eventId,
        category: input.category,
        description: input.description,
        dept: input.dept,
        amountPlanned: input.amountPlanned,
      })
      .returning();
    if (!row) throw new Error("Failed to create budget line");

    await audit({ action: "budget.create", targetType: "budget_line", targetId: row.id, after: row });
    updateTag(`event:${input.eventId}:budget`);
    return { budgetLine: row };
  },
});
