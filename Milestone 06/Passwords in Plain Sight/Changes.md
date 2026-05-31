# Changes.md

## What I Found
When signing up for an account, the database stores the password field in plain text. 
- Example: `password: "password123"`
- Category: **Type 1 - Plain Text Storage**

## Checkpoint 1 — Signup
The signup controller in `backend/controllers/authController.js` receives `req.body.password` and passes it directly to `User.create()` without any hashing or transformation.
```javascript
const user = await User.create({
  email,
  password, // plain text stored here
})
```

## Checkpoint 3 — Login Comparison
The login controller in `backend/controllers/authController.js` verifies the password using a direct strict inequality comparison (`!==`).
```javascript
if (user.password !== password) {
  return res.status(401).json({ message: 'Invalid credentials' })
}
```
This is highly insecure as it compares the plain text input directly with the plain text value stored in the database.

## Checkpoint 4 — The User Model
The `User` model in `backend/models/User.js`:
- Lacks a `pre('save')` hook for automatic password hashing.
- Does not have `select: false` on the password field, which could lead to accidental exposure in API responses if not handled carefully.
- Has no minimum length validation for passwords.

## Why This Is Dangerous
If an attacker gains access to the database (through a breach, accidental log exposure, or a disgruntled employee), they can read every user's password immediately. Since many users reuse passwords across different platforms (Gmail, Banking, etc.), this single breach could lead to a massive "credential stuffing" attack, compromising their entire digital identity beyond this application.

## What I Fixed
I implemented `bcryptjs` to ensure passwords are never handled or stored as plain text.

### Fix 1 — Hash on Signup
In `backend/controllers/authController.js`, I imported `bcrypt` and updated the `signup` function to hash the password with 10 salt rounds before saving it to the database.
```javascript
// Before
const user = await User.create({ email, password })

// After
const saltRounds = 10
const hashedPassword = await bcrypt.hash(password, saltRounds)
const user = await User.create({ email, password: hashedPassword })
```

### Fix 2 — Safe Comparison on Login
In the `login` function, I replaced the direct equality check with `bcrypt.compare()`.
```javascript
// Before
if (user.password !== password) { ... }

// After
const isMatch = await bcrypt.compare(password, user.password)
if (!isMatch) { ... }
```

## Verification
- **Before Fix**: Database record showed `password: "password123"`.
- **After Fix**: Database record now shows a hashed value starting with `$2a$10$` (or `$2b$10$`), ensuring the plain text is never stored.
- **Login Test**: Verified that logging in with correct credentials still works, while incorrect credentials return a 401 Unauthorized error.
