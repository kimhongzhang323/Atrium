import type { listEvents } from "@/server/queries/events";
import type { listTasks } from "@/server/queries/tasks";

type EventRow = Awaited<ReturnType<typeof listEvents>>[number];
type TaskRow = Awaited<ReturnType<typeof listTasks>>[number];

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function ReportsView({ events, tasks }: { events: EventRow[]; tasks: TaskRow[] }) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">REPORTS</div>
          <h1 className="view-title">Reports</h1>
          <p className="view-subtitle">Per-event snapshot across sponsor, budget, and reach</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>No events to report on yet.</p>
          </div>
        </div>
      ) : (
        <div className="col">
          {events.map((e) => {
            const evTasks = tasks.filter((t) => t.eventId === e.id);
            const done = evTasks.filter((t) => t.status === "Done").length;
            return (
              <div className="card" key={e.id}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{e.name}</h3>
                    <p className="card-subtitle">
                      {e.code} · {e.status}
                    </p>
                  </div>
                </div>
                <div className="card-body">
                  <div className="grid grid-4">
                    <Metric
                      label="Sponsor"
                      value={fmtMoney(e.sponsorSecured)}
                      sub={`${pct(e.sponsorSecured, e.sponsorTarget)}% of ${fmtMoney(e.sponsorTarget)}`}
                    />
                    <Metric
                      label="Budget committed"
                      value={fmtMoney(e.budgetCommitted)}
                      sub={`${pct(e.budgetCommitted, e.budgetTotal)}% of ${fmtMoney(e.budgetTotal)}`}
                    />
                    <Metric
                      label="Registrations"
                      value={e.registrationsCurrent.toLocaleString()}
                      sub={`${pct(e.registrationsCurrent, e.registrationsTarget)}% of target`}
                    />
                    <Metric
                      label="Tasks"
                      value={`${done} / ${evTasks.length}`}
                      sub={`${pct(done, evTasks.length)}% complete`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, margin: "2px 0" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{sub}</div>
    </div>
  );
}
