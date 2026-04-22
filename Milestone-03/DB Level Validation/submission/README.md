# FocusForge DB Validation - Challenge #5

## Overview
This project demonstrates the implementation of database-level constraints (NOT NULL, UNIQUE, CHECK, FOREIGN KEY) to ensure data integrity in the FocusForge task management system.

## Repository Structure
- `schema/schema.sql`: The fixed schema with all necessary constraints.
- `schema/sample_data.sql`: Valid sample data for testing successful inserts.
- `schema/constraints_test.sql`: Invalid data test cases that must be rejected by the database.
- `Observations.md`: Documentation of the issues found and the logic behind each constraint.

## How to Test
1. Create a database: `CREATE DATABASE focusforge;`
2. Run the schema: `\i schema/schema.sql`
3. Load valid data: `\i schema/sample_data.sql`
4. Run validation tests: `\i schema/constraints_test.sql`

All tests in `constraints_test.sql` should result in a `VIOLATION` error from PostgreSQL.
