"use server";

import { randomInt } from "node:crypto";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { AppError } from "@/lib/result";
import {
  drawEntries,
  drawResults,
  inventoryItems,
  inventoryMovements,
  registrationCheckIns,
  registrations,
} from "@/server/db/schema";

import {
  checkInAttendeeSchema,
  recordInventoryMovementSchema,
  runDrawSchema,
} from "./operations.schema";

export const checkInAttendee = defineAction({
  name: "checkin.create",
  input: checkInAttendeeSchema,
  permission: "checkin.create",
  async handler({ session, tx, audit, emit }, { registrationId }) {
    const reg = await tx.query.registrations.findFirst({ where: eq(registrations.id, registrationId) });
    if (!reg) throw new AppError({ code: "NOT_FOUND", message: "Registration not found" });

    const [checkIn] = await tx
      .insert(registrationCheckIns)
      .values({ orgId: session.orgId, registrationId, checkedInBy: session.userId })
      .returning();
    await tx.update(registrations).set({ status: "checked_in" }).where(eq(registrations.id, registrationId));

    await audit({ action: "checkin.create", targetType: "registration", targetId: registrationId, after: checkIn });
    await emit({ type: "attendee.checked_in", payload: { registrationId, eventId: reg.eventId } });
    updateTag(`event:${reg.eventId}:registrations`);
    return { checkIn };
  },
});

export const runDraw = defineAction({
  name: "draw.run",
  input: runDrawSchema,
  permission: "draw.run",
  async handler({ session, tx, audit, emit }, { eventId, prizes }) {
    const entries = await tx.query.drawEntries.findMany({ where: eq(drawEntries.eventId, eventId) });
    if (entries.length === 0) throw new AppError({ code: "CONFLICT", message: "No draw entries for this event" });

    const pool = entries.map((e) => ({ id: e.id, label: e.label, weight: Math.max(1, e.weight) }));
    const winners: { prize: string; entryId: string; label: string }[] = [];

    for (const prize of prizes) {
      if (pool.length === 0) break;
      const total = pool.reduce((s, e) => s + e.weight, 0);
      // CSPRNG: weighted pick is observable to participants, so don't use Math.random.
      let roll = randomInt(0, total);
      let idx = 0;
      for (let i = 0; i < pool.length; i++) {
        roll -= pool[i]!.weight;
        if (roll < 0) { idx = i; break; }
      }
      const picked = pool.splice(idx, 1)[0]!;
      await tx.insert(drawResults).values({
        orgId: session.orgId,
        eventId,
        entryId: picked.id,
        prize,
        drawnBy: session.userId,
      });
      winners.push({ prize, entryId: picked.id, label: picked.label });
    }

    await audit({ action: "draw.run", targetType: "event", targetId: eventId, after: { winners } });
    await emit({ type: "draw.completed", payload: { eventId, winners } });
    updateTag(`event:${eventId}:draw`);
    return { winners };
  },
});

export const recordInventoryMovement = defineAction({
  name: "inventory.move",
  input: recordInventoryMovementSchema,
  permission: "inventory.move",
  async handler({ session, tx, audit }, { itemId, delta, reason }) {
    const item = await tx.query.inventoryItems.findFirst({ where: eq(inventoryItems.id, itemId) });
    if (!item) throw new AppError({ code: "NOT_FOUND", message: "Inventory item not found" });
    if (item.quantityOnHand + delta < 0) {
      throw new AppError({ code: "CONFLICT", message: "Movement would drive quantity negative" });
    }

    const [movement] = await tx
      .insert(inventoryMovements)
      .values({ orgId: session.orgId, itemId, delta, reason, actorId: session.userId })
      .returning();
    const [after] = await tx
      .update(inventoryItems)
      .set({ quantityOnHand: sql`${inventoryItems.quantityOnHand} + ${delta}` })
      .where(eq(inventoryItems.id, itemId))
      .returning();

    await audit({ action: "inventory.move", targetType: "inventory_item", targetId: itemId, before: item, after });
    return { movement, item: after };
  },
});
