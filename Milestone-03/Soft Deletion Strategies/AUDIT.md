# Pre-Refactor Hard Delete Audit

This document lists all the hard `DELETE` statements identified across the `LedgerApp` codebase prior to implementing soft deletion strategies.

---

## Hard Deletes Audit List

### 1. User Deletion
- **File Path**: [users.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Soft%20Deletion%20Strategies/routes/users.js)
- **Line Number**: 44
- **Table Affected**: `users`
- **Permanently Lost Data**: Running this query permanently deletes the user's profile record (name, email, and created timestamp), destroying the user identifier history.

### 2. Account Deletion
- **File Path**: [accounts.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Soft%20Deletion%20Strategies/routes/accounts.js)
- **Line Number**: 43
- **Table Affected**: `accounts`
- **Permanently Lost Data**: Running this query permanently erases the account registration record, type, and final balance, destroying historical reference to this ledger account.

### 3. Transaction Deletion
- **File Path**: [transactions.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Soft%20Deletion%20Strategies/routes/transactions.js)
- **Line Number**: 43
- **Table Affected**: `transactions`
- **Permanently Lost Data**: Running this query permanently removes the ledger transaction amount, credit/debit designation, description, and execution timestamp, causing data loss for future compliance audits.

---

## Exclusions & Justifications

No tables in the current schema were excluded from soft-deletion. All three existing tables (`users`, `accounts`, and `transactions`) store non-ephemeral records that are required for regulatory financial audit trails. No temporary token or cache tables exist in the database schema.
