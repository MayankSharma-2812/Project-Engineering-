import { useState, useEffect } from "react";

export default function FocusTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("Work"); // "Work" or "Break"

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);
      // Toggle mode
      if (mode === "Work") {
        setMode("Break");
        setSecondsLeft(5 * 60);
      } else {
        setMode("Work");
        setSecondsLeft(25 * 60);
      }
      setIsActive(false);
      alert(`${mode} session completed!`);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === "Work" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="focus-timer">
      <h3>{mode} Session</h3>
      <div className="timer-display">{formatTime(secondsLeft)}</div>
      <div className="timer-controls">
        <button onClick={toggleTimer}>{isActive ? "Pause" : "Start"}</button>
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}
