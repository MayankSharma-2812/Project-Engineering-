# DevMarket Codebase Audit Report

## Audit Findings

| Metric | Count |
| :--- | :--- |
| `fetch()` calls | 12 |
| Hardcoded URLs (`https://fakestoreapi.com`) | 13 |
| `localStorage.getItem('auth_token')` usage | 5 |

## Root Architectural Problems

### 1. Hardcoded Base URL
The API base URL is scattered across every single page. If the backend moves to a new domain (e.g., `api.devmarket.io`), a developer would need to find and replace strings in at least 4 different files. This lacks a "Single Source of Truth."

### 2. Manual Token Injection
Authentication tokens are manually retrieved and attached to headers in every `POST`, `PUT`, or `DELETE` request. This is repetitive, error-prone, and violates the DRY (Don't Repeat Yourself) principle. If the authentication scheme changes (e.g., moving from `Bearer` to `Token` prefix), every file must be updated.

### 3. Inconsistent Error Handling
There is no unified strategy for handling API errors:
- **ProductsPage**: Fails silently for categories but shows a UI error for products.
- **CartPage**: Uses a generic `alert()` for deletion failures and doesn't check `res.ok` for initial loading.
- **ProfilePage**: Manually parses error strings for "401" codes to handle session expiration.

### 4. Scattered Fetch Patterns
The codebase uses a mix of `async/await` and `.then()` chains. This lack of standardization makes the code harder to read and increases the cognitive load for new developers joining the team.

## Maintainability Impact
At scale, this architecture is a "time bomb." Adding a new feature requires copy-pasting brittle fetching logic. Debugging network issues becomes difficult because there is no central place to log or intercept traffic.

---
**Live Deployed URL:** [Link to your deployment here]
