# CodeLens — AI-Powered DSA Solution Analyzer

## What Problem This Solves (Personal Statement)
I personally solve 2–3 DSA problems every day on LeetCode and HackerRank as part of placement preparation. After writing a solution, I spend 20+ minutes second-guessing whether my time/space complexity analysis is correct, whether I've missed critical edge cases, and whether a better approach exists. My AI feature solves this by analyzing my code against the problem statement and returning a structured review with complexity analysis, correctness assessment, missed edge cases, and one concrete optimization suggestion — in under 3 seconds.

## Live URL
Backend: https://codelens-backend-mayank.onrender.com
Frontend: *(local only — see Setup below)*

## Model Used and Why
Model: `openai/gpt-4o-mini`
Reason: Chosen for its low cost ($0.15/1M input, $0.60/1M output), fast response times (~1–2s), and reliable structured JSON output on code analysis tasks. At $0.000339/request, it keeps the monthly cost under $6 for 100 daily active users.

## Where the API Call Lives
The AI API call is in `backend/src/services/aiService.js` in the `callAI()` function.
The prompt logic is in `backend/src/utils/promptBuilder.js` in `buildPrompt()`.

## Rate Limit
20 requests per user per hour.
Reason: At $0.000339/request, this limits a single user's AI cost to $0.00678 per hour — well under $0.01/hr even at max sustained usage. For a typical user solving 2–3 problems/day, this allows 6–7 review iterations per problem.

## Running Costs
See [COST_ESTIMATE.md](./COST_ESTIMATE.md) for full breakdown.
Short version: **$5.08/month** at 100 users × 5 calls/day.

## API Endpoint

### `POST /api/review-solution`

**Headers:**
```
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Request Body:**
```json
{
  "problemStatement": "Given an array of integers...",
  "solution": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

**Supported Languages:** `javascript`, `python`, `java`, `cpp`, `c`, `typescript`, `go`, `rust`, `ruby`, `kotlin`, `swift`

**Response:**
```json
{
  "success": true,
  "result": {
    "timeComplexity": "O(n^2)",
    "spaceComplexity": "O(1)",
    "correctness": "likely_correct",
    "issues": [],
    "edgeCases": ["empty array", "single element", "duplicates"],
    "optimization": "Use a hash map for O(n) lookup instead of nested loops.",
    "confidence": "high"
  }
}
```

### `GET /health`
Returns `{"status": "ok", "timestamp": "..."}` — used for Render health checks.

## Six Constraints Checklist

| # | Constraint | Status |
|---|-----------|--------|
| 1 | API key in backend `.env` only | ✅ `grep -r "sk-or-" .` returns nothing |
| 2 | Prompt logic in `promptBuilder.js` | ✅ All prompt logic isolated |
| 3 | Token logging on every call | ✅ `[AI_USAGE]` JSON on every response |
| 4 | Per-user rate limiting | ✅ 20/hr via `req.user.id` |
| 5 | Input validation + fallback | ✅ 400 on bad input, 503 + fallback on LLM failure |
| 6 | Deployed to live URL | ✅ Render backend |

## Setup
```bash
# Backend
cd backend && npm install
cp .env.example .env  # Add OPENROUTER_API_KEY and JWT_SECRET
npm start

# Frontend
cd frontend && npm install
cp .env.example .env  # Set VITE_API_URL=http://localhost:3000
npm run dev
```

## Project Structure
```
├── backend/
│   ├── src/
│   │   ├── server.js                  ← Express + validateEnv + health route
│   │   ├── routes/
│   │   │   └── aiRoutes.js            ← auth → rateLimit → validate → controller
│   │   ├── controllers/
│   │   │   └── aiController.js        ← calls buildPrompt + aiService
│   │   ├── services/
│   │   │   └── aiService.js           ← fetch + AbortController + token logging
│   │   ├── utils/
│   │   │   └── promptBuilder.js       ← ALL prompt logic lives here
│   │   └── middleware/
│   │       ├── authMiddleware.js      ← JWT verification
│   │       ├── aiRateLimit.js         ← per-user rate limiting (20/hr)
│   │       └── validateInput.js       ← length + code content checks
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    ← Main React UI
│   │   ├── index.css                  ← Premium dark theme
│   │   ├── main.jsx                   ← Entry point
│   │   └── api/
│   │       └── client.js              ← Backend API client (no AI keys)
│   └── .env.example
├── COST_ESTIMATE.md                   ← Token usage + cost projections
└── README.md                          ← This file
```
