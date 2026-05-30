"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { approveInvoice, recordPayment, rejectInvoice } from "@/server/actions/invoices";

import type { Result } from "@/lib/result";

type Status =
  | "draft"
  | "submitted"
  | "dept_approved"
  | "treasurer_approved"
  | "rejected"
  | "paid";

export function InvoiceActions({
  id,
  status,
  amount,
}: {
  id: string;
  status: Status;
  amount: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<Result<unknown>>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) router.refresh();
      else setError(res.error.message);
    });
  }

  const stage = status === "submitted" ? "dept" : "treasurer";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {(status === "submitted" || status === "dept_approved") && (
        <>
          <button
            className="btn"
            disabled={pending}
            onClick={() => run(() => approveInvoice({ invoiceId: id, stage }))}
          >
            Approve · {stage}
          </button>
          <button
            className="btn ghost"
            disabled={pending}
            onClick={() => run(() => rejectInvoice({ invoiceId: id, stage }))}
          >
            Reject
          </button>
        </>
      )}
      {status === "treasurer_approved" && (
        <button
          className="btn primary"
          disabled={pending}
          onClick={() => run(() => recordPayment({ invoiceId: id, amount, method: "manual" }))}
        >
          Record payment
        </button>
      )}
      {error && (
        <span className="text-xs text-[--danger]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
