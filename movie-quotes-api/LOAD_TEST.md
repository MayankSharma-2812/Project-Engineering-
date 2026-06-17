# Load Test Report: Movie Quote API

## Test Configuration

- **Tool**: Artillery (v2.0.32)
- **Total duration**: 80 seconds (30s warm up, 20s ramp up, 30s peak load)
- **Peak virtual users**: 50 new arrivals per second
- **Target URL**: http://localhost:3001
- **Recorded**: June 1, 2026

## Baseline: Single-User curl Results

- **GET /api/quotes/unpaginated**: 113.3 ms, 136,567 bytes
- **GET /api/quotes?page=1&limit=20**: 2.3 ms, 2,745 bytes
- **POST /api/favorites**: 52.0 ms

## Load Test Results: Unpaginated Endpoint

- **Median response time**: 108.9 ms
- **p95 response time**: 117.9 ms
- **Throughput**: 43 requests per second
- **Error rate**: 0%

## Load Test Results: Paginated Endpoint

- **Median response time**: 0 ms (average 0.4 ms)
- **p95 response time**: 1 ms
- **Throughput**: 31 requests per second (sustained 50 requests per second at peak)
- **Error rate**: 0%

## Load Test Results: POST /favorites

- **Median response time**: 2143.5 ms
- **p95 response time**: 6838.0 ms
- **Error rate**: 65.4% (1,406 failed requests out of 2,150 total)
- **Discovered errors**: `ECONNREFUSED` (791), `ERR_SOCKET_TIMEOUT` (615)

## Comparison and Analysis

The GET endpoints show a massive difference in efficiency and throughput. The unpaginated endpoint `/api/quotes/unpaginated` serialized and returned all 1,000 movie quotes (approx. 136KB of payload) on every single request. Although running on a fast local machine kept its p95 response time around 118 ms (mostly due to the 100ms artificial delay), the bandwidth consumed was a massive **293.6 MB** for 2,150 requests. This translates to high memory allocation and CPU overhead due to serializing 1,000 JSON objects for every request.

In contrast, the paginated endpoint `/api/quotes?page=1&limit=20` sliced the dataset down to only 20 quotes, delivering a compact 2.7KB payload. This led to a dramatic reduction in response time (median response time of 0 ms, p95 of 1 ms) and total downloaded bytes of only **5.9 MB** (a **98% reduction** in network bandwidth usage). By returning only the necessary subset of quotes, the paginated endpoint minimizes serialization time, network latency, and memory pressure.

The POST endpoint performance was completely disastrous. Under peak concurrency of 50 users/sec, the error rate spiked to 65.4%, and the p95 latency reached 6.8 seconds. This was caused by the 50ms synchronous blocking loop `while (Date.now() - start < 50)` inside the handler. Because Node.js is single-threaded, this loop blocks the event loop entirely. As requests stack up, they block subsequent requests from entering or completing. This quickly saturates the OS TCP backlog, causing connection refusals (`ECONNREFUSED`) and connection socket timeouts (`ERR_SOCKET_TIMEOUT`).

## What p95 Means and Why It Matters

The **p95 (95th percentile)** response time represents the latency experienced by the slowest 5% of users. For example, if a test has a p95 response time of 118 ms, it means 95% of all requests completed in 118 ms or faster, and the remaining 5% took longer than 118 ms.

While the median (p50) response time indicates typical performance, it hides worst-case scenarios and outliers. In modern web design, a poor p95 latency translates to a poor experience for 1 in 20 users. If your API has a median of 50ms but a p95 of 5,000ms, a significant number of your users are experiencing frustrating lags, which can lead to high page exit rates and loss of customer trust. In our POST favorites load test, the median was 2,143 ms, but the p95 was a staggering 6,838 ms, meaning 5% of the users waited nearly 7 seconds or more for their action to register (or fail entirely). This highlights why engineers must prioritize p95 and p99 metrics rather than averages.

## Discovered Issues

1. **CORS Policy (`server.js` line 24)**: The server uses an overly permissive origin policy `app.use(cors({ origin: '*' }))`. While it avoids development errors, this is a security risk in production.
2. **Pagination Off-by-One / Wrong Total Count (`server.js` line 47)**: The total quotes count is off by 10 (`total = movieQuotes.length - 10`). This corrupts frontend pagination logic.
3. **No Input Validation (`server.js` line 65)**: The POST `/api/favorites` endpoint doesn't validate `quoteId` (e.g., checking if it exists, is an integer, or fits inside the 1..1000 range).
4. **Event Loop Blocking (`server.js` line 73)**: The POST endpoint contains a 50ms synchronous blocking `while` loop that stalls the Node.js single-threaded event loop, leading to the 65.4% error rate and multi-second p95 latencies observed under load.
5. **No Network Compression**: The large unpaginated payload (~136KB) is sent uncompressed, increasing network delivery times.
