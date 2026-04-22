CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE projects (
    id INT PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL
);

CREATE TABLE tasks (
    id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    priority INT CHECK (priority BETWEEN 1 AND 5),
    project_id INT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
