# Animation Improvement Plans

Audit conducted on commit `00c2c16` following Emil Kowalski's Design Engineering & Motion Audit framework.

## Plans Index

| # | Plan | Severity | Category | Status | Dependencies |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **001** | [Toast Easing and Progress Bar Performance](./001-toast-easing-and-progress-perf.md) | **HIGH** | Easing / Performance | DONE | None |
| **002** | [Mobile Menu Exit Transition and Hardware Acceleration](./002-mobile-menu-exit-and-hardware-accel.md) | **HIGH** | Interruptibility / Physicality | DONE | None |
| **003** | [Replace transition-all in Configurators and Checkout](./003-replace-transition-all-in-configurators.md) | **MEDIUM** | Performance | DONE | None |
| **004** | [Cart Badge Physical Scale and Reduced Motion](./004-cart-badge-physical-scale-and-reduced-motion.md) | **MEDIUM** | Physicality / Accessibility | DONE | None |
| **005** | [Admin Modals Entrance Transitions](./005-admin-modals-entrance-transitions.md) | **MEDIUM** | Preventing Jarring Changes | DONE | None |
| **006** | [Hardware-Accelerated Motion Transforms](./006-hardware-accelerated-motion-transforms.md) | **LOW** | Performance | DONE | None |

## Recommended Execution Order

1. **Plan 001** (Toast Easing & Progress): Fixes continuous off-GPU layout reflows and removes `ease-in` from global notifications.
2. **Plan 002** (Mobile Menu Exit): Fixes the abrupt 0ms jump when closing mobile navigation.
3. **Plan 003** (Replace `transition-all`): Eliminates unnecessary reflows in the main purchasing funnel (GTA configurator & checkout).
4. **Plan 004** (Cart Badge Scale): Calibrates navbar badge physics and respects reduced motion.
5. **Plan 005** (Admin Modals): Eliminates teleporting dialogs across admin views.
6. **Plan 006** (Hardware Transforms): Polishes form and container entrances across login, reset password, and track pages.
