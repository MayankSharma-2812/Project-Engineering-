import React, { useState } from 'react';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // --- Actions ---
  const addTask = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      id: Date.now(),
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

  // --- Calculations ---
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const remainingCount = tasks.filter(t => !t.completed).length;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Task Manager</h1>
          <p style={styles.subtitle}>{remainingCount} tasks remaining</p>
        </header>

        {/* Input Section */}
        <form onSubmit={addTask} style={styles.inputGroup}>
          <input
            style={styles.input}
            type="text"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" style={styles.addButton}>Add</button>
        </form>

        {/* Filter Buttons */}
        <div style={styles.filterGroup}>
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {}),
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <ul style={styles.list}>
          {filteredTasks.map(task => (
            <li
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                ...styles.listItem,
                ...(task.completed ? styles.completedTask : {})
              }}
            >
              <div style={styles.checkbox}>
                {task.completed ? '✓' : ''}
              </div>
              {task.text}
            </li>
          ))}
          {filteredTasks.length === 0 && (
            <p style={styles.emptyState}>No tasks found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

// --- Styles ---
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: '450px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    padding: '30px',
    height: 'fit-content',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  title: {
    margin: '0',
    fontSize: '28px',
    color: '#2d3436',
  },
  subtitle: {
    margin: '5px 0 0',
    color: '#636e72',
    fontSize: '14px',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #dfe6e9',
    fontSize: '16px',
    outline: 'none',
  },
  addButton: {
    padding: '0 20px',
    backgroundColor: '#00b894',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  filterGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  filterBtn: {
    background: 'none',
    border: 'none',
    color: '#636e72',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '5px 10px',
    borderRadius: '5px',
  },
  filterBtnActive: {
    backgroundColor: '#f1f2f6',
    color: '#2d3436',
    fontWeight: 'bold',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #f1f2f6',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontSize: '16px',
    color: '#2d3436',
  },
  completedTask: {
    textDecoration: 'line-through',
    color: '#b2bec3',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #dfe6e9',
    marginRight: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#00b894',
  },
  emptyState: {
    textAlign: 'center',
    color: '#b2bec3',
    marginTop: '20px',
  }
};

export default App;