# Code style

## Naming

- **Files**: `kebab-case.tsx` (`dashboard-view.tsx`), even for components.
- **Components**: `PascalCase` (`DashboardView`).
- **Hooks**: `useCamelCase` (`useTweaks`).
- **Server Actions**: verbs (`createEvent`, `approveInvoice`).
- **Zod schemas**: `entityActionSchema` (`eventCreateSchema`).

## Imports

Order, separated by blank lines:

1. Node / external packages
2. `@/` absolute imports (alphabetical)
3. Relative imports
4. Type-only imports (`import type { ... }`)

## Components

- One component per file (helpers in the same file are fine).
- Props type inline if used only here; export it (`export interface Props`) if reused.
- No default exports for components — `export function DashboardView()`. Default exports are for Next.js route files only (`page.tsx`, `layout.tsx`, etc.).

## No shadcn/ui

This project deliberately avoids shadcn. Reasons:

- Apple-style design demands very specific spacing, type, and motion that don't match Radix defaults.
- We already have a self-contained design token system (`globals.css`).
- Build size and prop API surface stay small.

Build primitives in `src/components/ui/` instead. Reference Radix patterns if needed for a11y, but don't pull in the library.

## Comments

Default: write no comments. Only add a comment when the **why** is non-obvious (workaround, hidden invariant, surprising constraint). Don't restate **what** the code does.
