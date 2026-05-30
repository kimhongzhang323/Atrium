"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { moveSponsorStage } from "@/server/actions/sponsors";

const STAGES = ["prospect", "contacted", "proposal", "committed", "declined"] as const;
type Stage = (typeof STAGES)[number];

const LABEL: Record<Stage, string> = {
  prospect: "Prospect",
  contacted: "Contacted",
  proposal: "Proposal",
  committed: "Committed",
  declined: "Declined",
};

export function SponsorStageSelect({ sponsorId, stage }: { sponsorId: string; stage: Stage }) {
  const router = useRouter();
  const [value, setValue] = useState<Stage>(stage);
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Stage;
    const prev = value;
    setValue(next);
    startTransition(async () => {
      const res = await moveSponsorStage({ sponsorId, stage: next });
      if (res.ok) router.refresh();
      else setValue(prev);
    });
  }

  return (
    <select
      aria-label="Change sponsor stage"
      value={value}
      onChange={onChange}
      disabled={pending}
      className="border border-[--border] rounded px-2 py-1 bg-[--bg-elev] text-xs"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {LABEL[s]}
        </option>
      ))}
    </select>
  );
}
