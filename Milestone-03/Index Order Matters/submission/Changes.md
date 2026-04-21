# Index Order Investigation

## Original Index
- `CREATE INDEX idx_salary_department ON employees(salary, department);`

## Issue Observed
- The query filters by `department = 'Sales'` and `salary > 50000`.
- **Left-Most Prefix Rule Violation**: The existing index starts with `salary`. Since the query uses an equality filter on `department`, the database cannot "jump" directly to the relevant records because `department` is the second column.
- Even if the database uses the index for `salary > 50000`, it still has to filter every resulting row by `department`. If many employees have high salaries but work in different departments, this is very inefficient.

## Fixed Index
- `CREATE INDEX idx_department_salary ON employees(department, salary);`

## Performance Improvement
- **Equality Before Range**: By putting `department` first, the database uses the equality filter (`department = 'Sales'`) to instantly narrow down the search space.
- Within the 'Sales' department results, it then performs a range scan for `salary > 50000`.
- This converts the query plan from a **Sequential Scan** (or inefficient Index Scan) into a highly optimized **Index Cond** (Index Condition) scan, drastically reducing the number of shared hits and execution time.
