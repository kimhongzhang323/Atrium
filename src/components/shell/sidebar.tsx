"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APPROVALS, EVENTS, INVOICES, CLAIMS, TASKS, USERS } from "@/lib/data";
import { hasPermission, ROLES } from "@/lib/roles";
import { useAppStore } from "@/lib/stores/app-store";
import type { Permission } from "@/lib/types";

import { Icon } from "@/components/ui/icons";

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof Icon;
  perm: Permission;
  badge?: number | string;
  external?: boolean;
}

interface Section {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const userId = useAppStore((s) => s.userId);
  const user = USERS[userId] ?? USERS.aisyah!;
  const role = ROLES[user.role];
  const can = (p: Permission) => hasPermission(role, p);

  const openTasks = TASKS.filter((t) => t.status !== "Done").length;
  const pendingApprovals = APPROVALS.filter((a) => !a.final).length;
  const pendingMoney =
    INVOICES.filter((i) => i.status === "Pending").length +
    CLAIMS.filter((c) => c.status === "Pending").length;

  const sections: Section[] = [
    {
      title: "WORKSPACE",
      items: [
        { href: "/", label: "Dashboard", icon: "dashboard", perm: "view:dashboard" },
        { href: "/events", label: "Events", icon: "events", perm: "view:events", badge: EVENTS.length },
        { href: "/tasks", label: "Tasks", icon: "tasks", perm: "view:tasks", badge: openTasks },
        { href: "/timeline", label: "Timeline", icon: "timeline", perm: "view:timeline" },
        { href: "/registration", label: "Registration", icon: "team", perm: "view:registration" },
        { href: "/approvals", label: "Approvals", icon: "approvals", perm: "view:approvals", badge: pendingApprovals },
      ],
    },
    {
      title: "PEOPLE & PARTNERS",
      items: [
        { href: "/org", label: "Org Chart", icon: "org", perm: "view:org" },
        { href: "/team", label: "Team", icon: "team", perm: "view:team" },
        { href: "/sponsors", label: "Sponsors", icon: "sponsors", perm: "view:sponsors" },
      ],
    },
    {
      title: "MONEY & ASSETS",
      items: [
        { href: "/budget", label: "Budget", icon: "budget", perm: "view:budget" },
        { href: "/invoices", label: "Invoices & Claims", icon: "invoices", perm: "view:invoices", badge: pendingMoney },
        { href: "/inventory", label: "Inventory", icon: "files", perm: "view:events" },
      ],
    },
    {
      title: "DEDICATED CONSOLES",
      items: [
        { href: "/treasurer", label: "Treasurer console", icon: "budget", perm: "view:budget", external: true },
        { href: "/secretary", label: "Secretary office", icon: "files", perm: "view:dashboard", external: true },
        { href: "/onboarding", label: "Onboarding", icon: "team", perm: "view:dashboard", external: true },
      ],
    },
    {
      title: "INSIGHTS",
      items: [
        { href: "/reports", label: "Reports & SWOT", icon: "reports", perm: "view:reports" },
        { href: "/files", label: "Files", icon: "files", perm: "view:files" },
        { href: "/draw", label: "Lucky Draw", icon: "draw", perm: "view:draw" },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">A</div>
        <div className="brand-name">Atrium</div>
        <div className="brand-org">FCSIT · UM</div>
      </div>
      <div className="sidebar-search">
        <div className="search-wrap">
          <span className="search-icon"><Icon.search size={12} /></span>
          <input className="search-input" placeholder="Search events, tasks, people…" />
        </div>
      </div>
      <nav className="sidebar-nav">
        {sections.map((s) => {
          const visible = s.items.filter((it) => can(it.perm));
          if (visible.length === 0) return null;
          return (
            <div key={s.title}>
              <div className="nav-section-title">{s.title}</div>
              {visible.map((it) => {
                const IconCmp = Icon[it.icon];
                const active = pathname === it.href;
                return (
                  <Link
                    key={it.href}
                    href={it.href as never}
                    className={`nav-item${active ? " active" : ""}`}
                  >
                    <span className="nav-icon"><IconCmp size={14} /></span>
                    <span>{it.label}</span>
                    {it.badge != null && <span className="nav-badge">{it.badge}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}

        {can("view:events") && (
          <>
            <div className="nav-section-title">EVENTS</div>
            {EVENTS.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}` as never}
                className="nav-item"
                style={{ paddingLeft: 26, fontSize: 12.5, color: "var(--text-secondary)" }}
              >
                <span>{e.code}</span>
                {e.isCompetition && <span className="nav-badge">comp</span>}
              </Link>
            ))}
          </>
        )}
      </nav>
      <Link href="/profile" className="sidebar-user">
        <div
          className="user-avatar"
          style={{ background: `linear-gradient(135deg, ${role.color}, #88888c)` }}
        >
          {user.initials}
        </div>
        <div className="user-meta" style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name">{user.name}</div>
          <div className="user-role">{role.label}</div>
        </div>
      </Link>
    </aside>
  );
}
