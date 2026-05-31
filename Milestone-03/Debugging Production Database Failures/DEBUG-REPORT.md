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

### Reproduction Output (Before Fix)
```
 order_id | customer_id | customer_name 
----------+-------------+---------------
        3 |        9999 | 
        4 |        9999 | 
(2 rows)
```

### Data Flow Trace
1. **API Layer**: Client calls `GET /orders` endpoint (handled in [routes/orders.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/routes/orders.js)).
2. **Database Query**: A `LEFT JOIN` connects `orders` table to `customers` table on `o.customer_id = c.id`.
3. **Data Source**: The `orders` table contains records with `customer_id = 9999`. Since there is no row in `customers` with `id = 9999`, the join fails to resolve the customer name, producing `null` for `customer_name` in the API response.
4. **Write Action**: The `POST /orders` endpoint executes `INSERT INTO orders (customer_id, total, status) VALUES ($1, $2, $3)` without confirming that the provided `customer_id` is linked to an existing, valid customer profile.
5. **Structural Loophole**: The schema contains no relational check linking `orders.customer_id` to `customers.id`.

### Root Cause
The `orders` table is missing a **FOREIGN KEY** constraint on the `customer_id` column referencing `customers(id)`. This structural flaw permits orphaned order records to be inserted.

### Fix Applied
Updated the `orders` table definition in [schema.sql](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/schema.sql) to add a foreign key constraint:
```sql
ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
```

### Validation
1. **Seeding Cleanup**: Replaced invalid orphaned ids (e.g. `9999`) in the seed file with valid customer id `1`.
2. **Reproduction Query Check**:
   ```sql
   SELECT o.id AS order_id, o.customer_id, c.name AS customer_name 
   FROM orders o 
   LEFT JOIN customers c ON o.customer_id = c.id 
   WHERE c.id IS NULL;
   ```
   **Output**: `0 rows`
3. **Constraint Block Test**: Attempting to insert a row referencing a non-existent customer:
   ```sql
   INSERT INTO orders (customer_id, total, status) VALUES (9999, 100.00, 'pending');
   ```
   **Output**:
   ```
   ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
   DETAIL:  Key (customer_id)=(9999) is not present in table "customers".
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

### Reproduction Output (Before Fix)
```
 id |       name       |   sku   | inventory_count 
----+------------------+---------+-----------------
  2 | Wireless Mouse   | SKU-002 |              -3
  3 | USB-C Cable (1m) | SKU-003 |              -5
(2 rows)
```

### Data Flow Trace
1. **API Layer**: Client calls `GET /products` (handled in [routes/products.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/routes/products.js)).
2. **Data Source**: Read directly from the `products` table column `inventory_count`.
3. **Write Action**: The negative quantity is written via two avenues:
   - Deductions during order processing in `POST /order_items` ([routes/order_items.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/routes/order_items.js)): `UPDATE products SET inventory_count = inventory_count - $1 WHERE id = $2`.
   - Ad-hoc stock updates in `PATCH /products/:id/inventory` ([routes/products.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/routes/products.js)): `UPDATE products SET inventory_count = inventory_count + $1 WHERE id = $2`.
4. **Structural Loophole**: Neither the application routes nor the database schema validate if the adjustment reduces stock levels below zero.

### Root Cause
The `products` table is missing a **CHECK** constraint on the `inventory_count` column ensuring `inventory_count >= 0`. Without it, updates can freely reduce inventory levels below zero.

### Fix Applied
Updated the `products` table definition in [schema.sql](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/schema.sql) to enforce non-negative stock counts:
```sql
ALTER TABLE products ADD CONSTRAINT products_inventory_count_check CHECK (inventory_count >= 0);
```

### Validation
1. **Seeding Cleanup**: Corrected initial seed levels in [seed.sql](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/seed.sql) to positive numbers.
2. **Reproduction Query Check**:
   ```sql
   SELECT id, name, sku, inventory_count FROM products WHERE inventory_count < 0;
   ```
   **Output**: `0 rows`
3. **Constraint Block Test**: Attempting to force a product's inventory below 0:
   ```sql
   UPDATE products SET inventory_count = -1 WHERE id = 1;
   ```
   **Output**:
   ```
   ERROR:  new row for relation "products" violates check constraint "products_inventory_count_check"
   DETAIL:  Failing row contains (1, Mechanical Keyboard, SKU-001, -1, 89.99).
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

### Reproduction Output (Before Fix)
```
 id | order_id | amount |  status   |            created_at            
----+----------+--------+-----------+----------------------------------
  1 |        1 | 114.99 | pending   | 2026-05-31 23:48:24.436481+05:30
  2 |        1 | 114.99 | completed | 2026-05-31 23:48:24.436481+05:30
(2 rows)
```

### Data Flow Trace
1. **API Layer**: Client calls `GET /payments/:orderId` to view payment records ([routes/payments.js](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/routes/payments.js)).
2. **Data Source**: Queries the `payments` table `WHERE order_id = $1`.
3. **Write Action**: Payments are created via `POST /payments` executing `INSERT INTO payments (order_id, amount, status) VALUES ($1, $2, $3)`.
4. **Structural Loophole**: There is no constraint restricting the number of payments associated with an order, allowing duplicate payments to be recorded.

### Root Cause
The `payments` table is missing a **UNIQUE** constraint on the `order_id` column. It also lacks a **FOREIGN KEY** referencing `orders(id)`.

### Fix Applied
Updated the `payments` table definition in [schema.sql](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/schema.sql) to add a foreign key and uniqueness constraint:
```sql
ALTER TABLE payments ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);
ALTER TABLE payments ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
```

### Validation
1. **Seeding Cleanup**: Removed the duplicate order 1 payment in [seed.sql](file:///c:/Users/mayan/Project-Engineering-/Milestone-03/Debugging%20Production%20Database%20Failures/seed.sql), keeping only the valid entries.
2. **Reproduction Query Check**:
   ```sql
   SELECT id, order_id, amount, status FROM payments WHERE order_id IN (
       SELECT order_id FROM payments GROUP BY order_id HAVING COUNT(*) > 1
   );
   ```
   **Output**: `0 rows`
3. **Constraint Block Test**: Attempting to insert a duplicate payment record for order 1:
   ```sql
   INSERT INTO payments (order_id, amount, status) VALUES (1, 50.00, 'pending');
   ```
   **Output**:
   ```
   ERROR:  duplicate key value violates unique constraint "payments_order_id_key"
   DETAIL:  Key (order_id)=(1) already exists.
   ```
