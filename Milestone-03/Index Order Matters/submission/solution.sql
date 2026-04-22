-- Step 1: Drop the inefficient index
DROP INDEX IF EXISTS idx_salary_department;

-- Step 2: Create the corrected composite index
-- Rule: Put equality filters (department) before range filters (salary)
CREATE INDEX idx_department_salary ON employees(department, salary);

-- Step 3: Verify the improvement
-- This should now show an "Index Scan" or "Index Only Scan" with "Index Cond"
EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;
