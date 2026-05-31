# Project Refactor: FocusForge Dashboard Architecture

## Overview
This refactor transforms the monolithic `DashboardPage.jsx` into a clean, component-based architecture. The goal was to improve maintainability, reusability, and readability without changing any visible UI or functionality.

## Components Created

### Shared Components (`src/components/shared/`)
*Placed here because they are generic UI units that could be used anywhere in the application.*

- **StatCard.jsx**: A generic card for displaying metrics. Accepts `label`, `value`, `subtext`, and an optional `progress` bar. It has no knowledge of the dashboard context.
- **TaskItem.jsx**: Represents a single task row. Accepts a `task` object and handlers for toggle/delete. It focuses purely on rendering task data and interacting with it.

### Dashboard-Specific Components (`src/components/dashboard/`)
*Placed here because they are specific to the FocusForge dashboard layout and logic.*

- **DashboardHeader.jsx**: Renders the top navigation bar with the logo and user profile.
- **StatsRow.jsx**: Orchestrates multiple `StatCard` components to display the task overview (Total, Completed, Remaining, Progress).
- **AddTaskInput.jsx**: Manages the input field and button for creating new tasks.
- **TaskFilterBar.jsx**: Handles the UI for filtering (All/Active/Completed) and searching tasks.
- **TaskList.jsx**: Responsible for rendering the list of tasks. It handles the "Empty State" and maps over the filtered tasks using the `TaskItem` component.

## Decision Log & Props
- **State Ownership**: `DashboardPage.jsx` remains the "Single Source of Truth." It manages the `taskList`, `newTask` input, `filter`, and `searchQuery` state. This follows the "lifting state up" pattern, ensuring child components remain predictable and easy to test.
- **Prop Drilling**: Props are passed explicitly. For example, `TaskList` receives the filtered array and action handlers, then passes individual tasks to `TaskItem`. This keeps the flow of data transparent.
- **Decoupling**: By moving the stat card logic to a shared component, we can now easily add a "Monthly Stats" page or a mobile view without duplicating the styling or HTML structure.

## Scalability Considerations
If this application were 10x larger, I would consider:
1. **Context API / State Management**: As prop drilling deepens (e.g., if `TaskItem` had sub-components), I would use React Context or a library like Zustand to manage global state like user info or task data.
2. **Component Library**: The shared components would be moved to a dedicated internal library (perhaps using Storybook) to ensure design consistency across multiple teams.
3. **Advanced Hooks**: Extracting the task logic (add, toggle, delete) into a custom `useTasks` hook to keep the `DashboardPage` even leaner.
4. **CSS Modules / Styled Components**: Moving away from inline styles to a more robust styling solution for better theme support and performance.

## Live Deployed URL
[Link to your deployment here]
