# Movie Quote API - Baseline Observations

## 📋 Manual Testing Results

### Endpoint Testing with curl

#### GET /api/quotes/unpaginated
```bash
curl.exe -w "\nTime: %{time_total}s\nSize: %{size_download} bytes\n" -o NUL -s http://localhost:3001/api/quotes/unpaginated
```
**Observations**:
- Response size: 136567 bytes (~133.4 KB)
- Response time: ~113-130ms (including 100ms artificial delay)
- Memory usage: High - entire dataset loaded in memory
- No compression headers present

#### GET /api/quotes?page=1&limit=20
```bash
curl.exe -w "\nTime: %{time_total}s\nSize: %{size_download} bytes\n" -o NUL -s "http://localhost:3001/api/quotes?page=1&limit=20"
```
**Observations**:
- Response size: 2745 bytes (~2.7 KB)
- Response time: ~2.3-3.6ms
- Memory usage: Low - small slice of data
- Pagination metadata included

#### POST /api/favorites
```bash
curl.exe -X POST http://localhost:3001/api/favorites -H "Content-Type: application/json" -d '{\"quoteId\": 42}' -w "\nTime: %{time_total}s\n"
```
**Observations**:
- Response time: ~52ms (includes 50ms synchronous blocking operation)
- No input validation - accepts any quoteId
- Synchronous blocking affects event loop

## 🚨 Intentional Errors Discovered

1. **CORS Policy**: Too permissive (`origin: '*'`)
2. **Pagination Off-by-One**: Total count is off by 10 (returns `990` instead of `1000`)
3. **No Input Validation**: POST /favorites accepts any data
4. **Synchronous Blocking**: 50ms blocking loop in POST handler
5. **No Compression**: Large responses uncompressed
6. **Missing Error Handling**: No validation for invalid parameters

## 📊 Performance Comparison (Manual)
| Endpoint | Response Size | Response Time | Memory Impact |
|----------|---------------|----------------|----------------|
| Unpaginated | 136567 bytes | 113-130ms | High |
| Paginated | 2745 bytes | 2.3-3.6ms | Low |
| POST favorites | ~200 B | ~52ms | Medium (blocking) |

## 🎯 Load Test Expectations
- Unpaginated endpoint will show high memory usage and slower response times under load
- Paginated endpoint should maintain consistent performance
- POST endpoint will show blocking behavior under concurrency
- Error rates may increase due to intentional implementation issues
