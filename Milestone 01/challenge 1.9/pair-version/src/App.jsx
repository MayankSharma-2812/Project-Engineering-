import React, { useState, useEffect } from 'react';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // --- Core Functionality ---
  
  const addTask = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      text: inputValue,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // --- Computed State ---

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const remainingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="app-container">
      <header>
        <h1>TaskFlow</h1>
        <div className="subtitle">{remainingCount} tasks remaining</div>
      </header>

      {/* 1. Add a task feature */}
      <form onSubmit={addTask} className="input-section">
        <input
          type="text"
          placeholder="New task..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="add-btn">Add</button>
      </form>

      {/* 3. Filter feature */}
      <div className="filter-group">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* 2. Mark complete feature */}
      <ul className="task-list">
        {filteredTasks.map(task => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="custom-checkbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="task-text">{task.text}</span>
          </li>
        ))}
        {filteredTasks.length === 0 && (
          <div className="empty-state">No tasks to show.</div>
        )}
      </ul>
      
      {/* 4. Task count feature is included in the header */}
    </div>
  );
};

export default App;
