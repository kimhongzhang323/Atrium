import Link from "next/link";

import { Pill } from "@/components/ui/pill";

import { EventCreateForm } from "./event-create-form";

import type { listEvents } from "@/server/queries/events";

type EventRow = Awaited<ReturnType<typeof listEvents>>[number];

const STATUS_TONE = { Planning: "info", Live: "success", Completed: "neutral" } as const;

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function EventsView({ events }: { events: EventRow[] }) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">EVENTS</div>
          <h1 className="view-title">Events</h1>
          <p className="view-subtitle">
            {events.length} active · conferences, code sprints, workshops
          </p>
        </div>
        <EventCreateForm />
      </div>

      {events.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              No events yet. Create your first event to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {e.code}
                  </span>
                  <div style={{ flex: 1 }} />
                  <Pill tone={STATUS_TONE[e.status]} dot>
                    {e.status}
                  </Pill>
                </div>
                <h3 className="card-title" style={{ marginBottom: 4 }}>
                  {e.name}
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {e.venue}
                </p>
                <div style={{ marginTop: 12 }}>
                  <Meter
                    label="Sponsor"
                    value={pct(e.sponsorSecured, e.sponsorTarget)}
                    detail={`${fmtMoney(e.sponsorSecured)} / ${fmtMoney(e.sponsorTarget)}`}
                  />
                  <Meter
                    label="Registrations"
                    value={pct(e.registrationsCurrent, e.registrationsTarget)}
                    detail={`${e.registrationsCurrent} / ${e.registrationsTarget}`}
                  />
                  <Meter
                    label="Budget"
                    value={pct(e.budgetCommitted, e.budgetTotal)}
                    detail={`${fmtMoney(e.budgetCommitted)} / ${fmtMoney(e.budgetTotal)}`}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div style={{ padding: "6px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{detail}</span>
        <span style={{ fontSize: 12, fontWeight: 600, width: 34, textAlign: "right" }}>
          {value}%
        </span>
      </div>
      <div className="bar">
        <span style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}
