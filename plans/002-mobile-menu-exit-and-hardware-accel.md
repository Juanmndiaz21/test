# 002 — Mobile Menu Exit Transition and Hardware Acceleration

- **Status**: DONE
- **Commit**: 00c2c16
- **Severity**: HIGH
- **Category**: Interruptibility & Physicality
- **Estimated scope**: 1 file (`components/SiteHeader.jsx`)

## Problem

In `components/SiteHeader.jsx:110-140`, the mobile drawer is conditionally rendered with `{open && (<motion.div ...>)}` without an `<AnimatePresence>` parent. When the user taps a navigation link or clicks the toggle to close, the menu disappears abruptly in 0ms without transitioning. Furthermore, the inner link stagger uses unaccelerated `x:` shorthand instead of full `transform` strings.

```jsx
/* components/SiteHeader.jsx:110-116 — current */
{open && (
    <motion.div
        className="fixed inset-0 z-[80] bg-[#0d0914]/95 backdrop-blur-md pt-20 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
```

## Target

1. Wrap the conditional render in `<AnimatePresence>`.
2. Add an `exit={{ opacity: 0 }}` transition with duration `0.16s` and `ease: [0.23, 1, 0.32, 1]`.
3. Use hardware-accelerated `transform: "translateX(...)"` for link entrance animations, respecting `useReducedMotion()`.

```jsx
/* target in components/SiteHeader.jsx */
<AnimatePresence>
    {open && (
        <motion.div
            key="mobile-nav"
            className="fixed inset-0 z-[80] bg-[#0d0914]/95 backdrop-blur-md pt-20 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        >
```

## Repo conventions to follow

- `AnimatePresence` and `motion` imported from `'motion/react'`.
- `shouldReduceMotion` already checked in `SiteHeader.jsx`.
- Durations under 200ms for drawers/overlays.

## Steps

1. In `components/SiteHeader.jsx`, import `AnimatePresence` from `'motion/react'`.
2. Wrap `{open && (<motion.div key="mobile-nav" ...>)}` in `<AnimatePresence>`.
3. Add `exit={{ opacity: 0 }}` and `transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}` to the container `motion.div`.
4. Replace link stagger `initial={{ opacity: 0, x: ... }}` with `initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateX(-12px)' }}` and `animate={{ opacity: 1, transform: 'translateX(0)' }}`.

## Boundaries

- Do NOT change navigation links or URLs.
- Do NOT touch desktop navigation.
- Do NOT change keyboard accessibility (`Escape` listener).

## Verification

- **Mechanical**: `npm run build` succeeds without errors.
- **Feel check**:
  - Open mobile viewport in DevTools (<768px).
  - Open the mobile menu, then click the close button: verify it fades out smoothly over 160ms instead of popping away.
  - In DevTools Animations panel set speed to 10%: observe smooth opacity fade on exit.
- **Done when**: Closing mobile menu executes a graceful 160ms exit transition.
