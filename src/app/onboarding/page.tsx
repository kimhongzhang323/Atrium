import { StubView } from "@/components/views/stub-view";

export default function OnboardingPage() {
  return (
    <div style={{ height: "100vh", overflow: "auto", background: "var(--bg)" }}>
      <StubView
        title="Onboarding"
        subtitle="6-step welcome flow · SSO → profile → role → events → tools → done"
        source="onboarding.jsx + onboarding.css"
      />
    </div>
  );
}
