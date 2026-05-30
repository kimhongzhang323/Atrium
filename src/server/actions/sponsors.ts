"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { sponsorInteractions, sponsors } from "@/server/db/schema";

import {
  createSponsorSchema,
  logSponsorInteractionSchema,
  moveSponsorStageSchema,
} from "./sponsors.schema";

export const createSponsor = defineAction({
  name: "sponsor.create",
  input: createSponsorSchema,
  permission: "sponsor.create",
  async handler({ session, tx, audit, emit }, input) {
    const [row] = await tx
      .insert(sponsors)
      .values({
        orgId: session.orgId,
        name: input.name,
        eventId: input.eventId,
        tier: input.tier,
        amountTarget: input.amountTarget,
        ownerId: input.ownerId ?? session.userId,
      })
      .returning();
    if (!row) throw new Error("Failed to create sponsor");

    await audit({ action: "sponsor.create", targetType: "sponsor", targetId: row.id, after: row });
    await emit({ type: "sponsor.created", payload: { sponsorId: row.id } });
    updateTag(`org:${session.orgId}:sponsors`);
    return { sponsor: row };
  },
});

export const logSponsorInteraction = defineAction({
  name: "sponsor.log",
  input: logSponsorInteractionSchema,
  permission: "sponsor.log",
  async handler({ session, tx }, { sponsorId, kind, note }) {
    const [row] = await tx
      .insert(sponsorInteractions)
      .values({ orgId: session.orgId, sponsorId, authorId: session.userId, kind, note })
      .returning();
    if (!row) throw new Error("Failed to log interaction");
    updateTag(`sponsor:${sponsorId}`);
    return { interaction: row };
  },
});

export const moveSponsorStage = defineAction({
  name: "sponsor.move_stage",
  input: moveSponsorStageSchema,
  permission: "sponsor.move_stage",
  async handler({ session, tx, audit, emit }, { sponsorId, stage, amountSecured }) {
    const before = await tx.query.sponsors.findFirst({ where: eq(sponsors.id, sponsorId) });
    if (!before) throw new Error("Sponsor not found");

    const [after] = await tx
      .update(sponsors)
      .set({ stage, ...(amountSecured !== undefined ? { amountSecured } : {}) })
      .where(eq(sponsors.id, sponsorId))
      .returning();

    await audit({ action: "sponsor.move_stage", targetType: "sponsor", targetId: sponsorId, before, after });
    if (stage === "committed") {
      await emit({ type: "sponsor.committed", payload: { sponsorId, amountSecured: after?.amountSecured } });
    }
    updateTag(`org:${session.orgId}:sponsors`);
    return { sponsor: after };
  },
});
