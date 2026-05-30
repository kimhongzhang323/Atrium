import { DeptTag } from "@/components/ui/dept-tag";
import { KPI } from "@/components/ui/kpi";

import { BudgetCreateForm } from "./budget-create-form";

import type { listBudgetLines } from "@/server/queries/budget";

type LineRow = Awaited<ReturnType<typeof listBudgetLines>>[number];

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function BudgetView({
  lines,
  events,
}: {
  lines: LineRow[];
  events: { id: string; code: string }[];
}) {
  const codeOf = new Map(events.map((e) => [e.id, e.code]));
  const planned = lines.reduce((s, l) => s + l.amountPlanned, 0);
  const committed = lines.reduce((s, l) => s + l.amountCommitted, 0);

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">BUDGET</div>
          <h1 className="view-title">Budget</h1>
          <p className="view-subtitle">{lines.length} lines across all events</p>
        </div>
        <BudgetCreateForm events={events} />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <KPI label="Planned" value={fmtMoney(planned)} />
        <KPI
          label="Committed"
          value={fmtMoney(committed)}
          delta={`${pct(committed, planned)}% of planned`}
        />
        <KPI label="Remaining" value={fmtMoney(Math.max(0, planned - committed))} />
      </div>

      {lines.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              No budget lines yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body tight">
            {lines.map((l) => (
              <div className="row-item" key={l.id}>
                {l.dept ? (
                  <DeptTag id={l.dept} />
                ) : (
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", width: 52 }}>
                    General
                  </span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">
                    {l.category}
                    {codeOf.get(l.eventId) && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {codeOf.get(l.eventId)}
                      </span>
                    )}
                  </div>
                  {l.description && <div className="row-sub">{l.description}</div>}
                </div>
                <div style={{ width: 200 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {fmtMoney(l.amountCommitted)}
                    </span>
                    <span style={{ color: "var(--text-tertiary)" }}>
                      / {fmtMoney(l.amountPlanned)}
                    </span>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${Math.min(pct(l.amountCommitted, l.amountPlanned), 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
