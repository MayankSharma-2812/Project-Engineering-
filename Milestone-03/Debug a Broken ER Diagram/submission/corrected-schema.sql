-- TaskSphere Corrected Database Schema
-- This schema resolves issues with missing keys, poor relationships, and redundancy.

-- Users Table: Central entity for team members
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Projects Table: Manages high-level projects
CREATE TABLE Projects (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id INT REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table: Specific items within a project
CREATE TABLE Tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INT NOT NULL REFERENCES Projects(project_id) ON DELETE CASCADE,
    assigned_to INT REFERENCES Users(user_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'On Hold')),
    due_date DATE
);

-- UserProjects Table (Junction Table): Handles Many-to-Many relationships between Users and Projects
CREATE TABLE UserProjects (
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    project_id INT REFERENCES Projects(project_id) ON DELETE CASCADE,
    role VARCHAR(50),
    PRIMARY KEY (user_id, project_id)
);

-- Indexes for performance on frequently queried fields
CREATE INDEX idx_tasks_project ON Tasks(project_id);
CREATE INDEX idx_tasks_assigned ON Tasks(assigned_to);
CREATE INDEX idx_userprojects_user ON UserProjects(user_id);
