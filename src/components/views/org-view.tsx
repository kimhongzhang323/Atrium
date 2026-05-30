import { DeptCreateForm } from "./dept-create-form";
import { InviteForm } from "./invite-form";
import { MemberControls } from "./member-controls";

import type { getOrganization, listDepartments, listMembers } from "@/server/queries/org";

type Org = NonNullable<Awaited<ReturnType<typeof getOrganization>>>;
type Dept = Awaited<ReturnType<typeof listDepartments>>[number];
type Member = Awaited<ReturnType<typeof listMembers>>[number];

export function OrgView({
  org,
  departments,
  members,
  currentUserId,
}: {
  org: Org;
  departments: Dept[];
  members: Member[];
  currentUserId: string;
}) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">ORGANIZATION</div>
          <h1 className="view-title">{org.name}</h1>
          <p className="view-subtitle">
            {org.slug} · {members.length} members · {departments.length} departments
          </p>
        </div>
        <InviteForm />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Departments</h3>
            <DeptCreateForm />
          </div>
          <div className="card-body tight">
            {departments.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                No departments yet.
              </p>
            ) : (
              departments.map((d) => (
                <div className="row-item" key={d.id}>
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 99,
                      background: d.color,
                      display: "inline-block",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-title">{d.name}</div>
                    <div className="row-sub">{d.code}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Members</h3>
          </div>
          <div className="card-body tight">
            {members.map((m) => (
              <div className="row-item" key={m.id}>
                <span className="user-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                  {m.initials || "?"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{m.name || m.email}</div>
                  <div className="row-sub">{m.email}</div>
                </div>
                <MemberControls
                  userId={m.id}
                  role={m.role}
                  dept={m.dept}
                  canRemove={m.id !== currentUserId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
