"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { defineAction } from "@/server/action";
import { budgetLines } from "@/server/db/schema";

const DEPT_VALUES = ["SPR", "PnP", "PUB", "LOGI", "MM", "TECH"] as const;

export const createBudgetLineSchema = z.object({
  eventId: z.string().uuid(),
  category: z.string().min(1).max(80),
  description: z.string().max(400).default(""),
  dept: z.enum(DEPT_VALUES).optional(),
  amountPlanned: z.number().int().nonnegative().default(0),
});

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
