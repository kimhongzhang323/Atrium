# Agent Rules (Next.js / Atrium)

This file is auto-loaded by coding agents (Claude Code, Copilot, Codex) at the start of each session. Keep it short and link out for detail. The full rule set lives in `CLAUDE.md` and `.claude/rules/`.

## Project type

- Next.js 16+ App Router app, TypeScript, Tailwind v4, Drizzle + Postgres, Auth.js, TanStack Query, Zustand, RHF + Zod.

## Commands

```bash
pnpm install     # install
pnpm dev         # local dev (Turbopack)
pnpm build       # production build
pnpm typecheck   # tsc --noEmit
pnpm lint        # next lint
pnpm db:generate # generate Drizzle migrations
pnpm db:migrate  # apply migrations
```

## Hard rules

1. **No shadcn/ui.** Components are hand-rolled — `.claude/rules/code-style.md`.
2. **Server Components by default.** `"use client"` requires justification.
3. **No `any`.** Narrow `unknown` instead.
4. **Strict TS.** `noUncheckedIndexedAccess` is on — handle `T | undefined` from index access.
5. **Server Actions, not API routes**, except for webhooks/auth callbacks.
6. **Design tokens via CSS variables.** Don't hardcode hex.

## Before completion

- Run `pnpm typecheck` and `pnpm lint`.
- Verify the route actually renders — don't claim success without running it.
