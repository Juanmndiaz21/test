# 003 — Replace transition-all in Configurators and Checkout

- **Status**: DONE
- **Commit**: 00c2c16
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 3 files (`components/GtaOrderConfigurator.jsx`, `components/Checkout.jsx`, `components/ProductDetail.jsx`)

## Problem

Across the order funnel, multiple interactive option pills, cards, and buttons use unconstrained `transition-all`. In CSS and GPU compositing, `transition-all` animates every computed style property (including padding, width, margin, and borders) whenever focus, hover, or active states change. This triggers style recalculation loops on every user click.

```jsx
/* components/GtaOrderConfigurator.jsx:267, 310, 351, 418 — current */
className="... font-bold transition-all cursor-pointer border ..."

/* components/Checkout.jsx:236, 260, 284 — current */
className="... border text-left transition-all relative ..."
```

## Target

Replace `transition-all` with explicit composited properties and standard duration:
`transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out`

```jsx
/* target */
className="... border text-left transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out relative ..."
```

## Repo conventions to follow

- Duration budget for option selection: 140ms–160ms.
- Easing: `ease-out` or `ease-[var(--ease-out)]`.
- Exemplar in `components/ProductList.jsx:162`:
  `transition-[color,background-color,border-color,transform] duration-140 ease-[var(--ease-out)]`

## Steps

1. In `components/GtaOrderConfigurator.jsx`:
   - Replace `transition-all` on platform selector buttons (line 267) with `transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out`.
   - Replace `transition-all` on version selector buttons (line 310) with `transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out`.
   - Replace `transition-all` on package selection cards (line 351) with `transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out`.
   - Replace `transition-all` on addon options (line 418) with `transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out`.
   - On the submit button (line 474), replace `transition-all duration-200 active:scale-[0.98]` with `transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]`.
2. In `components/Checkout.jsx`:
   - Replace `transition-all` on payment option cards (lines 236, 260, 284) with `transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out`.
   - On the checkout pay button (line 346), replace `transition-all transform active:scale-[0.98]` with `transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]`.
3. In `components/ProductDetail.jsx`:
   - Replace `transition-all` on platform pills (line 129) and add-to-cart button (line 157) with scoped transitions.

## Boundaries

- Do NOT change selected/active states or CSS color classes.
- Do NOT change state setters or business logic.

## Verification

- **Mechanical**: `npm run build` exits 0.
- **Feel check**:
  - Click between PlayStation, Xbox, and PC: transition is instant, crisp, and has zero layout jitter.
  - Select packages in the GTA configurator: cards respond with snappy 150ms border/color feedback.
- **Done when**: `git grep "transition-all" components/GtaOrderConfigurator.jsx components/Checkout.jsx` returns 0 occurrences.
