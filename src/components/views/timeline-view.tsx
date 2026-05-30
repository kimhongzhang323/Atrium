import { Pill } from "@/components/ui/pill";

import type { listEvents } from "@/server/queries/events";
import type { listTasks } from "@/server/queries/tasks";

type EventRow = Awaited<ReturnType<typeof listEvents>>[number];
type TaskRow = Awaited<ReturnType<typeof listTasks>>[number];

const STATUS_TONE = { Planning: "info", Live: "success", Completed: "neutral" } as const;

function fmtDate(d: Date | null) {
  return d ? new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "TBD";
}

export function TimelineView({ events, tasks }: { events: EventRow[]; tasks: TaskRow[] }) {
  const ordered = [...events].sort((a, b) => {
    const at = a.startsAt ? new Date(a.startsAt).getTime() : Infinity;
    const bt = b.startsAt ? new Date(b.startsAt).getTime() : Infinity;
    return at - bt;
  });

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">TIMELINE</div>
          <h1 className="view-title">Timeline</h1>
          <p className="view-subtitle">{events.length} events, scheduled by start date</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body tight">
          {ordered.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>No events scheduled.</p>
          ) : (
            ordered.map((e) => {
              const evTasks = tasks.filter((t) => t.eventId === e.id);
              const done = evTasks.filter((t) => t.status === "Done").length;
              return (
                <div className="row-item" key={e.id}>
                  <div style={{ width: 130, fontSize: 12, color: "var(--text-secondary)" }}>
                    {fmtDate(e.startsAt)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-title">
                      {e.name}
                      <span
                        style={{
                          marginLeft: 8,
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {e.code}
                      </span>
                    </div>
                    <div className="row-sub">
                      {e.venue} · {done}/{evTasks.length} tasks done
                    </div>
                  </div>
                  <Pill tone={STATUS_TONE[e.status]} dot>
                    {e.status}
                  </Pill>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
