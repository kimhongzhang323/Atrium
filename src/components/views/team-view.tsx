import { DeptTag } from "@/components/ui/dept-tag";
import { Pill } from "@/components/ui/pill";

import type { listMembers } from "@/server/queries/org";

type Member = Awaited<ReturnType<typeof listMembers>>[number];

const ROLE_LABEL: Record<Member["role"], string> = {
  director: "Director",
  vice_director: "Vice Director",
  secretary: "Secretary",
  treasurer: "Treasurer",
  dept_head: "Dept Head",
  protocol: "Protocol",
  committee: "Committee",
};

export function TeamView({ members }: { members: Member[] }) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">TEAM</div>
          <h1 className="view-title">Team directory</h1>
          <p className="view-subtitle">{members.length} members</p>
        </div>
      </div>

      <div className="grid grid-3">
        {members.map((m) => (
          <div className="card" key={m.id}>
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="user-avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
                {m.initials || "?"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name || m.email}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{m.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <Pill tone="neutral">{ROLE_LABEL[m.role]}</Pill>
                  {m.dept && <DeptTag id={m.dept} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
