// src/components/dashboard/TaskFilterBar.jsx
import React from 'react';

const TaskFilterBar = ({ filter, setFilter, searchQuery, setSearchQuery }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ 
              padding: "6px 16px", 
              borderRadius: 8, 
              border: "1px solid", 
              borderColor: filter === f ? "#6366f1" : "#2d2d44", 
              background: filter === f ? "rgba(99,102,241,0.15)" : "transparent", 
              color: filter === f ? "#a78bfa" : "#64748b", 
              fontSize: 13, 
              fontWeight: 500, 
              cursor: "pointer", 
              textTransform: "capitalize" 
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search tasks..."
        style={{ background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 10, padding: "8px 14px", color: "#e2e8f0", fontSize: 13, outline: "none", width: 200 }}
      />
    </div>
  );
};

export default TaskFilterBar;
