import Link from "next/link";

import { KPI } from "@/components/ui/kpi";
import { Pill } from "@/components/ui/pill";

import { InvoiceActions } from "./invoice-actions";

import type { listBudgetLines } from "@/server/queries/budget";
import type { listInvoices } from "@/server/queries/invoices";

type InvoiceRow = Awaited<ReturnType<typeof listInvoices>>[number];
type LineRow = Awaited<ReturnType<typeof listBudgetLines>>[number];

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

export function TreasurerConsole({
  invoices,
  budgetLines,
}: {
  invoices: InvoiceRow[];
  budgetLines: LineRow[];
}) {
  const pending = invoices.filter(
    (i) => i.status === "submitted" || i.status === "dept_approved",
  );
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const committed = budgetLines.reduce((s, l) => s + l.amountCommitted, 0);

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">TREASURER · FINANCE COMMAND CENTER</div>
          <h1 className="view-title">Finance</h1>
          <p className="view-subtitle">{pending.length} invoices awaiting your decision</p>
        </div>
        <Link href="/budget" className="btn">
          Open budget
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <KPI label="Total invoiced" value={fmtMoney(totalInvoiced)} />
        <KPI label="Paid" value={fmtMoney(paid)} />
        <KPI label="Pending approval" value={String(pending.length)} />
        <KPI label="Budget committed" value={fmtMoney(committed)} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Approval inbox</h3>
        </div>
        <div className="card-body tight">
          {pending.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Nothing pending. You&apos;re all caught up.
            </p>
          ) : (
            pending.map((inv) => (
              <div className="row-item" key={inv.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{inv.vendor}</div>
                  <div className="row-sub">
                    {inv.reference ? `${inv.reference} · ` : ""}
                    {fmtMoney(inv.amount)}
                  </div>
                </div>
                <Pill tone="info" dot>
                  {inv.status === "submitted" ? "Awaiting dept" : "Awaiting treasurer"}
                </Pill>
                <InvoiceActions id={inv.id} status={inv.status} amount={inv.amount} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
