# Fragments Platform - Security Vulnerabilities & Fixes

## 📋 Six Interconnected Access Layer Vulnerabilities

---

### Vulnerability 1: Hardcoded JWT Secret & No Expiry
- **Found in**: `server/auth/jwt.js`
- **Description of the Problem**: 
  - JWT secret hardcoded as string literal: `'fragments-secret-key'`
  - No expiresIn property when signing tokens - tokens never expire
  - If source code is compromised, attacker can forge valid tokens
  - Stolen tokens remain valid forever
- **Description of the Fix**: 
  - Move secret to environment variable with validation
  - Add 1-hour expiry to all tokens
  - Add server startup validation for missing secret

---

### Vulnerability 2: Role Missing from JWT Payload
- **Found in**: `server/routes/auth.js`
- **Description of the Problem**: 
  - JWT payload only contains `{ userId: user.id }`
  - Role is missing from token, making server-side authorization impossible
  - Backend cannot determine user permissions from token alone
- **Description of the Fix**: 
  - Include user role in JWT payload when signing
  - Update auth middleware to extract and attach role to req.user

---

### Vulnerability 3: Frontend Stores Role in localStorage
- **Found in**: `client/src/context/AuthContext.jsx`
- **Description of the Problem**: 
  - Role stored in localStorage and used for UI decisions
  - Users can modify role via browser DevTools
  - Frontend role elevation bypasses all backend controls
  - UI shows admin buttons to anyone who modifies localStorage
- **Description of the Fix**: 
  - Remove role from localStorage
  - Derive role from JWT token or login response only
  - Use server-validated role for all UI decisions

---

### Vulnerability 4: Missing Role Checks on Critical Endpoints
- **Found in**: `server/routes/fragments.js`
- **Description of the Problem**: 
  - POST /api/fragments: Any authenticated user can create (should be Contributor+)
  - PUT /api/fragments/:id: No ownership check (Contributors should only edit own)
  - POST /api/fragments/:id/approve: No Curator requirement (should be Curator+)
  - DELETE /api/fragments/:id: Any user can delete (should be Admin only)
  - Role checks cannot work without role in JWT (Vulnerability 2)
- **Description of the Fix**: 
  - Create reusable role verification middleware
  - Apply appropriate role checks to all endpoints
  - Add ownership validation for edit operations

---

### Vulnerability 5: CSRF Vulnerability
- **Found in**: `server/index.js`
- **Description of the Problem**: 
  - CORS policy set to `{ origin: '*' }` - accepts any origin
  - No CSRF tokens or protection on state-changing requests
  - Attacker can host malicious site making requests using active session
  - Combined with other vulnerabilities, allows complete account takeover
- **Description of the Fix**: 
  - Restrict CORS to trusted origin only
  - Implement CSRF token mechanism (double-submit pattern)
  - Add CSRF validation to all state-changing endpoints

---

### Vulnerability 6: Logout Does Not Invalidate Token
- **Found in**: `client/src/components/LogoutButton.jsx`
- **Description of the Problem**: 
  - Logout only removes token from localStorage
  - Server has no knowledge of logout - token remains valid
  - Stolen tokens can be used indefinitely after logout
  - No server-side session termination
- **Description of the Fix**: 
  - Implement server-side token blacklist (in-memory array)
  - Add logout endpoint to blacklist tokens
  - Update auth middleware to reject blacklisted tokens

---

## 🔗 How Vulnerabilities Interconnect

1. **Hardcoded secret + No expiry** → Tokens are forever valid if compromised
2. **Missing role from JWT** → Backend cannot enforce any role-based restrictions
3. **Frontend role storage** → UI permissions can be bypassed by modifying localStorage
4. **Missing role checks** → Even with proper JWT, endpoints don't validate permissions
5. **CSRF vulnerability** → Attacker can exploit any of the above via malicious requests
6. **No token invalidation** → Even after logout, stolen tokens remain useful

These create a cascade where each vulnerability amplifies the others, resulting in complete access control breakdown.

---
> [!NOTE]
> All fixes tested with API client to ensure unauthorized requests are rejected even when bypassing frontend UI.
