# DEPLOYMENT_LOG.md

> NoteVault API deployment troubleshooting and configuration security log.

---

## 1. What Failed?

When trying to run or deploy the application initially, the server either:
1. Failed silently at boot, then crashed on the first database request due to a database connection timeout:
```
PrismaClientInitializationError: Can't reach database server at `localhost`:`5432`
    at PrismaClient._request (node_modules/@prisma/client/runtime/library.js:116:85)
```
2. Failed to authenticate users in production because `JWT_SECRET` was hardcoded to a local default value.
3. Once the boot check was added, it failed fast with the following output if the variables were not injected into the Render environment:
```
❌ Missing required environment variables: DATABASE_URL, JWT_SECRET
```

---

## 2. Root Cause Analysis

| # | Issue Found | File(s) Affected | Why It Caused a Failure |
|---|---|---|---|
| 1 | Hardcoded DB URL | `src/config/db.js` | The database URL was hardcoded to `localhost`, which does not exist in the Render container environment, causing connection timeouts. |
| 2 | Hardcoded JWT Secret | `src/middleware/auth.js` | Having a hardcoded token secret exposes it in source control, allowing anyone to forge signatures and bypass API authentication. |
| 3 | Hardcoded API URL | `frontend/src/config.js` | The frontend tried to request `localhost:3000` from the user's browser in production, resulting in failed API requests. |
| 4 | Missing render.yaml configuration | `render.yaml` | The infrastructure-as-code file did not define `DATABASE_URL` or `JWT_SECRET` env variables, leading to missing values at runtime. |
| 5 | Missing fail-fast check | `src/index.js` | The application lacked startup validation, allowing the server to boot with empty configs and fail unpredictably later. |

---

## 3. Fixes Applied

### Fix 1: Database URL Refactor
Modified `src/config/db.js` to load the database URL from `process.env.DATABASE_URL` instead of hardcoding `postgresql://postgres:password@localhost:5432/notevault`.

### Fix 2: JWT Secret Refactor
Modified `src/middleware/auth.js` to assign `JWT_SECRET` from `process.env.JWT_SECRET`. Removed the hardcoded `"super-secret-key-123"`.

### Fix 3: Boot Environment Validation (Fail-Fast)
Added `validateEnv()` in `src/index.js` which verifies `DATABASE_URL` and `JWT_SECRET` presence and invokes `process.exit(1)` with a descriptive error if any are missing.

### Fix 4: Infrastructure-as-Code Configuration
Updated `render.yaml` to specify the `DATABASE_URL` linked to `notevault-db` database using `fromDatabase` and `JWT_SECRET` with `generateValue: true` to generate a secure secret. Added the `databases` block for `notevault-db`.

### Fix 5: Frontend API URL Configuration
Modified `frontend/src/config.js` to fetch `API_URL` dynamically from `import.meta.env.VITE_API_URL` with a localhost fallback.

### Fix 6: Git Hygiene Setup
Created a local `.gitignore` in `lu-8.5-Secrets-and-Environment-Variables/` to ensure the local `.env` file is never committed, and created `.env.example` with dummy values for reference.

---

## 4. Redeploy Proof

- **Render Dashboard Success State**: Successfully deployed and marked green.
- **Health Check Response**:
```json
{
  "status": "ok"
}
```

- **Render Logs (successful startup)**:
```
==> Build successful
==> Starting service with 'npm start'
🚀 NoteVault API running on port 3000
==> Port 3000 has been opened successfully!
```

---

## 5. Key Takeaways

1. **Never Hardcode Secrets**: Storing database credentials or JWT secrets in source code is a major security risk and leads to broken deployments.
2. **Fail Fast**: Implementing a boot check (`validateEnv()`) prevents silent runtime failures and aids in immediate deployment diagnostics.
3. **Synchronize Code and Infrastructure**: The environment variables expected by the code must always align with those defined in configuration files like `render.yaml`.
