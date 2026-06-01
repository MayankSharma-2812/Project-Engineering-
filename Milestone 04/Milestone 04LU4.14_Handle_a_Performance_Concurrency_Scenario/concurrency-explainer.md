# Concurrency and Performance Explainer

## The Root Cause: Why Check-Then-Insert Fails
The original booking flow used a check-then-insert pattern. First it ran `findFirst()` to see whether a booking already existed, then it created a booking if nothing was found. That looks safe in single-user testing, but it breaks under concurrent load. Two requests can reach the check at almost the same time, both see an empty result, and both move on to `create()`. The problem is the gap between the read and the write: the application makes two separate database calls, so the decision is not atomic. That is what a race condition is here — the result depends on which request happens to reach the database first.

## The Unique Constraint: The Real Fix
Adding `@@unique([seatId, showId])` moves the protection into the database, where it belongs. The database now enforces a hard rule: the same seat can only be booked once per show. With that constraint in place, concurrent inserts are no longer a guess-and-hope problem. One request wins, and any later request that tries to store the same `(seatId, showId)` pair is rejected by PostgreSQL before duplicate data can be saved. This is stronger than application logic because it is enforced at write time, not after a read.

## Why the Rate Limiter Still Matters
The rate limiter is a separate defense layer, not a replacement for the unique constraint. Limiting each IP to 10 booking attempts per minute helps absorb traffic spikes, blocks obvious abuse, and protects the database from being hammered by bots. But it does not solve the race itself. Two real users from different IPs can still press “Book” at the same moment, and both requests can still reach the database. Without the unique constraint, both could still succeed.

## The P2002 Catch: Returning the Right Response
When Prisma hits the unique constraint, it throws `P2002`, which means a unique field or combination was violated. That is not a server failure; it is a booking conflict. Returning `409 Conflict` tells the client the request was valid, but the seat is no longer available because another request won the race. Returning `500` would hide the real cause and make a normal business conflict look like an application crash.
