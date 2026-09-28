# 005 — Admin Modals Entrance Transitions

- **Status**: DONE
- **Commit**: 00c2c16
- **Severity**: MEDIUM
- **Category**: Physicality & Preventing Jarring Changes
- **Estimated scope**: 3 files (`components/EditGameButton.jsx`, `app/admin/orders/OrderDetailsModal.jsx`, `app/admin/categories/CategoryManager.jsx`)

## Problem

While `components/DeleteGameButton.jsx` features a polished `AnimatePresence` modal transition with backdrop fade and grounded `scale(0.96) -> scale(1)` container scaling, other admin modals (`EditGameButton.jsx:65-72`, `OrderDetailsModal.jsx:115-125`, and `CategoryManager.jsx:518-529`) teleport directly into the DOM with zero transition. When clicked, the dialog flashes instantly; on close, it disappears without exit feedback.

```jsx
/* components/EditGameButton.jsx:65-72 — current */
{open && (
    <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5"
        onClick={(event) => {
            if (event.target === event.currentTarget) close();
        }}
    >
        <div className="panel-surface rounded-2xl p-6 sm:p-7 ...">
```

## Target

Align all modals to the standard set by `components/DeleteGameButton.jsx`:
- Outer backdrop: `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}`
- Modal dialog: `initial={{ opacity: 0, transform: 'scale(0.96)' }} animate={{ opacity: 1, transform: 'scale(1)' }} exit={{ opacity: 0, transform: 'scale(0.96)' }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}`
- Wrapped in `<AnimatePresence>`.

```jsx
/* target in components/EditGameButton.jsx */
<AnimatePresence>
    {open && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5"
            onClick={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <motion.div
                initial={{ opacity: 0, transform: 'scale(0.96)' }}
                animate={{ opacity: 1, transform: 'scale(1)' }}
                exit={{ opacity: 0, transform: 'scale(0.96)' }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="panel-surface rounded-2xl p-6 sm:p-7 w-full max-w-lg ..."
                role="dialog"
                aria-modal="true"
            >
```

## Repo conventions to follow

- Exemplar: `components/DeleteGameButton.jsx:54-75`.
- Easing: `[0.23, 1, 0.32, 1]` with duration `0.2s`.
- Scale entrance: `scale(0.96)` to `scale(1)` (modals stay centered).

## Steps

1. In `components/EditGameButton.jsx`:
   - Import `motion` and `AnimatePresence` from `'motion/react'`.
   - Wrap `{open && ...}` in `<AnimatePresence>`.
   - Convert outer backdrop and inner dialog to `motion.div` matching the exemplar.
2. In `app/admin/orders/OrderDetailsModal.jsx`:
   - Wrap the portal content in `<AnimatePresence>`.
   - Animate outer backdrop and inner dialog container.
3. In `app/admin/categories/CategoryManager.jsx`:
   - Wrap the edit category modal in `<AnimatePresence>`.
   - Apply matching backdrop fade and container scale entrance.

## Boundaries

- Do NOT alter modal form inputs, save handlers, or validation logic.
- Keep `role="dialog"` and accessibility attributes intact.

## Verification

- **Mechanical**: `npm run build` exits 0.
- **Feel check**:
  - Open Category Editor in admin: dialog expands smoothly into view from 96% scale without teleporting.
  - Press Escape or click backdrop: dialog fades out cleanly.
- **Done when**: All admin modals animate in and out with smooth transitions matching `DeleteGameButton.jsx`.
