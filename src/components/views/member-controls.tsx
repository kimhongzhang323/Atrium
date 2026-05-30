"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { assignDepartment, assignRole, removeMember } from "@/server/actions/org-admin";

import type { Result } from "@/lib/result";

const ROLES = [
  "director",
  "vice_director",
  "secretary",
  "treasurer",
  "dept_head",
  "protocol",
  "committee",
] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABEL: Record<Role, string> = {
  director: "Director",
  vice_director: "Vice Director",
  secretary: "Secretary",
  treasurer: "Treasurer",
  dept_head: "Dept Head",
  protocol: "Protocol",
  committee: "Committee",
};

const DEPTS = ["SPR", "PnP", "PUB", "LOGI", "MM", "TECH"] as const;
type Dept = (typeof DEPTS)[number];

const SELECT = "border border-[--border] rounded px-2 py-1 bg-[--bg-elev] text-xs";

export function MemberControls({
  userId,
  role,
  dept,
  canRemove,
}: {
  userId: string;
  role: Role;
  dept: Dept | null;
  canRemove: boolean;
}) {
  const router = useRouter();
  const [roleVal, setRoleVal] = useState<Role>(role);
  const [deptVal, setDeptVal] = useState<Dept | "">(dept ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<Result<unknown>>, rollback?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) router.refresh();
      else {
        setError(res.error.message);
        rollback?.();
      }
    });
  }

  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <select
        aria-label="Role"
        className={SELECT}
        value={roleVal}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Role;
          const prev = roleVal;
          setRoleVal(next);
          run(() => assignRole({ userId, role: next }), () => setRoleVal(prev));
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>

      <select
        aria-label="Department"
        className={SELECT}
        value={deptVal}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Dept | "";
          const prev = deptVal;
          setDeptVal(next);
          run(
            () => assignDepartment({ userId, dept: next === "" ? null : next }),
            () => setDeptVal(prev),
          );
        }}
      >
        <option value="">No dept</option>
        {DEPTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {canRemove && (
        <button
          className="btn ghost"
          disabled={pending}
          onClick={() => run(() => removeMember({ userId }))}
        >
          Remove
        </button>
      )}

      {error && (
        <span className="text-xs text-[--danger]" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
