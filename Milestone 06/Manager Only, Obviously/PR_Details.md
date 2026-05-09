# PR Title:
feat: ExpenseApp RBAC — role-based access control across all sensitive actions

# PR Description:

## Summary
This PR implements comprehensive Role-Based Access Control (RBAC) for the ExpenseApp to address critical security vulnerabilities where any authenticated user could perform any action, including approving their own expenses, deleting colleagues' records, and promoting themselves to admin.

## Security Gaps Fixed
- **JWT Token Enhancement**: Added role information to JWT payload for proper role-based authentication
- **Role Middleware**: Created `requireRole` middleware to enforce role restrictions on sensitive endpoints
- **Route Protection**: Applied role-based restrictions to 6 previously vulnerable endpoints
- **Ownership Validation**: Added ownership checks to prevent users from modifying others' expenses

## Changes Made

### 1. Authentication Fixes
- Fixed JWT token generation to include user role
- Updated both login and signup functions in `authController.js`

### 2. Middleware Implementation
- Created `middleware/roleMiddleware.js` with `requireRole` function
- Implements proper 403 responses for unauthorized role access

### 3. Route Protection Updates
**Expense Routes:**
- `GET /api/expenses` → manager+ only
- `PUT /api/expenses/:id/approve` → manager+ only  
- `PUT /api/expenses/:id/reject` → manager+ only
- `DELETE /api/expenses/:id` → admin only

**User Routes:**
- `GET /api/users` → admin only
- `PUT /api/users/:id/role` → admin only

### 4. Ownership Validation
- Added ownership checks to `updateExpense` and `deleteExpense` functions
- Users can only modify/delete their own expenses (except managers/admins)

## Access Model Enforcement
| Action | Allowed Roles | Status |
|--------|---------------|---------|
| Submit expense | user, manager, admin | ✅ Enforced |
| View own expenses | user, manager, admin | ✅ Enforced |
| View ALL expenses | manager, admin | ✅ Enforced |
| Approve expense | manager, admin | ✅ Enforced |
| Reject expense | manager, admin | ✅ Enforced |
| Delete expense | admin only | ✅ Enforced |
| View all users | admin only | ✅ Enforced |
| Change user role | admin only | ✅ Enforced |

## Verification
All 8 security scenarios tested and verified:
- ✅ Regular user attempting admin actions → 403 Forbidden
- ✅ Manager performing approved actions → 200 Success
- ✅ Admin performing privileged actions → 200 Success
- ✅ Ownership validation preventing cross-user data access

## Security Impact
**Before**: Complete RBAC bypass - any authenticated user could perform any action
**After**: Proper role-based access control with principle of least privilege

## Files Changed
- `controllers/authController.js` - Fixed JWT token generation
- `middleware/roleMiddleware.js` - Created role enforcement middleware
- `routes/expenseRoutes.js` - Added role restrictions
- `routes/userRoutes.js` - Added role restrictions  
- `controllers/expenseController.js` - Added ownership validation
- `Changes.md` - Comprehensive documentation of all changes

## Testing
- Manual testing of all 8 verification scenarios completed
- Screenshots captured for each test case
- Role-based access control fully functional

## Deployment
Ready for production deployment with comprehensive RBAC protection.

## Links
- **Changes.md**: [Link to Changes.md](./Changes.md)
- **Live Deployment**: [Add deployment URL here]
- **Verification Screenshots**: [screenshots/ directory]

---

**This PR resolves all identified security vulnerabilities and implements proper role-based access control across the entire ExpenseApp.**
