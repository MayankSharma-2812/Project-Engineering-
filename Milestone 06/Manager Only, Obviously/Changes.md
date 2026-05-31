# ExpenseApp RBAC Implementation - Changes Report

## Role Gap Audit

The complete list of actions a regular user could perform before any fix was applied:

| HTTP Method | Endpoint | Expected Response | Actual Response (Before Fix) | Security Impact |
|-------------|----------|------------------|------------------------------|-----------------|
| GET | /api/expenses | 403 (Forbidden) | 200 (Success) | User can view all expenses |
| PUT | /api/expenses/:id/approve | 403 (Forbidden) | 200 (Success) | User can approve own expenses |
| PUT | /api/expenses/:id/reject | 403 (Forbidden) | 200 (Success) | User can reject own expenses |
| DELETE | /api/expenses/:id | 403 (Forbidden) | 200 (Success) | User can delete any expenses |
| GET | /api/users | 403 (Forbidden) | 200 (Success) | User can view all users |
| PUT | /api/users/:id/role | 403 (Forbidden) | 200 (Success) | User can change any role |
| PUT | /api/expenses/:id (other user's) | 403 (Forbidden) | 200 (Success) | User can edit others' expenses |
| DELETE | /api/expenses/:id (other user's) | 403 (Forbidden) | 200 (Success) | User can delete others' expenses |

## Root Cause Analysis

### Gap 1: Role Missing from JWT Payload
**File:** `controllers/authController.js`  
**Lines:** 12-16, 43-47  
**Issue:** JWT token signed without role information  
**Impact:** All role-based middleware checks fail with undefined  
**Exploitation:** Any authenticated user can bypass role restrictions

### Gap 2: No Role Middleware Existence
**File:** `middleware/` directory  
**Issue:** No `requireRole` middleware exists  
**Impact:** No mechanism to enforce role-based access control  
**Exploitation:** Complete absence of role enforcement

### Gap 3: Missing Route Protection
**Files:** `routes/expenseRoutes.js`, `routes/userRoutes.js`  
**Issue:** Sensitive routes only use `protect` middleware  
**Impact:** All authenticated users can access admin/manager functions  
**Exploitation:** Privilege escalation across all sensitive operations

### Gap 4: No Ownership Validation
**File:** `controllers/expenseController.js`  
**Lines:** 36-40 (update), 69-72 (delete)  
**Issue:** Any user can modify/delete any expense  
**Impact:** Complete data integrity compromise  
**Exploitation:** Users can manipulate or destroy colleagues' expenses

## Access Model

| Action | Endpoint | Allowed Roles | Was Restricted (Before) | Now Restricted (After) |
|--------|----------|---------------|------------------------|-----------------------|
| Submit expense | POST /api/expenses | user, manager, admin | ✅ (correct) | ✅ (correct) |
| View own expenses | GET /api/expenses/mine | user, manager, admin | ✅ (correct) | ✅ (correct) |
| View ALL expenses | GET /api/expenses | manager, admin | ❌ (all users) | ✅ (manager+) |
| Approve expense | PUT /api/expenses/:id/approve | manager, admin | ❌ (all users) | ✅ (manager+) |
| Reject expense | PUT /api/expenses/:id/reject | manager, admin | ❌ (all users) | ✅ (manager+) |
| Delete expense | DELETE /api/expenses/:id | admin only | ❌ (all users) | ✅ (admin only) |
| View all users | GET /api/users | admin only | ❌ (all users) | ✅ (admin only) |
| Change user role | PUT /api/users/:id/role | admin only | ❌ (all users) | ✅ (admin only) |
| View own profile | GET /api/users/me | user, manager, admin | ✅ (correct) | ✅ (correct) |

## What I Fixed

### Fix 1: JWT Token Enhancement
**Before:**
```javascript
const token = jwt.sign(
  { userId: user._id, email: user.email }, // ❌ missing role
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**After:**
```javascript
const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### Fix 2: Role Middleware Creation
**Created:** `middleware/roleMiddleware.js`
```javascript
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required: ${allowedRoles.join(' or ')}.` 
      })
    }
    next()
  }
}
```

### Fix 3: Route Protection Updates

**expenseRoutes.js Before:**
```javascript
router.get('/', protect, getAllExpenses);
router.put('/:id/approve', protect, approveExpense);
router.put('/:id/reject', protect, rejectExpense);
router.delete('/:id', protect, deleteExpense);
```

**expenseRoutes.js After:**
```javascript
router.get('/', protect, requireRole('manager', 'admin'), getAllExpenses);
router.put('/:id/approve', protect, requireRole('manager', 'admin'), approveExpense);
router.put('/:id/reject', protect, requireRole('manager', 'admin'), rejectExpense);
router.delete('/:id', protect, requireRole('admin'), deleteExpense);
```

**userRoutes.js Before:**
```javascript
router.get('/', protect, getAllUsers);
router.put('/:id/role', protect, updateUserRole);
```

**userRoutes.js After:**
```javascript
router.get('/', protect, requireRole('admin'), getAllUsers);
router.put('/:id/role', protect, requireRole('admin'), updateUserRole);
```

### Fix 4: Ownership Validation

**updateExpense Before:**
```javascript
export const updateExpense = async (req, res) => {
  // ❌ Any user can update any expense
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(expense);
};
```

**updateExpense After:**
```javascript
export const updateExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const isOwner = expense.submittedBy.toString() === req.user.userId;
  const isPrivileged = ['manager', 'admin'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ message: 'You can only modify your own expenses.' });
  }

  const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedExpense);
};
```

**deleteExpense Before:**
```javascript
export const deleteExpense = async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: 'Expense removed' });
};
```

**deleteExpense After:**
```javascript
export const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const isOwner = expense.submittedBy.toString() === req.user.userId;
  const isPrivileged = ['manager', 'admin'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ message: 'You can only delete your own expenses.' });
  }

  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: 'Expense removed' });
};
```

## Verification Results

| Scenario | Token Used (Role) | Expected Status | Actual Status | Screenshot |
|----------|-------------------|-----------------|---------------|------------|
| User tries approve expense | user | 403 | 403 | screenshots/01-user-approve.png |
| User tries delete expense | user | 403 | 403 | screenshots/02-user-delete.png |
| User tries change role | user | 403 | 403 | screenshots/03-user-role.png |
| User tries edit other's expense | user | 403 | 403 | screenshots/04-user-edit.png |
| Manager approves expense | manager | 200 | 200 | screenshots/05-manager-approve.png |
| Manager tries change role | manager | 403 | 403 | screenshots/06-manager-role.png |
| Admin deletes expense | admin | 200 | 200 | screenshots/07-admin-delete.png |
| Admin changes user role | admin | 200 | 200 | screenshots/08-admin-role.png |

## Checkpoint Analysis

### Checkpoint 1: Role in User Model and JWT
- ✅ User model has proper role enum
- ❌ JWT was missing role (fixed)
- ✅ Role now properly included in token payload

### Checkpoint 2: Role Middleware Existence
- ❌ No role middleware existed (created requireRole)
- ✅ Role middleware now implemented and functional

### Checkpoint 3: Route Protection Coverage
- ❌ 6 sensitive routes had no role restrictions
- ✅ All routes now properly protected with requireRole middleware

### Checkpoint 4: Ownership Gaps
- ❌ No ownership checks on expense operations
- ✅ Ownership validation added to update/delete operations

## Security Impact Summary

**Before Fixes:** Complete RBAC bypass - any authenticated user could perform any action
**After Fixes:** Proper role-based access control with ownership validation

The implementation now correctly enforces the principle of least privilege across all application endpoints, preventing privilege escalation and unauthorized data access.
