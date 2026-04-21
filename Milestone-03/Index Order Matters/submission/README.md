# Composite Index Investigation - Challenge #4

## Overview
This project investigates the impact of column ordering in composite indexes. A query filtering by `department` and `salary` was found to be slow because the existing index was ordered `(salary, department)`, violating the optimal use of the Left-Most Prefix Rule.

## Approach
1. **Analyze**: Used `EXPLAIN ANALYZE` to observe that the original index was either ignored or used inefficiently for a multi-filter query.
2. **Experiment**: Identified that putting the equality filter (`department`) after the range filter (`salary`) in the index limited the database's ability to prune the search space early.
3. **Fix**: Reordered the index to `(department, salary)`.
4. **Verify**: Confirmed the performance boost using `EXPLAIN ANALYZE`, showing a shift to an efficient index scan.

## Files
- `Changes.md`: Detailed explanation of the fix and the Left-Most Prefix Rule.
- `solution.sql`: SQL commands to drop the old index and apply the optimization.

## Conclusion
Column order in composite indexes is critical. Equality filters should generally come before range filters to allow the database to use the index most effectively.
