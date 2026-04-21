export default function ProgressTracker({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="progress-tracker">
      <h3>Today's Progress</h3>
      <div className="progress-stats">
        <span>{completedTasks} of {totalTasks} tasks completed</span>
        <span>{progressPercentage}%</span>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
