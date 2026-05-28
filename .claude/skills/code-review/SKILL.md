---
name: code-review
description: Use before merging a feature branch. Runs through the Atrium-specific checklist.
---

# Code review checklist

## Stack rules
- [ ] No shadcn imports introduced.
- [ ] Components in `src/components/ui/` have no `"use client"` unless required.
- [ ] No `any` — uses `unknown` + narrowing.
- [ ] No hardcoded hex colors — uses CSS variables.

## Data
- [ ] Server Actions enforce `requirePermission(user, perm)` server-side, not just hide nav in UI.
- [ ] Zod schemas validate both client (RHF resolver) and server (action body).
- [ ] N+1 queries flagged — use Drizzle relations.

## UX
- [ ] Dark mode tested.
- [ ] Keyboard-only flow works.
- [ ] Focus returns to trigger after modal close.
- [ ] Loading state present for async UI.
- [ ] Empty state present for empty lists.

## Build
- [ ] `pnpm typecheck` clean.
- [ ] `pnpm lint` clean.
- [ ] `pnpm build` succeeds.
