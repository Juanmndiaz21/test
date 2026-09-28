# 006 — Hardware-Accelerated Motion Transforms

- **Status**: DONE
- **Commit**: 00c2c16
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 4 files (`components/Cart.jsx`, `app/(public)/[locale]/login/page.js`, `app/(public)/[locale]/reset-password/page.js`, `app/(public)/[locale]/track/page.js`)

## Problem

In several components across the application, Framer Motion shorthand properties (`scale: 0.98`, `y: 8`, `scale: 1`, `y: 0`) are passed to `initial`, `animate`, and `exit`. Motion executes these via JavaScript `requestAnimationFrame` on the browser main thread instead of offloading them to GPU layers via composite transforms. Under heavy page loading or background network requests, this can cause frame drops.

```jsx
/* app/(public)/[locale]/login/page.js:121-122 — current */
initial={{ opacity: 0, scale: 0.98, y: 8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}

/* components/Cart.jsx:43-47 — current */
initial={{ opacity: 0, scale: 0.98 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
```

## Target

Replace shorthand `scale` and `y` properties with the complete CSS `transform` string:

```jsx
/* target in login/page.js */
initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(8px) scale(0.98)' }}
animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}

/* target in Cart.jsx */
initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'scale(0.98)' }}
animate={{ opacity: 1, transform: 'scale(1)' }}
exit={{
    opacity: 0,
    transform: shouldReduceMotion ? 'none' : 'scale(0.96)',
    transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
}}
```

## Repo conventions to follow

- Exemplar: `components/LandingCatalog.jsx:15-22` and `components/DeleteGameButton.jsx:67-69`:
  `initial={{ opacity: 0, transform: 'scale(0.96)' }}`

## Steps

1. In `components/Cart.jsx:43-49`, update `initial`, `animate`, and `exit` to use `transform: "scale(...)"`.
2. In `app/(public)/[locale]/login/page.js:121-122, 165-166`, update form containers to use `transform: "translateY(...) scale(...)"`.
3. In `app/(public)/[locale]/reset-password/page.js:81-82`, update form container to use `transform: "translateY(...) scale(...)"`.
4. In `app/(public)/[locale]/track/page.js:135-136`, update order tracker card to use `transform: "translateY(...) scale(...)"`.

## Boundaries

- Do NOT alter form fields, actions, inputs, or validation.
- Do NOT change animation timings or layout structures.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**:
  - Visit `/login` and `/track`: card animations enter smoothly on initial render without jitter.
- **Done when**: `git grep "scale:" components/Cart.jsx` and related form files return 0 occurrences.
