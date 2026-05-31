import { useState } from "react";
import tasks from "../data/tasks";

// Dashboard Components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsRow from "../components/dashboard/StatsRow";
import AddTaskInput from "../components/dashboard/AddTaskInput";
import TaskFilterBar from "../components/dashboard/TaskFilterBar";
import TaskList from "../components/dashboard/TaskList";

export default function DashboardPage() {
  const [taskList, setTaskList] = useState(tasks);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTaskList([
      ...taskList,
      {
        id: Date.now(),
        title: newTask,
        completed: false,
        priority: "medium",
        tag: "general",
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTaskList(
      taskList.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    setTaskList(taskList.filter((t) => t.id !== id));
  };

  const filtered = taskList
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const completedCount = taskList.filter((t) => t.completed).length;
  const totalCount = taskList.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#e2e8f0", fontFamily: "sans-serif" }}>
      
      <DashboardHeader />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        
        <StatsRow 
          totalCount={totalCount} 
          completedCount={completedCount} 
          progressPercent={progressPercent} 
        />

        <AddTaskInput 
          newTask={newTask} 
          setNewTask={setNewTask} 
          onAddTask={addTask} 
        />

        <TaskFilterBar 
          filter={filter} 
          setFilter={setFilter} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <TaskList 
          tasks={filtered} 
          onToggleTask={toggleTask} 
          onDeleteTask={deleteTask} 
        />

      </div>
    </div>
  );
}
