# Soft Deletion Trade-off & Performance Analysis

This document provides a detailed technical analysis of the soft-deletion strategy implemented for `LedgerApp` (accounting/financial ledger database), including partial indexing benefits and compliance scenarios.

---

## 1. Storage & Performance Analysis (Move 5)

### Table Size Growth Over Time
When soft deletion is implemented, the physical size of the database tables (e.g. `transactions`) grows monotonically because rows are never physically deleted via `DELETE` statements.
- **Example Projection**: In a mid-sized ledger app with 5,000 active users, where each user makes an average of 20 transactions per month (totaling 100,000 new transaction rows/month), and deletes 5% of their transaction entries (5,000 deleted entries/month):
  - **With Hard Delete**: The table size stabilizes or grows strictly by active items (e.g., 95,000 rows added per month).
  - **With Soft Delete**: The table grows by 100,000 rows/month. After 24 months, the table accumulates **120,000 soft-deleted rows** alongside **2,280,000 active rows**. The storage bloat accumulates indefinitely.

### Query Performance Problems Solved by Partial Indexing
Every read query on the platform now contains `WHERE deleted_at IS NULL`. Without an index:
1. PostgreSQL is forced to perform a **Sequential Scan** (Seq Scan) across the entire table (including the 120,000 deleted rows) to filter active records.
2. As deleted rows pile up, sequential scans read more dead pages from disk, increasing I/O operations and latency.

By defining a **Partial Index**:
```sql
CREATE INDEX idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL;
```
PostgreSQL creates a binary tree containing **only pointers to the active rows** where `deleted_at IS NULL`. It completely excludes deleted records. Reads bypass all deleted records instantly via a quick **Index Scan**, keeping query latency flat and memory footprint low.

### Critical Performance Breakpoints
- **Below 10,000 rows**: The difference between sequential scan and index lookup is negligible (under 1-2 milliseconds), as the entire table easily fits into the PostgreSQL buffer cache.
- **Between 10,000 and 100,000 rows**: Sequential scans start displaying noticeable CPU and I/O overhead. Queries without a partial index can slow down from sub-millisecond response times to 10-50 milliseconds.
- **Above 100,000 rows**: A partial index becomes critical. Without it, concurrent reads under high transaction volume will saturate database disk I/O, leading to connection exhaustion and API latency spikes (>100ms).

---

## 2. Design Reasoning & Trade-offs (Move 6)

### When Soft Delete is the Right Call (LedgerApp Examples)
1. **Accidental Transaction Deletion Recovery**: If a business manager accidentally deletes a vital supplier payment transaction, soft deletion allows the support team to restore it immediately by setting `deleted_at = NULL`, preventing business disruption and data loss.
2. **Reconciliation Auditing**: In ledger accounting, matching bank statements to system records is critical. If a user deletes an entry that actually occurred, soft-deleted transaction records are necessary to troubleshoot double-entries or account balance discrepancies.

### When Hard Delete is Still Appropriate
1. **GDPR "Right to be Forgotten" (User Request)**: If a user terminates their relationship with `LedgerApp` and requests complete erasure under GDPR Article 17, personal identifiable information (PII) stored in the `users` table (names, emails) must be permanently purged from the database after a legally permitted grace window, requiring a hard `DELETE` or scrubbing.
2. **Ephemeral / Temporary Data**: If the app introduces session tokens, login attempts, or transient calculation logs, these have zero audit value. Soft-deleting them would waste storage and memory. Hard deletion is the correct strategy for cleaning up temporary data.

---

## 3. Compliance and Regulatory Scenario

### Regulatory Scenario: anti-money laundering (AML) Audit
Under the **Bank Secrecy Act (BSA)** and **FINRA** regulations, financial platforms must maintain transaction histories for at least **5 years** (7 years in some jurisdictions) to assist in audits.

**Audit Request**:
An AML auditor suspects a user is structuring deposits to avoid reporting thresholds and demands a complete log of all transaction activities, including entries the user deleted.

**Query Satisfaction**:
Using soft-deleted tables, the database administrator runs:
```sql
SELECT t.*, a.account_type, u.email 
FROM transactions t 
JOIN accounts a ON t.account_id = a.id
JOIN users u ON a.user_id = u.id
WHERE u.id = 4821; -- No 'deleted_at IS NULL' filter
```
This returns the full, unmodified history of user 4821, including records where `t.deleted_at IS NOT NULL`. The auditor receives the complete financial audit trail, satisfying compliance, while normal users querying `/transactions` only see active (non-deleted) ledger records.
