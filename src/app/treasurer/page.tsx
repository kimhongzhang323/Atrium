import { StubView } from "@/components/views/stub-view";

export default function TreasurerPage() {
  return (
    <div style={{ height: "100vh", overflow: "auto", background: "var(--bg)" }}>
      <StubView
        title="Treasurer · Finance Command Center"
        subtitle="Cash position · approval inbox · 12-week cashflow · AR aging · variance · P&L · ledger"
        source="treasurer.jsx + treasurer.css"
      />
    </div>
  );
}
