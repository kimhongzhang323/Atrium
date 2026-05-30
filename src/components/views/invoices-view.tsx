import { Pill } from "@/components/ui/pill";

import { InvoiceActions } from "./invoice-actions";
import { InvoiceSubmitForm } from "./invoice-submit-form";

import type { listInvoices } from "@/server/queries/invoices";

type InvoiceRow = Awaited<ReturnType<typeof listInvoices>>[number];

const STATUS_TONE = {
  draft: "neutral",
  submitted: "info",
  dept_approved: "info",
  treasurer_approved: "warn",
  rejected: "danger",
  paid: "success",
} as const;

const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  dept_approved: "Dept approved",
  treasurer_approved: "Treasurer approved",
  rejected: "Rejected",
  paid: "Paid",
} as const;

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

export function InvoicesView({ invoices }: { invoices: InvoiceRow[] }) {
  const pending = invoices.filter(
    (i) => i.status === "submitted" || i.status === "dept_approved",
  ).length;

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">INVOICES &amp; CLAIMS</div>
          <h1 className="view-title">Invoices</h1>
          <p className="view-subtitle">
            {invoices.length} total · {pending} awaiting approval
          </p>
        </div>
        <InvoiceSubmitForm />
      </div>

      {invoices.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              No invoices yet. Submit one to start the approval flow.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body tight">
            {invoices.map((inv) => (
              <div className="row-item" key={inv.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{inv.vendor}</div>
                  <div className="row-sub">
                    {inv.reference ? `${inv.reference} · ` : ""}
                    {inv.lineItems.length > 0 ? `${inv.lineItems.length} line items` : "No line items"}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, width: 110, textAlign: "right" }}>
                  {fmtMoney(inv.amount)}
                </div>
                <div style={{ width: 150 }}>
                  <Pill tone={STATUS_TONE[inv.status]} dot>
                    {STATUS_LABEL[inv.status]}
                  </Pill>
                </div>
                <InvoiceActions id={inv.id} status={inv.status} amount={inv.amount} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
