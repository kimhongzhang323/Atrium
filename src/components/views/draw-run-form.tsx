"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Icon } from "@/components/ui/icons";
import { runDraw } from "@/server/actions/operations";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";

export function DrawRunForm({ events }: { events: { id: string; code: string }[] }) {
  const router = useRouter();
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [prizesText, setPrizesText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const prizes = prizesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!eventId) return setError("Select an event");
    if (prizes.length === 0) return setError("Enter at least one prize");

    startTransition(async () => {
      const res = await runDraw({ eventId, prizes });
      if (res.ok) {
        setPrizesText("");
        router.refresh();
      } else {
        setError(res.error.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 320 }}>
      <div className="card-header">
        <h3 className="card-title">Run a draw</h3>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label htmlFor="draw-event" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Event
        </label>
        <select
          id="draw-event"
          className={INPUT}
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.code}
            </option>
          ))}
        </select>

        <label htmlFor="draw-prizes" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Prizes (one per line)
        </label>
        <textarea
          id="draw-prizes"
          className={INPUT}
          rows={4}
          value={prizesText}
          onChange={(e) => setPrizesText(e.target.value)}
          placeholder={"Grand prize\nRunner up"}
        />

        {error && (
          <p className="text-sm text-[--danger]" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={pending || events.length === 0}>
          <Icon.sparkle size={12} /> {pending ? "Drawing…" : "Draw winners"}
        </button>
      </div>
    </form>
  );
}
