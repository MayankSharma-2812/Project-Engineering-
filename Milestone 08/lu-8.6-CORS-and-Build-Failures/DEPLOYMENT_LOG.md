# DEPLOYMENT_LOG.md

> LinkShelf API deployment troubleshooting, CORS security, and static site build configuration log.

---

## 1. What Failed?

During deployment and initial test runs, three critical failures were observed:

1. **Browser CORS Rejection on Credentialed Request**:
   The browser console output logged:
   ```
   Access to fetch at 'https://linkshelf-api.onrender.com/api/auth/login' from origin 'https://linkshelf-frontend.onrender.com' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
   ```

2. **Incorrect API Base URL Resolution (undefined API requests)**:
   The network tab displayed failing network requests targeting:
   ```
   GET http://undefined/api/bookmarks net::ERR_NAME_NOT_RESOLVED
   ```

3. **Database Client Crash on Backend Startup**:
   Backend logs crashed with the following Prisma initialization error:
   ```
   PrismaClientInitializationError: Prisma Client has not been generated yet. Run "prisma generate" to generate it, then try importing it again.
   ```

---

## 2. Root Cause Analysis

| # | Issue Found | File(s) Affected | Why It Caused a Failure |
|---|---|---|---|
| 1 | CORS wildcard restriction | `src/index.js` | The API backend returned `origin: "*"` in CORS headers. However, because the frontend sent credentialed requests (`credentials: 'include'`), browsers strictly disallowed the wildcard origin for security reasons. |
| 2 | Missing build-time variables | `render.yaml` | The frontend is a static React application. Vite bakes variables into the bundle *at build-time*. Since `VITE_API_URL` was not supplied during the build command, it evaluated to `undefined` in the output bundle. |
| 3 | Missing Prisma generation step | `render.yaml` | The backend service build command only ran `npm install`. Without running `npx prisma generate`, the Prisma Client JavaScript code was never generated in the production container. |

---

## 3. Fixes Applied

### Fix 1 — CORS Configuration:
- Refactored `src/index.js` to replace `origin: "*"` with `origin: process.env.CORS_ORIGIN` and explicitly added `credentials: true`.
- Updated `validateEnv()` in `src/index.js` to fail-fast if `CORS_ORIGIN` is not defined at boot.
- Defined `CORS_ORIGIN` in `render.yaml` under `linkshelf-api` environment variables pointing to `https://linkshelf-frontend.onrender.com`.

### Fix 2 — Frontend Build Environment:
- Updated the `linkshelf-frontend` service in `render.yaml` to include `VITE_API_URL` in the environment variables, set to the public backend endpoint `https://linkshelf-api.onrender.com`. This ensures Vite bakes the correct base URL during the static build phase.

### Fix 3 — Build Command:
- Appended `&& npx prisma generate` to the `buildCommand` of `linkshelf-api` in `render.yaml` to compile the Prisma database client before startup.
- Declared the `linkshelf-db` PostgreSQL service in the databases block of `render.yaml` to automatically provision a database.

---

## 4. Verification

- **Preflight OPTIONS request**: The preflight CORS checks return HTTP 200 with headers:
  `Access-Control-Allow-Origin: https://linkshelf-frontend.onrender.com`
  `Access-Control-Allow-Credentials: true`
- **API call succeeds**: Authentication (`POST /api/auth/login`) and bookmark creations (`POST /api/bookmarks`) complete with HTTP 200/201 status and return valid JSON responses.
- **Render deploy log**: Render successfully compiles the Prisma Client and boots up the API service:
  ```
  🚀 LinkShelf API running on port 3000
  ```

---

## 5. Key Takeaways

1. **Credentialed Requests require Specified Origins**: The CORS standard strictly prohibits using the wildcard `*` wildcard origin when credentials (like authentication cookies or authorization headers) are transmitted. The origin must be explicitly and dynamically configured.
2. **Build-Time vs. Runtime Injections**: React/Vite frontends are compiled into static assets before runtime, which means variables must be injected *during the build phase* rather than after the container starts.
3. **Compile Dependencies in CI/CD**: Framework-specific compile/generation scripts (such as `prisma generate` or build commands) must be explicitly included in infrastructure build specifications to avoid missing module runtime errors.
