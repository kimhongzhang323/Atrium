import { z } from "zod";

export const submitInvoiceSchema = z.object({
  vendor: z.string().min(1).max(160),
  amount: z.number().int().positive(),
  eventId: z.string().uuid().optional(),
  budgetLineId: z.string().uuid().optional(),
  reference: z.string().max(80).optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1).max(200),
        quantity: z.number().int().positive().default(1),
        unitAmount: z.number().int().nonnegative().default(0),
      }),
    )
    .default([]),
});

export const approveInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  stage: z.enum(["dept", "treasurer"]),
  note: z.string().max(2000).optional(),
});

export const rejectInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  stage: z.enum(["dept", "treasurer"]),
  note: z.string().max(2000).optional(),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().int().positive(),
  method: z.string().min(1).max(40),
  reference: z.string().max(80).optional(),
});
