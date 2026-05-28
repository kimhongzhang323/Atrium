# Tailwind rules

We use **Tailwind v4**. Config lives in `src/app/globals.css` via `@theme`, not in a JS file.

## When to use utilities vs custom CSS

- **Utilities first** for layout, spacing, typography, color. `flex items-center gap-2 px-3 py-2 text-sm`.
- **Custom CSS classes** for stateful patterns reused 5+ times across files (`.card`, `.pill`, `.kpi`, `.btn`). These live in `globals.css` under the same names as the original design.
- **Arbitrary values** for one-off design-token-driven values: `bg-[--bg-elev]`, `text-[--text-secondary]`.

## Design tokens

All colors/spacing/radius come from CSS custom properties defined in `:root` and `.dark`. Don't hardcode hex. If you need a new token, add it to `globals.css` first.

```tsx
// Good
<div className="bg-[--bg-elev] border-[--border] text-[--text]">

// Bad
<div className="bg-white border-gray-200 text-gray-900">
```

## Dark mode

We use a `.dark` class on `<body>`, toggled by the Zustand `useAppStore`. Tokens flip automatically — components shouldn't need `dark:` variants except for special cases.
