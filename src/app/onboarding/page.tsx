import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { getOrganization } from "@/server/queries/org";

const STEPS = [
  { href: "/profile", title: "Complete your profile", body: "Set your display name so teammates recognise you." },
  { href: "/events", title: "Explore events", body: "See active conferences, sprints, and workshops." },
  { href: "/org", title: "Review your committee", body: "Departments, roles, and members at a glance." },
  { href: "/", title: "Open the dashboard", body: "Your daily command center with AI insights." },
];

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const org = await getOrganization();

  return (
    <div style={{ height: "100vh", overflow: "auto", background: "var(--bg)" }}>
      <div className="view view-narrow">
        <div className="view-header">
          <div>
            <div className="eyebrow">WELCOME</div>
            <h1 className="view-title">You&apos;re in{org ? `, ${org.name}` : ""}.</h1>
            <p className="view-subtitle">
              Your account is set up. Here&apos;s how to get going.
            </p>
          </div>
        </div>

        <div className="col">
          {STEPS.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="card-body"
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <span
                  className="user-avatar"
                  style={{ width: 32, height: 32, fontSize: 13 }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{s.body}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
