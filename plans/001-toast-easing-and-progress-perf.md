# 001 — Toast Easing and Progress Bar Performance

- **Status**: DONE
- **Commit**: 00c2c16
- **Severity**: HIGH
- **Category**: Easing & duration / Performance
- **Estimated scope**: 2 files (`app/globals.css`, `components/ToastViewport.jsx`)

## Problem

1. In `app/globals.css:223`, `.animate-toast-out` uses `cubic-bezier(0.4, 0, 1, 1)` which is an `ease-in` curve. In UI design engineering, `ease-in` delays the initial motion—the exact moment the user expects instant feedback when dismissing a notification, making dismissal feel sluggish.
2. In `app/globals.css:226-233`, `@keyframes toast-life` animates `width: 100% -> 0%`. Animating layout width over 5000ms forces browser reflow and layout recalculation on every single animation frame off the GPU.

```css
/* app/globals.css:222-233 — current */
.animate-toast-out {
  animation: toast-out 0.2s cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes toast-life {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
```

## Target

1. Use the existing `--ease-out` token (`cubic-bezier(0.23, 1, 0.32, 1)`) for `.animate-toast-out` so toast dismissal starts immediately and decelerates naturally.
2. Animate `transform: scaleX(1) -> scaleX(0)` with `transform-origin: left` instead of `width` on the progress bar, keeping all rendering hardware-accelerated on the compositor thread.

```css
/* target in app/globals.css */
.animate-toast-out {
  animation: toast-out 0.18s var(--ease-out) both;
}

@keyframes toast-life {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
```

```jsx
/* target in components/ToastViewport.jsx:140-148 */
<span
    className={`block h-full w-full origin-left ${typeConfig.progress}`}
    style={{
        animation: `toast-life ${duration}ms linear forwards`,
        animationPlayState: isHovered ? 'paused' : 'running',
    }}
    aria-hidden="true"
/>
```

## Repo conventions to follow

- Easing tokens live in `app/globals.css:10-14`:
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
- Use `origin-left` or `style={{ transformOrigin: 'left' }}` for directional scaling.

## Steps

1. In `app/globals.css:222-224`, change `.animate-toast-out` animation from `0.2s cubic-bezier(0.4, 0, 1, 1)` to `0.18s var(--ease-out) both`.
2. In `app/globals.css:226-233`, change `@keyframes toast-life` `from { width: 100%; } to { width: 0%; }` to `from { transform: scaleX(1); } to { transform: scaleX(0); }`.
3. In `components/ToastViewport.jsx:140-148`, add `origin-left` to the progress bar `span` class list so `scaleX` anchors to the left edge.

## Boundaries

- Do NOT touch `useToastStore.js` or toast dispatch logic.
- Do NOT alter colors, badges, or iconography in `ToastViewport.jsx`.
- Do NOT add external dependencies.

## Verification

- **Mechanical**: Run `npm run build` to confirm zero syntax errors.
- **Feel check**:
  - Trigger a toast notification (e.g. adding a product to cart or clearing cart).
  - Click the dismiss 'x' button or trigger manual dismiss: verify it leaves snappily with zero delay.
  - Open DevTools Performance / Rendering panel and check "Paint flashing": verify the progress bar shrinking does NOT flash full layout paints.
- **Done when**: `.animate-toast-out` uses `var(--ease-out)` and `toast-life` animates `scaleX`.
