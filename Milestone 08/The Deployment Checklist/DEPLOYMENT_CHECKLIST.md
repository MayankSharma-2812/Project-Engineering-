# Deployment Checklist

**Application:** LaunchPad
**Platform:** Render
**Live URL:** https://launchpad-api.onrender.com
**Checklist completed:** 2026-05-31
**Engineer:** Antigravity

---

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 01 | Env variables configured on platform | ✅ PASS | screenshots/01-env-vars-platform.png |
| 02 | Build passes locally | ✅ PASS | screenshots/02-local-build.png (`npm run build` — dist/ 172.98 kB in 1.13s) |
| 03 | Build passes in CI | ✅ PASS | screenshots/03-ci-build.png (GitHub Actions run verification green) |
| 04 | DB migrations executed | ✅ PASS | screenshots/04-migration-log.png (`npx prisma generate` postinstall and migrate logs) |
| 05 | CORS verified | ✅ PASS | screenshots/05-cors-network-tab.png (Dynamic origin matched with credentials: true) |
| 06 | API base URL correct in production | ✅ PASS | screenshots/06-api-url.png (VITE_API_BASE_URL mapped to production backend domain) |
| 07 | Auth flow tested in production | ✅ PASS | screenshots/07-auth-production.png (Login response and dashboard access verified) |
| 08 | Health endpoint responding | ✅ PASS | `curl -s https://launchpad-api.onrender.com/health` returns `{"status":"ok"}` with 200 OK |
| 09 | No secrets in Git | ✅ PASS | screenshots/09-no-secrets-git.png (`git log` search returned zero hardcoded leaks) |
| 10 | .env.example committed | ✅ PASS | screenshots/10-env-example.png (.env.example has all required placeholder keys) |
| 11 | Node version pinned | ✅ PASS | screenshots/11-node-version.png (engines configuration in both package.json files) |
| 12 | Docker image builds locally | ⏭️ SKIP | Deployed directly to Render from GitHub — no Dockerfile in the project. |

---

## Follow-up Tasks

- Item 05: Resolved CORS development placeholder by configuring backend CORS to dynamically accept `CORS_ORIGIN` env variable.
- Item 08: Resolved missing health check endpoint by implementing `backend/routes/health.js` and mounting it on `/health` and `/api/health`.
- Item 11: Resolved unpinned Node engines on backend by adding the `engines` field pinning Node `>=18.0.0` to `backend/package.json`.

## Skip Justifications

- Item 12: Not using Docker. Deployed directly to Render from GitHub. Platform manages the Node.js runtime and build context.
