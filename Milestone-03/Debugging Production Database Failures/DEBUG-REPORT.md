# Production Database Failures Debug Report

This document records the investigation, tracing, root cause identification, schema fixes, and validations for the three production database failures in `OrderFlow`.

---

## Bug 1: Orders with no associated customer record (Orphaned Orders)

### Symptom
When listing orders, some entries display a `null` customer name because they reference a `customer_id` that does not exist in the database.

### Reproduction Query
```sql
SELECT o.id AS order_id, o.customer_id, c.name AS customer_name 
FROM orders o 
LEFT JOIN customers c ON o.customer_id = c.id 
WHERE c.id IS NULL;
```

### Reproduction Output
```
 order_id | customer_id | customer_name 
----------+-------------+---------------
        3 |        9999 | 
        4 |        9999 | 
(2 rows)
```

---

## Bug 2: Products showing negative inventory counts

### Symptom
Products in the inventory have negative stock quantities (`inventory_count < 0`), which should be impossible in a physical warehouse environment.

### Reproduction Query
```sql
SELECT id, name, sku, inventory_count 
FROM products 
WHERE inventory_count < 0;
```

### Reproduction Output
```
 id |       name       |   sku   | inventory_count 
----+------------------+---------+-----------------
  2 | Wireless Mouse   | SKU-002 |              -3
  3 | USB-C Cable (1m) | SKU-003 |              -5
(2 rows)
```

---

## Bug 3: Duplicate payment records for a single order

### Symptom
Multiple payments are logged against a single order (one pending and one completed), causing inconsistent payment status displays.

### Reproduction Query
```sql
SELECT id, order_id, amount, status, created_at 
FROM payments 
WHERE order_id IN (
    SELECT order_id 
    FROM payments 
    GROUP BY order_id 
    HAVING COUNT(*) > 1
);
```

### Reproduction Output
```
 id | order_id | amount |  status   |            created_at            
----+----------+--------+-----------+----------------------------------
  1 |        1 | 114.99 | pending   | 2026-05-31 23:48:24.436481+05:30
  2 |        1 | 114.99 | completed | 2026-05-31 23:48:24.436481+05:30
(2 rows)
```
