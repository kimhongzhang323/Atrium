import { StubView } from "@/components/views/stub-view";

export default function SecretaryPage() {
  return (
    <div style={{ height: "100vh", overflow: "auto", background: "var(--bg)" }}>
      <StubView
        title="Secretary · Document Control Center"
        subtitle="Editable letterheads, minutes, MOUs, proposals, reports · master template editor"
        source="secretary.jsx + secretary.css"
      />
    </div>
  );
}
