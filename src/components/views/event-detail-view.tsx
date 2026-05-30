import { DeptTag } from "@/components/ui/dept-tag";
import { KPI } from "@/components/ui/kpi";
import { Pill } from "@/components/ui/pill";

import type { getEventById } from "@/server/queries/events";

type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventById>>>;

const STATUS_TONE = { Planning: "info", Live: "success", Completed: "neutral" } as const;
const TASK_TONE = {
  Backlog: "neutral",
  "In Progress": "info",
  Review: "warn",
  Done: "success",
} as const;

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function EventDetailView({ event }: { event: EventDetail }) {
  const tasks = event.tasks ?? [];
  const done = tasks.filter((t) => t.status === "Done").length;

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">
            {event.code} · EVENT
          </div>
          <h1 className="view-title">{event.name}</h1>
          <p className="view-subtitle">{event.venue}</p>
        </div>
        <Pill tone={STATUS_TONE[event.status]} dot>
          {event.status}
        </Pill>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <KPI
          label="Sponsor secured"
          value={fmtMoney(event.sponsorSecured)}
          delta={`${pct(event.sponsorSecured, event.sponsorTarget)}% of ${fmtMoney(event.sponsorTarget)}`}
        />
        <KPI
          label="Budget committed"
          value={fmtMoney(event.budgetCommitted)}
          delta={`${pct(event.budgetCommitted, event.budgetTotal)}% of ${fmtMoney(event.budgetTotal)}`}
        />
        <KPI
          label="Registrations"
          value={event.registrationsCurrent.toLocaleString()}
          delta={`${pct(event.registrationsCurrent, event.registrationsTarget)}% of ${event.registrationsTarget.toLocaleString()}`}
          deltaDir="up"
        />
        <KPI
          label="Tasks done"
          value={`${done} / ${tasks.length}`}
          delta={`${event.members?.length ?? 0} members`}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tasks</h3>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {tasks.length} total
          </span>
        </div>
        <div className="card-body tight">
          {tasks.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>No tasks yet.</p>
          ) : (
            tasks.map((t) => (
              <div className="row-item" key={t.id}>
                <DeptTag id={t.dept} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{t.title}</div>
                </div>
                <Pill tone={TASK_TONE[t.status]}>{t.status}</Pill>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
