"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { dbAdmin as db } from "@/server/db/client";
import { events } from "@/server/db/schema";

export const createEventSchema = z.object({
  code: z.string().min(2).max(8),
  name: z.string().min(2).max(80),
  venue: z.string().min(2).max(200),
  budgetTotal: z.number().int().nonnegative(),
  sponsorTarget: z.number().int().nonnegative(),
  registrationsTarget: z.number().int().nonnegative(),
  isCompetition: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export async function createEvent(input: CreateEventInput) {
  const data = createEventSchema.parse(input);
  const [row] = await db.insert(events).values(data).returning();
  revalidatePath("/events");
  return row;
}
