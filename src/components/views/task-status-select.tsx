"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateTaskStatus } from "@/server/actions/tasks";

const STATUSES = ["Backlog", "In Progress", "Review", "Done"] as const;
type Status = (typeof STATUSES)[number];

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: Status }) {
  const router = useRouter();
  const [value, setValue] = useState<Status>(status);
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Status;
    const prev = value;
    setValue(next);
    startTransition(async () => {
      const res = await updateTaskStatus({ id: taskId, status: next });
      if (res.ok) router.refresh();
      else setValue(prev);
    });
  }

  return (
    <select
      aria-label="Change task status"
      value={value}
      onChange={onChange}
      disabled={pending}
      className="border border-[--border] rounded px-2 py-1 bg-[--bg-elev] text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
