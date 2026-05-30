"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { AppError } from "@/lib/result";
import { approvals, invoiceLineItems, invoices, paymentRecords } from "@/server/db/schema";

import {
  approveInvoiceSchema,
  recordPaymentSchema,
  rejectInvoiceSchema,
  submitInvoiceSchema,
} from "./invoices.schema";

export const submitInvoice = defineAction({
  name: "invoice.submit",
  input: submitInvoiceSchema,
  permission: "invoice.submit",
  async handler({ session, tx, audit, emit }, input) {
    const [invoice] = await tx
      .insert(invoices)
      .values({
        orgId: session.orgId,
        vendor: input.vendor,
        amount: input.amount,
        eventId: input.eventId,
        budgetLineId: input.budgetLineId,
        reference: input.reference,
        status: "submitted",
        submittedBy: session.userId,
        submittedAt: new Date(),
      })
      .returning();
    if (!invoice) throw new Error("Failed to submit invoice");

    const lineItems = input.lineItems ?? [];
    if (lineItems.length > 0) {
      await tx.insert(invoiceLineItems).values(
        lineItems.map((li) => ({
          orgId: session.orgId,
          invoiceId: invoice.id,
          description: li.description,
          quantity: li.quantity,
          unitAmount: li.unitAmount,
        })),
      );
    }

    await audit({ action: "invoice.submit", targetType: "invoice", targetId: invoice.id, after: invoice });
    await emit({ type: "invoice.submitted", payload: { invoiceId: invoice.id, amount: invoice.amount } });
    updateTag(`org:${session.orgId}:invoices`);
    return { invoice };
  },
});

const APPROVAL_FLOW: Record<string, { from: string; to: string; permission: "invoice.approve" }> = {
  dept: { from: "submitted", to: "dept_approved", permission: "invoice.approve" },
  treasurer: { from: "dept_approved", to: "treasurer_approved", permission: "invoice.approve" },
};

export const approveInvoice = defineAction({
  name: "invoice.approve",
  input: approveInvoiceSchema,
  permission: "invoice.approve",
  async handler({ session, tx, audit, emit }, { invoiceId, stage, note }) {
    const flow = APPROVAL_FLOW[stage]!;
    const before = await tx.query.invoices.findFirst({ where: eq(invoices.id, invoiceId) });
    if (!before) throw new AppError({ code: "NOT_FOUND", message: "Invoice not found" });
    if (before.status !== flow.from) {
      throw new AppError({
        code: "CONFLICT",
        message: `Invoice must be "${flow.from}" to approve at the ${stage} stage (currently "${before.status}")`,
      });
    }

    const existing = await tx.query.approvals.findFirst({
      where: and(
        eq(approvals.targetType, "invoice"),
        eq(approvals.targetId, invoiceId),
        eq(approvals.approverId, session.userId),
        eq(approvals.stage, stage),
      ),
    });
    if (existing) {
      throw new AppError({ code: "CONFLICT", message: "You already recorded a decision at this stage" });
    }

    await tx.insert(approvals).values({
      orgId: session.orgId,
      targetType: "invoice",
      targetId: invoiceId,
      approverId: session.userId,
      stage,
      decision: "approved",
      note,
      decidedAt: new Date(),
    });

    const [after] = await tx
      .update(invoices)
      .set({ status: flow.to as typeof before.status })
      .where(eq(invoices.id, invoiceId))
      .returning();

    await audit({ action: "invoice.approve", targetType: "invoice", targetId: invoiceId, before, after });
    await emit({
      type: stage === "treasurer" ? "invoice.fully_approved" : "invoice.approved",
      payload: { invoiceId, stage },
    });
    updateTag(`org:${session.orgId}:invoices`);
    return { invoice: after };
  },
});

export const rejectInvoice = defineAction({
  name: "invoice.reject",
  input: rejectInvoiceSchema,
  permission: "invoice.reject",
  async handler({ session, tx, audit, emit }, { invoiceId, stage, note }) {
    const before = await tx.query.invoices.findFirst({ where: eq(invoices.id, invoiceId) });
    if (!before) throw new AppError({ code: "NOT_FOUND", message: "Invoice not found" });

    await tx.insert(approvals).values({
      orgId: session.orgId,
      targetType: "invoice",
      targetId: invoiceId,
      approverId: session.userId,
      stage,
      decision: "rejected",
      note,
      decidedAt: new Date(),
    });

    const [after] = await tx
      .update(invoices)
      .set({ status: "rejected" })
      .where(eq(invoices.id, invoiceId))
      .returning();

    await audit({ action: "invoice.reject", targetType: "invoice", targetId: invoiceId, before, after });
    await emit({ type: "invoice.rejected", payload: { invoiceId, stage } });
    updateTag(`org:${session.orgId}:invoices`);
    return { invoice: after };
  },
});

export const recordPayment = defineAction({
  name: "payment.record",
  input: recordPaymentSchema,
  permission: "payment.record",
  async handler({ session, tx, audit, emit }, { invoiceId, amount, method, reference }) {
    const before = await tx.query.invoices.findFirst({ where: eq(invoices.id, invoiceId) });
    if (!before) throw new AppError({ code: "NOT_FOUND", message: "Invoice not found" });
    if (before.status !== "treasurer_approved") {
      throw new AppError({
        code: "CONFLICT",
        message: `Invoice must be treasurer-approved before payment (currently "${before.status}")`,
      });
    }

    const [payment] = await tx
      .insert(paymentRecords)
      .values({ orgId: session.orgId, invoiceId, amount, method, reference, paidBy: session.userId })
      .returning();

    const [after] = await tx
      .update(invoices)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(invoices.id, invoiceId))
      .returning();

    await audit({ action: "payment.record", targetType: "invoice", targetId: invoiceId, before, after });
    await emit({ type: "invoice.paid", payload: { invoiceId, amount } });
    updateTag(`org:${session.orgId}:invoices`);
    return { invoice: after, payment };
  },
});
