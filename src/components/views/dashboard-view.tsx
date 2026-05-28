import { APPROVALS, DEPTS, EVENTS, TASKS, TODAY } from "@/lib/data";

import { DeptTag } from "@/components/ui/dept-tag";
import { Icon } from "@/components/ui/icons";
import { KPI } from "@/components/ui/kpi";
import { Pill } from "@/components/ui/pill";

const ev27 = EVENTS.find((e) => e.id === "mytech-2027")!;

function fmtMoney(n: number, cur = "RM") {
  return `${cur} ${n.toLocaleString("en-MY")}`;
}

export function DashboardView() {
  const pendingApprovals = APPROVALS.filter((a) => !a.final).length;
  const sponsorPct = Math.round((ev27.sponsorSecured / ev27.sponsorTarget) * 100);
  const regPct = Math.round((ev27.registrations.current / ev27.registrations.target) * 100);

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">{TODAY} · DIRECTOR VIEW</div>
          <h1 className="view-title">Good morning, Aisyah.</h1>
          <p className="view-subtitle">
            MYTECH 2027 is <strong style={{ color: "var(--text)" }}>{ev27.daysLeft} days</strong> away.
            Here's what needs you today.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn"><Icon.filter size={12} /> Filter</button>
          <button className="btn primary"><Icon.plus size={12} /> New event</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <KPI
          label="Sponsor secured"
          value={fmtMoney(ev27.sponsorSecured)}
          delta={`${sponsorPct}% of target`}
          deltaDir={sponsorPct >= 65 ? "up" : "down"}
          spark={[12, 14, 16, 18, 18, 18, 18, 18.5]}
        />
        <KPI
          label="Budget committed"
          value={fmtMoney(ev27.budget.committed)}
          delta={`${Math.round((ev27.budget.committed / ev27.budget.total) * 100)}% of ${fmtMoney(ev27.budget.total)}`}
          spark={[8, 14, 22, 30, 34, 38, 41, 42.5]}
        />
        <KPI
          label="Registrations"
          value={ev27.registrations.current.toLocaleString()}
          delta={`${regPct}% of ${ev27.registrations.target.toLocaleString()}`}
          deltaDir="up"
          spark={[10, 40, 90, 150, 210, 280, 340, 412]}
        />
        <KPI
          label="Days to event"
          value={String(ev27.daysLeft)}
          delta={`3-day event · ${ev27.venue.split(",")[0]}`}
          spark={[140, 130, 120, 110, 105, 100, 96, 92]}
          sparkColor="var(--warn)"
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Current event · {ev27.name}</h3>
              <p className="card-subtitle">Progress across all six departments</p>
            </div>
            <button className="btn ghost">Open <Icon.arrow size={12} /></button>
          </div>
          <div className="card-body">
            {DEPTS.map((d) => {
              const deptTasks = TASKS.filter((t) => t.dept === d.id);
              const done = deptTasks.filter((t) => t.status === "Done").length;
              const pct = deptTasks.length ? Math.round((done / deptTasks.length) * 100) : 0;
              return (
                <div key={d.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <DeptTag id={d.id} />
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {done} / {deptTasks.length} tasks
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, width: 36, textAlign: "right" }}>
                      {pct}%
                    </div>
                  </div>
                  <div className="bar"><span style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Needs your attention</h3>
              <Pill tone="warn" dot>{pendingApprovals + 2} items</Pill>
            </div>
            <div className="card-body tight">
              <AttentionRow tone="danger" title="Brand Toolkit approval" sub="Blocking all PUB posts · waiting 6 days" />
              <AttentionRow tone="warn" title="Maybank MOU draft" sub="Legal review · due Dec 15" />
              <AttentionRow tone="info" title="Volunteer recruitment kickoff" sub="40 needed · 0 posted" />
              <AttentionRow tone="info" title="MDEC grant deadline approaching" sub="Application closes Jan 10" />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Activity</h3>
            </div>
            <div className="card-body tight">
              <ActivityRow init="NI" name="Nurul Izzati" verb="signed Maybank Platinum" detail="RM 25,000" time="2h" />
              <ActivityRow init="DP" name="Daniyal Putra" verb="pushed website MVP" detail="staging.mytech2027.um.edu.my" time="4h" />
              <ActivityRow init="LM" name="Lee Sze Min" verb="uploaded final logo" detail="MYTECH27_logo_v4.zip" time="6h" />
              <ActivityRow init="RK" name="Rajesh Kumar" verb="updated floor plan" detail="Atrium · v2" time="1d" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttentionRow({ tone, title, sub }: { tone: "danger" | "warn" | "info"; title: string; sub: string }) {
  const colorVar = tone === "danger" ? "var(--danger)" : tone === "warn" ? "var(--warn)" : "var(--info)";
  return (
    <div className="row-item">
      <span className="dot-large" style={{ color: colorVar }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row-title">{title}</div>
        <div className="row-sub">{sub}</div>
      </div>
    </div>
  );
}

function ActivityRow({ init, name, verb, detail, time }: {
  init: string; name: string; verb: string; detail: string; time: string;
}) {
  return (
    <div className="row-item">
      <div className="user-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{init}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row-title">
          <strong>{name}</strong>{" "}
          <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>{verb}</span>
        </div>
        <div className="row-sub">{detail}</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{time}</div>
    </div>
  );
}
