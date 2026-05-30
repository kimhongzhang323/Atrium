import { DeptTag } from "@/components/ui/dept-tag";

import { TaskStatusSelect } from "./task-status-select";

import type { listTasks } from "@/server/queries/tasks";

type TaskRow = Awaited<ReturnType<typeof listTasks>>[number];

const COLUMNS = ["Backlog", "In Progress", "Review", "Done"] as const;

export function TasksView({ tasks }: { tasks: TaskRow[] }) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">TASKS</div>
          <h1 className="view-title">Tasks</h1>
          <p className="view-subtitle">{tasks.length} across all departments</p>
        </div>
      </div>

      <div className="grid grid-4">
        {COLUMNS.map((status) => {
          const items = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="col">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <h3 className="card-title">{status}</h3>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{items.length}</span>
              </div>

              {items.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>Nothing here.</p>
              ) : (
                items.map((t) => (
                  <div key={t.id} className="card">
                    <div
                      className="card-body"
                      style={{ display: "flex", flexDirection: "column", gap: 8 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <DeptTag id={t.dept} />
                        {t.event && (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {t.event.code}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {t.owner ? (
                          <span
                            className="user-avatar"
                            style={{ width: 22, height: 22, fontSize: 9 }}
                          >
                            {t.owner.initials || "?"}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                            Unassigned
                          </span>
                        )}
                        <div style={{ flex: 1 }} />
                        <TaskStatusSelect taskId={t.id} status={t.status} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
