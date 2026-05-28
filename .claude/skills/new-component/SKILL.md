---
name: new-component
description: Use when creating a new UI component for Atrium. Enforces folder structure, naming, server-first defaults, and design-token usage.
---

# New component

## When to use this

The user asks to add a new component (KPI, modal, view, etc.).

## Steps

1. **Decide where it lives**:
   - Generic primitive (Button, Pill, Card) → `src/components/ui/`
   - App shell piece (Sidebar, Topbar, AIRail) → `src/components/shell/`
   - Page-specific composition → `src/components/views/<route>/`

2. **Decide Server vs Client**: see `.claude/rules/frontend.md`. Default to Server.

3. **File**: `kebab-case.tsx`. Export the component as a named export.

4. **Props**:
   ```tsx
   interface Props { ... }
   export function MyComponent({ ... }: Props) { ... }
   ```

5. **Styling**: Tailwind utilities + CSS variables from `globals.css`. No hardcoded colors.

6. **Verify**:
   - `pnpm typecheck` passes.
   - Component renders both light and dark mode.
   - Keyboard-navigable if interactive.
