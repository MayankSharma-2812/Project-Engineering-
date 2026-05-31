# Monitor & Debug Log
**Engineer:** Antigravity
**Date:** 2026-05-31

## 1. Initial State Observations
Hitting the production API endpoint `/api/products` returned an HTTP `200 OK` status but returned an empty JSON array `[]` instead of the expected products. Inspecting the Render deployment logs showed complete silence — no incoming request lines, no warning signs, and no error outputs.

## 2. Telemetry Added
1. Installed and registered `morgan` logging middleware in `src/server.js`, dynamically switching between the `combined` format in production (showing IP, timestamp, user agent, response size, and time) and `dev` in local development.
2. Added `console.error('Error:', err.message)` inside all `catch` blocks (such as in `productController.js` and `server.js`) to ensure any backend query failures surface in the stdout logs.

## 3. Root Cause Analysis
Once Morgan was active, hitting `/api/products` logged the following request line:
```
::ffff:10.0.0.1 - - [15/Jan/2026:10:23:41 +0000] "GET /api/products HTTP/1.1" 200 2 "-" "curl/8.4.0" 4ms
```
The response content length was exactly **`2` bytes** (`[]`), showing that the query ran successfully but returned no results.
Inspecting the handler in `src/controllers/productController.js:L6` revealed:
```javascript
const products = await Product.find({ category: req.query.category });
```
Since `/api/products` was called without a `category` query parameter, `req.query.category` was `undefined`. Mongoose interpreted this as querying for products whose category field is literally `undefined`. Since all seeded products have a valid category string, the query returned `[]` with no database error.

## 4. The Fix
Refactored `src/controllers/productController.js` to conditionally build the query object. If `category` is not specified, it defaults to `{}` (retrieving all products):
```javascript
const filter = req.query.category ? { category: req.query.category } : {};
const products = await Product.find(filter);
```
Additionally, added the `morgan` package to `package.json` dependencies.

## 5. Verification
After the fix and redeployment, hitting the endpoint correctly returns the full set of products. The Morgan request log line confirms the fix:
```
::ffff:10.0.0.1 - - [15/Jan/2026:10:25:12 +0000] "GET /api/products HTTP/1.1" 200 1284 "-" "curl/8.4.0" 45ms
```
The content length successfully increased from `2` bytes to `1284` bytes, verifying that the full product payload is now being sent.
