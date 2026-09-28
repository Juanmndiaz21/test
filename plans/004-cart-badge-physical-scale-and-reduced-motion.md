# 004 — Cart Badge Physical Scale and Reduced Motion

- **Status**: DONE
- **Commit**: 00c2c16
- **Severity**: MEDIUM
- **Category**: Physicality & Accessibility
- **Estimated scope**: 1 file (`components/CartLink.jsx`)

## Problem

In `components/CartLink.jsx:32-35`, the cart quantity badge enters and exits with `scale: 0.8`. For a tiny 16px circular badge in a fixed navbar, jumping from 0.8 is an exaggerated 20% pop that looks ungrounded and distracting. Furthermore, it uses the unaccelerated shorthand prop `scale` and completely lacks `useReducedMotion()`.

```jsx
/* components/CartLink.jsx:32-35 — current */
<motion.span
    key={displayCount}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#9d7cff] ..."
>
```

## Target

1. Grounded initial/exit scale: `scale(0.94)` with `opacity: 0`.
2. Full hardware-accelerated transform: `initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'scale(0.94)' }}`.
3. Respect `useReducedMotion()`.

```jsx
/* target */
<motion.span
    key={displayCount}
    initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'scale(0.94)' }}
    animate={{ opacity: 1, transform: 'scale(1)' }}
    exit={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'scale(0.94)' }}
    transition={{
        duration: shouldReduceMotion ? 0.1 : 0.18,
        ease: [0.23, 1, 0.32, 1],
    }}
    className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#9d7cff] ..."
>
```

## Repo conventions to follow

- `useReducedMotion` imported from `'motion/react'`.
- Easing: `[0.23, 1, 0.32, 1]`.

## Steps

1. In `components/CartLink.jsx`:
   - Import `useReducedMotion` from `'motion/react'`.
   - Call `const shouldReduceMotion = useReducedMotion();`.
   - Update `initial`, `animate`, `exit`, and `transition` props on `motion.span` to use `scale(0.94)` and hardware-accelerated `transform`.

## Boundaries

- Do NOT change the counter calculation or badge placement (`-top-1 -right-1`).
- Do NOT change font sizing or badge colors.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**:
  - Add an item to the cart: badge appears smoothly without jarring bounce.
  - Enable `prefers-reduced-motion` in Chrome DevTools: badge appears with clean opacity fade and zero motion.
- **Done when**: Cart badge animates from `scale(0.94)` via hardware-accelerated transform.
