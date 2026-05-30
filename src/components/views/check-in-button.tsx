"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { checkInAttendee } from "@/server/actions/operations";

export function CheckInButton({
  registrationId,
  checkedIn,
}: {
  registrationId: string;
  checkedIn: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (checkedIn) {
    return <span className="text-xs text-[--success]">Checked in</span>;
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button
        className="btn"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await checkInAttendee({ registrationId });
            if (res.ok) router.refresh();
            else setError(res.error.message);
          });
        }}
      >
        Check in
      </button>
      {error && (
        <span className="text-xs text-[--danger]" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
