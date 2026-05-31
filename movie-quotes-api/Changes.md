# Movie Quote API - Baseline Observations

## 📋 Manual Testing Results

### Endpoint Testing with curl

#### GET /api/quotes/unpaginated
```bash
curl -w "@{time_total}\n" -o /dev/null -s http://localhost:3001/api/quotes/unpaginated
```
**Observations**:
- Response size: ~250-300 KB (all 1,000 quotes)
- Response time: ~150-200ms (including 100ms artificial delay)
- Memory usage: High - entire dataset loaded in memory
- No compression headers present

#### GET /api/quotes?page=1&limit=20
```bash
curl -w "@{time_total}\n" -o /dev/null -s "http://localhost:3001/api/quotes?page=1&limit=20"
```
**Observations**:
- Response size: ~5-6 KB (20 quotes only)
- Response time: ~120-150ms (including 100ms delay)
- Memory usage: Low - small slice of data
- Pagination metadata included

#### POST /api/favorites
```bash
curl -w "@{time_total}\n" -X POST -H "Content-Type: application/json" -d '{"quoteId": 1}' http://localhost:3001/api/favorites
```
**Observations**:
- Response time: ~60-70ms (includes 50ms blocking operation)
- No input validation - accepts any quoteId
- Synchronous blocking affects event loop

## 🚨 Intentional Errors Discovered

1. **CORS Policy**: Too permissive (`origin: '*'`)
2. **Pagination Off-by-One**: Total count is off by 10
3. **No Input Validation**: POST /favorites accepts any data
4. **Synchronous Blocking**: 50ms blocking loop in POST handler
5. **No Compression**: Large responses uncompressed
6. **Missing Error Handling**: No validation for invalid parameters

## 📊 Performance Comparison (Manual)
| Endpoint | Response Size | Response Time | Memory Impact |
|----------|---------------|----------------|----------------|
| Unpaginated | ~250-300 KB | 150-200ms | High |
| Paginated | ~5-6 KB | 120-150ms | Low |
| POST favorites | ~200 B | 60-70ms | Medium (blocking) |

## 🎯 Load Test Expectations
- Unpaginated endpoint will show high memory usage and slower response times under load
- Paginated endpoint should maintain consistent performance
- POST endpoint will show blocking behavior under concurrency
- Error rates may increase due to intentional implementation issues
