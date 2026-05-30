import { DrawRunForm } from "./draw-run-form";

import type { listDrawEntries, listDrawResults } from "@/server/queries/draw";

type ResultRow = Awaited<ReturnType<typeof listDrawResults>>[number];
type EntryRow = Awaited<ReturnType<typeof listDrawEntries>>[number];

export function DrawView({
  results,
  entries,
  events,
}: {
  results: ResultRow[];
  entries: EntryRow[];
  events: { id: string; code: string }[];
}) {
  const labelOf = new Map(entries.map((e) => [e.id, e.label]));
  const codeOf = new Map(events.map((e) => [e.id, e.code]));

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">LUCKY DRAW</div>
          <h1 className="view-title">Draw</h1>
          <p className="view-subtitle">
            {entries.length} entries · {results.length} prizes drawn
          </p>
        </div>
        <DrawRunForm events={events} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Winners</h3>
        </div>
        <div className="card-body tight">
          {results.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>No draws yet.</p>
          ) : (
            results.map((r) => (
              <div className="row-item" key={r.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{r.prize}</div>
                  <div className="row-sub">
                    {labelOf.get(r.entryId) ?? "—"}
                    {codeOf.get(r.eventId) ? ` · ${codeOf.get(r.eventId)}` : ""}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  {new Date(r.drawnAt).toLocaleDateString("en-MY")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
