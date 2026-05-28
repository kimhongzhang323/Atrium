"use client";

import { ROLES } from "@/lib/roles";
import { USERS } from "@/lib/data";
import { useAppStore } from "@/lib/stores/app-store";

const ALL_PERMS = [
  "view:dashboard", "view:events", "view:tasks", "view:timeline",
  "view:org", "view:team", "view:sponsors", "view:budget",
  "view:invoices", "view:approvals", "view:reports", "view:files",
  "view:draw", "view:registration",
] as const;

export default function ProfilePage() {
  const { userId, setUserId, dark, toggleDark } = useAppStore();
  const user = USERS[userId] ?? USERS.aisyah!;
  const role = ROLES[user.role];

  return (
    <div className="view view-narrow">
      <div className="view-header">
        <div>
          <div className="eyebrow">PROFILE</div>
          <h1 className="view-title">{user.name}</h1>
          <p className="view-subtitle">{role.label} · {user.email}</p>
        </div>
        <button className="btn" onClick={toggleDark}>{dark ? "Light mode" : "Dark mode"}</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Sign in as · demo</h3></div>
          <div className="card-body" style={{ display: "grid", gap: 6 }}>
            {Object.values(USERS).map((u) => (
              <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 6, cursor: "pointer", background: u.id === userId ? "var(--bg-active)" : "transparent" }}>
                <input
                  type="radio"
                  name="role"
                  checked={u.id === userId}
                  onChange={() => setUserId(u.id)}
                />
                <span style={{ fontWeight: 500 }}>{u.name}</span>
                <span style={{ marginLeft: "auto", color: "var(--text-secondary)", fontSize: 12 }}>
                  {ROLES[u.role].label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Permissions matrix</h3></div>
          <div className="card-body" style={{ display: "grid", gap: 4 }}>
            {ALL_PERMS.map((p) => {
              const has = (role.permissions as readonly string[]).includes(p);
              return (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12.5 }}>
                  <code style={{ fontFamily: "var(--font-mono)" }}>{p}</code>
                  <span style={{ color: has ? "var(--success)" : "var(--text-tertiary)" }}>
                    {has ? "✓" : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
