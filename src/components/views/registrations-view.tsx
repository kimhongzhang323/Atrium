import { Pill } from "@/components/ui/pill";

import { CheckInButton } from "./check-in-button";

import type { listRegistrations } from "@/server/queries/registrations";

type RegistrationRow = Awaited<ReturnType<typeof listRegistrations>>[number];

const STATUS_TONE = {
  registered: "info",
  waitlist: "warn",
  cancelled: "neutral",
  checked_in: "success",
} as const;

const STATUS_LABEL = {
  registered: "Registered",
  waitlist: "Waitlist",
  cancelled: "Cancelled",
  checked_in: "Checked in",
} as const;

export function RegistrationsView({ registrations }: { registrations: RegistrationRow[] }) {
  const checkedIn = registrations.filter((r) => r.status === "checked_in").length;

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">REGISTRATION</div>
          <h1 className="view-title">Registrations</h1>
          <p className="view-subtitle">
            {registrations.length} registered · {checkedIn} checked in
          </p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>No registrations yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body tight">
            {registrations.map((r) => (
              <div className="row-item" key={r.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{r.name}</div>
                  <div className="row-sub">
                    {r.email}
                    {r.event ? ` · ${r.event.code}` : ""}
                  </div>
                </div>
                <Pill tone={STATUS_TONE[r.status]} dot>
                  {STATUS_LABEL[r.status]}
                </Pill>
                <CheckInButton registrationId={r.id} checkedIn={r.status === "checked_in"} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
