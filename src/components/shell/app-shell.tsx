"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { AIRail } from "./ai-rail";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface Props {
  trail: ReadonlyArray<string>;
  children: React.ReactNode;
}

export function AppShell({ trail, children }: Props) {
  const railOpen = useAppStore((s) => s.railOpen);
  return (
    <div className={`app${railOpen ? "" : " rail-collapsed"}`}>
      <Sidebar />
      <main className="main">
        <Topbar trail={trail} />
        {children}
      </main>
      <AIRail />
    </div>
  );
}
