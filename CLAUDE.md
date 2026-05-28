# Atrium — Project Instructions

Atrium is an **event operations platform** for university committees (currently FCSIT/MYTECH). Apple macOS-inspired aesthetic: clean light UI, SF-style type, subtle color, with first-class dark mode.

## Stack

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Framework        | Next.js 16+ (App Router, Cache Components, Turbopack) |
| Language         | TypeScript (strict, `noUncheckedIndexedAccess`)    |
| Styling          | Tailwind CSS v4 + CSS variables (design tokens)    |
| UI Components    | **Hand-rolled** (no shadcn — see `.claude/rules/code-style.md`) |
| Data Fetching    | TanStack Query (client) + Server Components/Actions |
| Client State     | Zustand                                             |
| Forms            | React Hook Form + Zod                               |
| Auth             | Auth.js (next-auth v5)                              |
| Database / ORM   | Drizzle + Postgres (Neon/Supabase)                  |
| Backend          | Server Actions                                      |

## Folder layout

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Main authenticated app group
│   │   ├── layout.tsx      # Sidebar + Topbar + AI Rail shell
│   │   ├── page.tsx        # Dashboard (default)
│   │   ├── events/
│   │   ├── tasks/
│   │   ├── ...             # All workspace views
│   ├── onboarding/         # Dedicated 6-step welcome flow
│   ├── treasurer/          # Dedicated finance console
│   ├── secretary/          # Dedicated document control center
│   ├── api/                # Route handlers (auth, webhooks)
│   ├── layout.tsx          # Root layout (providers, fonts)
│   └── globals.css         # Design tokens + base styles
├── components/
│   ├── shell/              # Sidebar, Topbar, AIRail, TweaksPanel
│   ├── ui/                 # KPI, Pill, Card, DeptTag, Avatar, etc.
│   └── views/              # Per-route view components
├── lib/
│   ├── stores/             # Zustand stores
│   ├── data.ts             # Mock data (will be replaced by DB queries)
│   ├── roles.ts            # RBAC matrix
│   ├── types.ts
│   └── utils.ts
└── server/
    ├── db/                 # Drizzle schema + client
    ├── actions/            # Server Actions
    └── auth.ts             # Auth.js config
```

## Conventions

- **Server Components by default.** Add `"use client"` only when needed (event handlers, hooks, stores).
- **Design tokens live in `globals.css`** as CSS custom properties (`--bg`, `--text`, `--accent`, etc.). Components consume them via Tailwind arbitrary values or CSS classes.
- **Permissions are checked in two places**: in `app/(app)/layout.tsx` (UI nav filtering) and in every Server Action (server-side enforcement via `requirePermission(user, perm)`).
- **No `any`.** Use `unknown` and narrow.
- **One component per file**; co-locate types with the component when local.
- **Tailwind v4** — config lives in `globals.css` via `@theme`, not `tailwind.config.ts`.

## Topic rules

See `.claude/rules/` for more detail:

- `frontend.md` — React/Next patterns, Server vs Client Components
- `code-style.md` — naming, file structure, imports
- `tailwind.md` — utility patterns, when to break out custom CSS
- `accessibility.md` — keyboard nav, ARIA, focus management
- `performance.md` — caching, PPR, image/font optimization

## Domain primer

- **Events**: MYTECH conferences, code sprints, workshops. Each has a code (MT26, MT27), status (Planning/Live/Completed), budget, registrations, sponsor pipeline.
- **Departments** (6): SPR (Sponsorship), PnP (Program & Protocol), PUB (Publicity), LOGI (Logistics), MM (Multimedia), TECH (Tech).
- **Roles**: Director, Vice Director, Secretary, Treasurer, Dept Head, Protocol Team, Committee Member.
- **AI Rail**: A quiet right sidebar surfacing insights (risks, opportunities, timeline nudges, YoY comparisons). Not a chat — passive intelligence.
