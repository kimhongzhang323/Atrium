"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { Icon } from "@/components/ui/icons";

export function AIRail() {
  const railOpen = useAppStore((s) => s.railOpen);
  if (!railOpen) return null;

  return (
    <aside className="rail">
      <div className="rail-header">
        <Icon.sparkle size={14} />
        <div className="rail-title">Atrium Intelligence</div>
      </div>
      <div className="rail-body">
        <Section title="RISKS">
          <Card title="Brand Toolkit blocking PUB">
            Approval has been waiting 6 days at Faculty stage. Without this, no publicity goes out and registration growth (+412 vs target 1,200) flatlines.
          </Card>
          <Card title="Sponsor concentration">
            Maybank alone covers 32% of secured. MYTECH 2026 had a similar single-sponsor exposure that caused a Q3 cashflow crunch.
          </Card>
        </Section>

        <Section title="OPPORTUNITIES">
          <Card title="Reuse MYTECH 2026 vendor list">
            7 of 12 vendors had zero issues last year. Pre-confirming saves ~3 weeks of LOGI procurement work.
          </Card>
          <Card title="MDEC grant runway">
            Application closes Jan 10. Last year&apos;s awardees averaged RM 18k. Drafted boilerplate ready in Files.
          </Card>
        </Section>

        <Section title="2026 → 2027">
          <Card title="At T-92, you're ahead on sponsorship">
            +14% vs MT26 at the same week. Registration is also tracking +9%.
          </Card>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rail-section">
      <div className="rail-section-title">{title}</div>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rail-card">
      <div className="rail-card-title">{title}</div>
      <div className="rail-card-body">{children}</div>
    </div>
  );
}
