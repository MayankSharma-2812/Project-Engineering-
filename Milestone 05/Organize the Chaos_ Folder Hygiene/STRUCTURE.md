# Project Structure

## Current State
A flat src/ directory containing 30 files with no clear separation of features, components, or utilities.

- App.jsx
- Button.jsx
- CartItem.jsx
- CartSummary.jsx
- CheckoutModal.jsx
- Dashboard.jsx
- EmptyState.jsx
- ErrorMessage.jsx
- LoginForm.jsx
- LogoutButton.jsx
- Modal.jsx
- Navbar.jsx
- OrderCard.jsx
- OrdersList.jsx
- ProductCard.jsx
- ProductList.jsx
- Spinner.jsx
- apiClient.js
- cartService.js
- formatCurrency.js
- index.css
- loginService.js
- main.jsx
- ordersService.js
- productsService.js
- truncateText.js
- useCart.js
- useDebounce.js
- useLogin.js
- useProducts.js

## Time-to-find estimate
Based on the current flat structure, it would likely take a new engineer **30-45 minutes** to fully map out where the cart checkout logic lives, as it is scattered across `useCart.js`, `CartSummary.jsx`, `CheckoutModal.jsx`, and `cartService.js`, mixed in with all other application files.

## Final Folder Tree
```text
src/
├── features/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── loginService.js
│   │   ├── useLogin.js
│   │   └── LogoutButton.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   ├── CheckoutModal.jsx
│   │   ├── cartService.js
│   │   └── useCart.js
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductList.jsx
│   │   ├── productsService.js
│   │   └── useProducts.js
│   ├── orders/
│   │   ├── OrderCard.jsx
│   │   ├── OrdersList.jsx
│   │   └── ordersService.js
│   └── dashboard/
│       ├── Dashboard.jsx
│       └── Navbar.jsx
├── components/
│   ├── Button.jsx
│   ├── Modal.jsx
│   ├── Spinner.jsx
│   ├── EmptyState.jsx
│   └── ErrorMessage.jsx
├── hooks/
│   └── useDebounce.js
├── utils/
│   └── formatCurrency.js
├── services/
│   └── apiClient.js
├── App.jsx
├── main.jsx
└── index.css
```

## Folder Rules

### features/
One subfolder per product feature (auth, cart, products, orders, dashboard).
- **Rule**: If a component, hook, or service is used *exclusively* by one feature, it must live here.
- **Example**: `useCart.js` belongs in `features/cart/` because it is only relevant to cart logic.

### components/
Reusable UI components used by 2 or more features.
- **Rule**: If a component (e.g., `Button`, `Modal`) is imported by multiple features, it belongs here.
- **Example**: `Button.jsx` is used in Auth, Cart, and Products, so it is shared.

### hooks/
General-purpose custom React hooks that are feature-agnostic.
- **Rule**: Hooks that provide generic functionality like debouncing or local storage sync.
- **Example**: `useDebounce.js`.

### utils/
Pure utility functions with no React dependencies.
- **Rule**: Functions that take an input and return an output with no side effects.
- **Example**: `formatCurrency.js`.

### services/
Global API configurations and shared API clients.
- **Rule**: The base `apiClient` used by all feature services lives here.
- **Example**: `apiClient.js`.

## Decision Tree: Where Does This File Go?

1. **Is it used by exactly one feature?**
    - YES → `features/[feature-name]/`
    - NO → Continue to 2.
2. **Is it a UI component (renders JSX)?**
    - YES → `components/`
    - NO → Continue to 3.
3. **Is it a custom React hook (starts with use)?**
    - YES → `hooks/`
    - NO → Continue to 4.
4. **Is it a pure function with no React dependency?**
    - YES → `utils/`
    - NO → `services/`

## Adding a New Feature
1. Create a new directory in `src/features/[feature-name]/`.
2. Add the feature's components, hooks, and service files inside.
3. Use relative imports for sibling files (`./SiblingComponent`).
4. Use `../../components/`, `../../hooks/`, etc., for shared resources.
5. If a feature-specific component becomes needed by another feature, move it to `src/components/`.

## Before vs After
**Before**: All 30 files were in a flat `src/` directory. Finding the "Add to Cart" logic required scanning through a list of unrelated files like `OrdersList` and `LoginForm`.
**After**: The structure screams its intent. An engineer looking for cart logic can immediately go to `src/features/cart/` and find everything relevant in one place. For example, `CartItem.jsx` is now co-located with `cartService.js`, making it much easier to understand the relationship between the UI and the API.
