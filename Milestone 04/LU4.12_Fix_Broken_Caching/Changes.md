# Changes Implemented to Fix Broken Caching

## Issues Discovered
Upon reviewing `src/index.js`, several severe implementation flaws were found:
1. **Global Cache Key (`global_data_key`)**: The system used the same cache key for everything, returning the same response for different requests.
2. **Memory Leak (Permanent Caching)**: Cached items had no Time-to-Live (TTL). Once stored, they stayed in memory forever, bloating server RAM.
3. **Missing Await on Prisma Queries**: The `findMany` query was not `await`ed before being placed in the cache, resulting in storing unfulfilled Promises instead of actual JSON data.
4. **Caching Invalid/Null Responses**: `GET /tasks/:id` cached the result even if `task` was `null`. A user querying a non-existent task would permanently cache that `null`, preventing the task from being seen even if it was created later.
5. **No Cache Invalidation**: `POST` and `DELETE` requests did not clear out the stale data. If a task was deleted, the `global_data_key` still had the old list, resulting in deleted items showing up on the frontend.
6. **Incorrect HTTP Status Codes**: Every response returned `200 OK`, including POST (should be `201`) and DELETE (should be `204`).
7. **Swallowed Errors**: Errors were caught and `console.log`'d, but no HTTP response was sent back (`next(err)` was missing), causing requests to hang indefinitely.

## Improvements Implemented
1. **Extracted Caching Service (`src/cache.service.js`)**: Moved the raw `Map` logic into a reusable service layer with built-in support for TTL (Time-To-Live).
2. **Namespaced Cache Keys**: Used unique and contextual keys like `tasks:list` for the full collection and `task:${id}` for individual items to prevent data overlap.
3. **TTL (Expiration)**: Added a 60-second expiration for all cached queries, ensuring stale data cleans itself up.
4. **Cache Invalidation on Mutation**: When a task is created or deleted, `cacheService.invalidate('tasks:list')` and `cacheService.invalidate('task:${id}')` are called.
5. **Async/Await Fixes**: Corrected the Promise handling so we only cache the resolved data.
6. **Null Checks Guarding the Cache**: Added validation to ensure a `404 Not Found` is immediately returned if a task doesn't exist, preventing `null` from poisoning the cache.
7. **Central Error Handler**: Replaced `.catch(console.log)` with `next(err)` and added a global Express error handler to return a standardized `500 Internal Server Error`.
8. **Semantic HTTP Status Codes**: Fixed HTTP responses (201 for POST, 204 for DELETE, 404 for Not Found).

## Why this improves system reliability
These changes guarantee that:
* The application memory usage remains stable due to the Time-to-Live (TTL) automatically cleaning old references.
* Clients always see fresh data after creating or deleting tasks because the cache is proactively invalidated.
* Non-existent records won't break future fetches, as we actively avoid caching `null` values.
* The API correctly fulfills the REST spec, allowing frontend clients to easily interpret successes and failures.
