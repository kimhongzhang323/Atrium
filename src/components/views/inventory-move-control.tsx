"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { recordInventoryMovement } from "@/server/actions/operations";

const INPUT = "border border-[--border] rounded px-2 py-1 bg-[--bg-elev] text-xs";

export function InventoryMoveControl({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function apply() {
    setError(null);
    const d = Number(delta);
    if (!Number.isInteger(d) || d === 0) return setError("Non-zero whole number");
    if (!reason.trim()) return setError("Reason required");

    startTransition(async () => {
      const res = await recordInventoryMovement({ itemId, delta: d, reason: reason.trim() });
      if (res.ok) {
        setDelta("");
        setReason("");
        router.refresh();
      } else {
        setError(res.error.message);
      }
    });
  }

  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <input
        aria-label="Quantity change"
        type="number"
        className={INPUT}
        style={{ width: 70 }}
        placeholder="±qty"
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
      />
      <input
        aria-label="Reason"
        className={INPUT}
        style={{ width: 130 }}
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button className="btn" disabled={pending} onClick={apply}>
        Apply
      </button>
      {error && (
        <span className="text-xs text-[--danger]" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
