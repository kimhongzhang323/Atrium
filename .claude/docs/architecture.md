# Atrium architecture

## Routing map

| Route                      | Purpose                                                   |
| -------------------------- | --------------------------------------------------------- |
| `/`                        | Dashboard (Director home — KPIs, dept progress, attention) |
| `/events`                  | All events list                                            |
| `/events/[id]`             | Event detail (tabs: Overview, Tasks, Budget, Sponsors)    |
| `/tasks`                   | Kanban board                                              |
| `/timeline`                | Gantt with T-week scale                                   |
| `/org`                     | Interactive org chart (click node → person modal)         |
| `/team`                    | HR-style team directory + performance                     |
| `/sponsors`                | Sponsors CRM with pipeline stages                         |
| `/budget`                  | Budget by department                                      |
| `/invoices`                | Invoices + claims + fuel-claim calculator                 |
| `/approvals`               | Approvals inbox (faculty → HEP → central)                 |
| `/reports`                 | Reports + 4-quadrant SWOT                                 |
| `/files`                   | Files with role-locked folders, inline doc/sheet/PDF viewer |
| `/draw`                    | Lucky draw with animated reel                             |
| `/inventory`               | Inventory with custody chain                              |
| `/registration`            | Public registration view (Competition events)             |
| `/profile`                 | User profile + permissions matrix                         |
| `/onboarding`              | 6-step onboarding flow (standalone)                       |
| `/treasurer`               | Dedicated finance command center                          |
| `/secretary`               | Dedicated document control center                         |

## Data flow

```
┌─────────────┐    Server Action     ┌──────────────┐
│   Client    │ ───────────────────▶ │   Drizzle    │
│ Component   │                      │  + Postgres  │
│  (RHF/Zod)  │ ◀─── revalidate ──── │              │
└─────────────┘                      └──────────────┘
       │
       │ TanStack Query (live filters, optimistic updates only)
       ▼
   server route (rarely needed; prefer Server Actions)
```

## Permission flow

1. `auth()` in layouts/pages returns `Session | null`.
2. `getCurrentUserWithRole()` joins to `users` and `roles` table.
3. `hasPermission(role, "view:budget")` filters sidebar nav and gates pages.
4. **Every Server Action** re-checks with `requirePermission(user, perm)` — UI gating is not enforcement.

## Theming

CSS variables in `globals.css` under `:root` (light) and `.dark` (dark). Zustand `useAppStore.dark` toggles `<body class="dark">` via the `TweaksPanel`. No `dark:` Tailwind variants needed for theme-aware components.
