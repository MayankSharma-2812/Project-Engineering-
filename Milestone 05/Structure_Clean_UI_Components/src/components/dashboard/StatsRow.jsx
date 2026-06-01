// src/components/dashboard/StatsRow.jsx
import React from 'react';
import StatCard from '../shared/StatCard';

const StatsRow = ({ totalCount, completedCount, progressPercent }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
      <StatCard 
        label="Total Tasks" 
        value={totalCount} 
        subtext="All time" 
      />
      <StatCard 
        label="Completed" 
        value={completedCount} 
        subtext="Done ✓" 
        color="#22c55e" 
      />
      <StatCard 
        label="Remaining" 
        value={totalCount - completedCount} 
        subtext="To do" 
        color="#f59e0b" 
      />
      <StatCard 
        label="Progress" 
        value={`${progressPercent}%`} 
        color="#6366f1" 
        progress={progressPercent} 
      />
    </div>
  );
};

export default StatsRow;
