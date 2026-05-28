# Performance rules

## Rendering

- **Server Components by default** — keep JS shipped to the client small.
- **Partial Prerendering**: shell is static, dynamic islands stream in. Wrap dynamic data in `<Suspense>`.
- **Cache Components** (Next 16): for routes with mixed static/dynamic content, opt in with `"use cache"` per component. Use `cacheLife("hours")` and `cacheTag("event-{id}")` for revalidation.

## Data

- One DB round-trip per page when possible — use `db.query.X.findMany({ with: { related: true } })` instead of N+1.
- TanStack Query: set `staleTime` (default 0 wastes refetches). Most lists: `staleTime: 60_000`.
- Stream long lists; don't block the shell.

## Assets

- `next/image` for all images. No raw `<img>` except inline SVG.
- `next/font` for fonts; preload SF Pro substitute (Inter) with `display: swap`.
- SVGs as React components for icons (the `ICONS` map from the original prototype).

## Bundle

- No barrel re-exports from `@/components`. Import each component from its file directly so Turbopack can tree-shake.
- Dynamic-import the lucky draw reel, doc viewer, and Gantt — they're heavy and rarely on the critical path.
