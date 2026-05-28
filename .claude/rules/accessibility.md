# Accessibility rules

## Keyboard

- Every interactive element must be reachable by `Tab` and operable by `Enter`/`Space`.
- Modals trap focus and close on `Escape`.
- Sidebar nav items are real `<a>` or `<button>` — never `<div onClick>`.

## ARIA

- Status pills use `role="status"` only when announcing live updates.
- Form fields: `<label htmlFor>` paired with `id`. Error messages linked via `aria-describedby`.
- Icon-only buttons require `aria-label` (e.g., `<button aria-label="Toggle AI rail">`).

## Focus

- Visible focus ring on all focusable elements. Don't `outline: none` without a replacement.
- After a modal closes, focus returns to the trigger.

## Color contrast

- Body text vs background: meet WCAG AA (4.5:1).
- Dark mode tokens are tuned for this — if you introduce a new color, verify both modes.

## Motion

- Respect `prefers-reduced-motion` for the lucky draw reel and any non-essential animation.
