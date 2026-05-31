# Still In? – Bug Fix Log

## Vulnerabilities Identified Before Fixes

### 1. Expired Token Returns Wrong HTTP Status
**File:** `server/middleware/auth.js`
**Issue:** Line 19 returns 500 status for all token errors including expiry
**Problem:** 
```javascript
res.status(500).json({ message: "Invalid token", error: err.message });
```
**Impact:** Frontend cannot distinguish between server error (500) and session expiry (401)
**Expected:** Should return 401 for TokenExpiredError specifically

### 2. Voting Logic Allows Duplicate Votes
**File:** `server/routes/poll.js`
**Issue:** Type mismatch in vote comparison logic
**Problem:**
```javascript
const alreadyVoted = votedUserIds.find(id => id === req.user.email);
votedUserIds.push(userId); // stores numeric ID
```
**Impact:** Compares numeric ID with string email, always false → infinite voting
**Expected:** Should use consistent types and proper comparison

### 3. Frontend Ignores Authentication Errors
**File:** `client/src/api/client.js`
**Issue:** No response interceptor for 401 status
**Problem:** Missing 401 handler to clear tokens and redirect
**Impact:** Expired sessions remain active in UI
**Expected:** Should handle 401 globally and cleanup session

### 4. Polling Interval Keeps Running After Expiry
**File:** `client/src/pages/Dashboard.jsx`
**Issue:** setInterval continues after token expiry
**Problem:** Line 33-35 interval never cleared on session end
**Impact:** Resource leaks and continued API calls after expiry
**Expected:** Should clear interval on 401 and logout

---

## 🛠️ Your Fixes

### 1. Handle TokenExpiredError with Correct Status
- **Description**: Auth middleware returned 500 for all token errors
- **Solution**: Added specific TokenExpiredError handling to return 401

### 2. Fix Duplicate Vote Prevention
- **Description**: Type mismatch allowed infinite voting
- **Solution**: Used consistent types and Array.includes() for comparison

### 3. Add Global 401 Interceptor
- **Description**: Frontend ignored authentication errors
- **Solution**: Added response interceptor to handle 401 and cleanup

### 4. Implement Polling Cleanup
- **Description**: Polling continued after session expiry
- **Solution**: Clear intervals on 401 and logout
