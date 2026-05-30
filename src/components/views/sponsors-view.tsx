import { SponsorCreateForm } from "./sponsor-create-form";
import { SponsorStageSelect } from "./sponsor-stage-select";

import type { listSponsors } from "@/server/queries/sponsors";

type SponsorRow = Awaited<ReturnType<typeof listSponsors>>[number];

const COLUMNS = [
  { stage: "prospect", label: "Prospect" },
  { stage: "contacted", label: "Contacted" },
  { stage: "proposal", label: "Proposal" },
  { stage: "committed", label: "Committed" },
  { stage: "declined", label: "Declined" },
] as const;

function fmtMoney(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

export function SponsorsView({ sponsors }: { sponsors: SponsorRow[] }) {
  const committed = sponsors
    .filter((s) => s.stage === "committed")
    .reduce((sum, s) => sum + s.amountSecured, 0);

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">SPONSORS</div>
          <h1 className="view-title">Sponsorship pipeline</h1>
          <p className="view-subtitle">
            {sponsors.length} sponsors · {fmtMoney(committed)} committed
          </p>
        </div>
        <SponsorCreateForm />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {COLUMNS.map(({ stage, label }) => {
          const items = sponsors.filter((s) => s.stage === stage);
          return (
            <div key={stage} className="col">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <h3 className="card-title">{label}</h3>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{items.length}</span>
              </div>

              {items.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>Empty.</p>
              ) : (
                items.map((s) => (
                  <div key={s.id} className="card">
                    <div
                      className="card-body"
                      style={{ display: "flex", flexDirection: "column", gap: 8 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0 }}>
                          {s.name}
                        </div>
                        {s.tier && (
                          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{s.tier}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {fmtMoney(s.amountSecured)} / {fmtMoney(s.amountTarget)}
                      </div>
                      <SponsorStageSelect sponsorId={s.id} stage={s.stage} />
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
