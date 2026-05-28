# Frontend rules

## Server vs Client Components

- **Default = Server Component.** No directive at the top of the file.
- **Add `"use client"` ONLY when one of these is true:**
  - Uses `useState`, `useEffect`, `useReducer`, `useRef`, or any other hook.
  - Uses a Zustand store, React Hook Form, TanStack Query, or any client-only library.
  - Attaches an event handler (`onClick`, `onChange`, etc.).
- **Push client boundaries down the tree.** A page can be a Server Component that renders a small `"use client"` interactive island, rather than the whole page being client.

## Data fetching

- **Server Components**: `await db.query.events.findMany()` directly — no hooks, no `fetch` wrapping.
- **Server Actions**: mutations that update DB and revalidate. `"use server"` directive.
- **TanStack Query**: only for client-side interactive flows (live filtering, optimistic updates, infinite scroll). Wrap in a `QueryClientProvider` from `src/app/providers.tsx`.
- **Cache Components**: opt routes in to PPR with `"use cache"` and `cacheLife`/`cacheTag`. See `.claude/rules/performance.md`.

## State

- **URL state first** — searchParams, route params. Shareable, server-readable.
- **Server state** — Server Components or TanStack Query, never duplicated into Zustand.
- **Client UI state** — Zustand only for cross-component UI state (theme, rail open/closed, current user demo override).
- **Form state** — React Hook Form, never local `useState` for forms beyond 2 fields.

## Forms

- React Hook Form + Zod resolver.
- Schema lives next to the action it submits to (`src/server/actions/event.ts` defines both `createEventSchema` and `createEvent`).
- Both client and server validate against the same Zod schema.
