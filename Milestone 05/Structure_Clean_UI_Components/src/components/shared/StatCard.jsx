// src/components/shared/StatCard.jsx
import React from 'react';

const StatCard = ({ label, value, subtext, color = "#e2e8f0", progress = null }) => {
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 14, padding: "20px 24px" }}>
      <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: color }}>
        {value}
      </div>
      {progress !== null ? (
        <div style={{ height: 4, background: "#2d2d44", borderRadius: 99, marginTop: 8 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          {subtext}
        </div>
      )}
    </div>
  );
};

export default StatCard;
