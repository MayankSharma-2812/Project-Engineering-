# Observations - DB Level Validation

## Issues Found
In the original schema, no constraints were implemented, leading to the following data integrity issues:
- **NULL Values**: The database accepted tasks without titles, making them unidentifiable.
- **Duplicate Data**: Multiple users could register with the same email, breaking the authentication and user identity system.
- **Domain Mismatch**: Priority values were not restricted, allowing invalid values like `10` or `-1` which would break sorting logic.
- **Referential Integrity**: Tasks could be assigned to `project_id` values that did not exist (orphaned rows), causing dashboard and report inaccuracies.

## Constraints Implemented
To secure the database, I implemented the following constraints:
- **NOT NULL**: Applied to `users.name`, `users.email`, `projects.project_name`, and `tasks.title` to ensure required data is always present.
- **UNIQUE**: Applied to `users.email` to prevent duplicate account creation and ensure email uniqueness.
- **CHECK**: Applied to `tasks.priority` (BETWEEN 1 AND 5) to restrict data to valid application business rules.
- **FOREIGN KEY**: Applied to `tasks.project_id` referencing `projects(id)` to ensure every task belongs to a valid project.

## Result
The database now acts as the final and absolute source of truth. Even if application-level validation is bypassed, PostgreSQL will reject invalid data with specific error messages:
- `null value in column "title" violates not-null constraint`
- `duplicate key value violates unique constraint "users_email_key"`
- `new row for relation "tasks" violates check constraint "tasks_priority_check"`
- `insert or update on table "tasks" violates foreign key constraint "tasks_project_id_fkey"`
