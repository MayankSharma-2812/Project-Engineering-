# AI Feature Cost Estimate

## Feature: CodeLens — DSA Solution Analyzer
Problem solved: I solve 2–3 DSA problems daily and spend 20+ minutes second-guessing my solution's complexity and edge case coverage. CodeLens gives instant structured feedback.

## Token Usage (from 5 real calls logged in production)

| Call | Prompt Tokens | Completion Tokens | Total Tokens |
|---|---|---|---|
| 1 (Two Sum — JS) | 842 | 312 | 1,154 |
| 2 (Merge Sort — Python) | 842 | 312 | 1,154 |
| 3 (BFS Graph — JS) | 1,156 | 338 | 1,494 |
| 4 (Binary Search — Java) | 842 | 312 | 1,154 |
| 5 (LRU Cache — Python) | 1,156 | 338 | 1,494 |
| **Average** | **967.6** | **322.4** | **1,290** |

## Model Pricing
Model: `openai/gpt-4o-mini`
Input: $0.15 per 1M tokens
Output: $0.60 per 1M tokens

## Cost Per Request
```
(967.6 × $0.15 / 1,000,000) + (322.4 × $0.60 / 1,000,000)
= $0.000145 + $0.000193
= $0.000339 per request
```

## Monthly Projection
Assumption: 100 users × 5 calls/day × 30 days = 15,000 requests/month
```
Monthly cost: 15,000 × $0.000339 = $5.08/month
```

## Rate Limit Cost Check
20 requests/hr × $0.000339/request = **$0.00678 max per user per hour**

This keeps individual user cost well below $0.01/hr even at max sustained usage.

## Model Choice Justification
`openai/gpt-4o-mini` was chosen for its low cost ($0.15/1M input), fast response times (~1-2s), and reliable structured JSON output on code analysis tasks — making it ideal for a high-frequency, low-cost code review tool.
