# JobScan AI — Production Guardrails

## Phase 1: Failures Observed

### Failure 1 — Unlimited Input Length
*   **Observed:** Posted a 5000-character input to `/api/analyze` and the server responded with a successful `200 OK` status and returned the mocked analysis payload.
*   **AI service called:** YES — the `[AI_USAGE]` token usage log line was printed in the terminal logs:
    `[AI_USAGE] {"timestamp":"2026-06-01T14:41:23.395Z","userId":"user-123","model":"openai/gpt-4o-mini","promptTokens":100,"completionTokens":50,"totalTokens":150,"endpoint":"analyze_job_description"}`

### Failure 2 — Indefinite Hang
*   **Observed:** Added a 60-second delay before the `fetch` call and triggered the endpoint. The connection hung open until curl terminated the command due to timing out.
*   **Duration:** 5.01 seconds before curl timed out with:
    `curl: (28) Operation timed out after 5011 milliseconds with 0 bytes received`

### Failure 3 — Server Crash on LLM Error
*   **Observed:** Changed the API key to an invalid key (`mock-key`) causing OpenRouter to return a `401 Unauthorized` response. Since `data.choices` was undefined, accessing `data.choices[0]` threw a TypeError.
*   **TypeError message:**
    ```
    TypeError: Cannot read properties of undefined (reading '0')
        at analyzeJobDescription (file:///C:/Users/mayan/Project-Engineering-/Milestone%2009/Build%20the%20Guardrails/src/services/aiService.js:59:31)
    ```
*   **Server state after crash:** DOWN. Subsequent requests to `GET /health` failed with `Connection refused`.

---

## Guardrail 1 — Input Length Validation

**What was added:**
Added input length validation checks in `src/controllers/analyzeController.js` before executing any calls to `aiService.js`.
- If the text is empty or only contains whitespace, it returns `400 Bad Request` with:
  `{ "error": "input_required", "message": "Job description text is required." }`
- If the text length exceeds 3000 characters, it rejects the request immediately with `400 Bad Request` and:
  `{ "error": "input_too_long", "limit": 3000, "received": text.length }`
The AI service is never called, saving computing and financial resources.

**What it protects against:**
Protects against unbounded financial costs and API rate-limit exhaustion due to users pasting massive amounts of spam or scraping data via the endpoint. A 50,000-character input can inflate token usage by 10x-40x per API call.

**Production incident it prevents:**
Prevents a malicious script or loop pasting huge volumes of text (like entire company manuals) into the analyzer, draining the OpenRouter balance and triggering high cloud costs before any billing alerts are fired.

---

## Guardrail 2 — Request Timeout

**What was added:**
Implemented an `AbortController` in `src/services/aiService.js` to enforce a timeout of 15 seconds on the fetch request.
- The `controller.signal` is passed into the `fetch` call.
- A `setTimeout` of 15,000ms is set to trigger `controller.abort()`.
- The timeout timer is cleared using `clearTimeout()` in both the success and the catch blocks to prevent lingering timeouts.
- When an `AbortError` is caught, the service logs `[AI_TIMEOUT]` to the console and returns `{ success: false, fallback: true, message: 'Analysis unavailable. Please try again shortly.' }`.

**What it protects against:**
Protects against the server connection pool becoming exhausted and the Node.js event loop slowing down when the LLM provider experiences latency spikes, cold-start delays, or queues requests indefinitely.

**Production incident it prevents:**
Prevents an upstream provider slowdown where multiple requests are left hanging for over 45 seconds, hogging Express connection slots, and causing the entire service to become unresponsive to other users.

---

## Guardrail 3 — LLM Failure Handling

**What was added:**
Wrapped the entire `fetch` call, JSON parsing, and response processing in a `try/catch` block within `src/services/aiService.js`.
- Any non-AbortError failure (e.g. network failure, malformed JSON response, or error status code returned by OpenRouter) will be caught cleanly.
- The error is logged as `[AI_ERROR]` in the terminal.
- Returns the fallback object: `{ success: false, fallback: true, message: 'Analysis unavailable. Please try again shortly.' }`.
- The controller detects `result.fallback === true` and returns a standard `503 Service Unavailable` response to the user. The Node.js process never crashes.

**What it protects against:**
Protects against unhandled exceptions and crashes caused by upstream API errors (outages, quota limits, incorrect API keys, or malformed JSON payloads).

**Production incident it prevents:**
Prevents a 2 AM OpenRouter outage or quota exhaustion from crashing the main Express application process, which would cause an extended downtime until the on-call engineer restarts the server.
