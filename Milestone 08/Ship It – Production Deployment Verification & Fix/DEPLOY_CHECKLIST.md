# FullShip — Deployment Checklist

## Bug Found
- **Type**: CORS Configuration Bug (Backend)
- **Location**: `backend/src/server.js` (lines 11-16)
- **Before value**:
  ```javascript
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  ```
- **After value**:
  ```javascript
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }));
  ```
- **Fix confirmed by**: Browser preflight OPTIONS request returning 200 OK with `Access-Control-Allow-Origin: https://fullship-frontend.vercel.app` header.

## Checklist
- [x] Frontend is live — Proof: `https://fullship-frontend.vercel.app` loads and displays dashboard UI successfully.
- [x] Backend is live — Proof: `curl https://fullship-backend.onrender.com/health` returns `{"status":"ok"}`.
- [x] API call works end-to-end — Proof: Network tab shows `/api/items` successfully fetched and populated with status `200 OK`.
- [x] CI pipeline passes — Proof: GitHub Actions CI workflow green checklist.
- [x] Health check responds — Proof: `/health` responds with `200 OK`.

## Reflection
1. **What broke**:
   The backend server's CORS origin was hardcoded to `http://localhost:5173` instead of being configurable for production. This caused browser CORS policy rejections for all cross-origin requests originating from the deployed Vercel frontend URL, blocking API requests.

2. **How identified**:
   By opening the browser Developer Tools Developer Console and checking the Network tab. The console logged a CORS policy error blocking the fetch request to the backend domain, and the request to `/api/items` failed.

3. **Prevention**:
   Avoid hardcoding development URLs in production server configurations. Move all origin configurations to environment variables (`process.env.CORS_ORIGIN`), configure proper default fallbacks, and run end-to-end integration verifications on deployment staging environments before full release.
