import { Pill } from "@/components/ui/pill";

import { InvoiceActions } from "./invoice-actions";

import type { listInvoices } from "@/server/queries/invoices";

type InvoiceRow = Awaited<ReturnType<typeof listInvoices>>[number];

const STAGE_LABEL: Record<"submitted" | "dept_approved", string> = {
  submitted: "Awaiting dept",
  dept_approved: "Awaiting treasurer",
};

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

export function ApprovalsView({ invoices }: { invoices: InvoiceRow[] }) {
  const pending = invoices.filter(
    (i) => i.status === "submitted" || i.status === "dept_approved",
  );

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">APPROVALS</div>
          <h1 className="view-title">Approval queue</h1>
          <p className="view-subtitle">{pending.length} invoices awaiting a decision</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Nothing pending. You&apos;re all caught up.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body tight">
            {pending.map((inv) => (
              <div className="row-item" key={inv.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{inv.vendor}</div>
                  <div className="row-sub">
                    {inv.reference ? `${inv.reference} · ` : ""}
                    {fmtMoney(inv.amount)}
                  </div>
                </div>
                <Pill tone="info" dot>
                  {STAGE_LABEL[inv.status as "submitted" | "dept_approved"]}
                </Pill>
                <InvoiceActions id={inv.id} status={inv.status} amount={inv.amount} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
