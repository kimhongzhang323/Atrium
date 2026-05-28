---
name: optimize-performance
description: Use when a page feels slow or LCP is poor. Walks through the Next.js 16 performance checklist for Atrium.
---

# Optimize performance

## Investigate

1. Open Network tab — measure TTFB, LCP image, total JS.
2. Run `pnpm build` and inspect the route summary. Note bundle size and prerender status.
3. Open the route in Vercel Speed Insights if deployed.

## Diagnose

- **Slow TTFB**: server work too heavy. Check for N+1 in Drizzle queries; add `with:` relations.
- **Slow LCP**: hero image not optimized. Use `next/image` with `priority`.
- **Large JS**: client component too high in the tree. Push `"use client"` boundaries down.
- **Repeated work**: opt into Cache Components with `"use cache"` + `cacheTag`. Invalidate with `updateTag`.

## Quick wins for Atrium

- Org chart, Gantt, doc viewer: dynamic-import these — they're large and rarely on first paint.
- Sidebar nav: it's static per role — wrap in `"use cache"` keyed by role.
- KPI sparklines: render server-side as SVG, not client-side canvas.
