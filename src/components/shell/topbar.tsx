"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { Icon } from "@/components/ui/icons";

interface Props {
  trail: ReadonlyArray<string>;
}

export function Topbar({ trail }: Props) {
  const { railOpen, setRailOpen } = useAppStore();
  return (
    <header className="topbar">
      <div className="topbar-trail">
        {trail.map((t, i) => (
          <span key={`${t}-${i}`}>
            {i === trail.length - 1 ? <strong>{t}</strong> : `${t} /`}
          </span>
        ))}
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <button
          className="icon-btn"
          aria-label={railOpen ? "Hide AI rail" : "Show AI rail"}
          onClick={() => setRailOpen(!railOpen)}
        >
          <Icon.sidebar size={14} />
        </button>
      </div>
    </header>
  );
}
