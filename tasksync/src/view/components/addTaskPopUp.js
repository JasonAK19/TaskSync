import React, { useState } from "react";
import "./addTaskPopUp.css"; // Updated CSS file name

const AddTaskPopUp = ({ isOpen, closeModal }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTime, setTaskTime] = useState("12:30");
  const [taskDate, setTaskDate] = useState("2024-10-14");
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    console.log("Task saved:", { taskTitle, taskDescription, taskTime, taskDate });
    closeModal(); 
  };

  const handleTimeChange = (time) => {
    setTaskTime(time);
    setShowTimePicker(false);
  };

  if (!isOpen) return null; 
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h2>Add Task</h2>

        <div className="task-details">
          <input
            type="text"
            placeholder="Add title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="task-title-input" 
          />

          <div className="date-time">
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
            />
            <input
              type="text"
              value={taskTime}
              onClick={() => setShowTimePicker(true)}
              readOnly
            />
            {showTimePicker && (
              <div className="time-picker">
                {Array.from({ length: 24 }, (_, hour) =>
                  Array.from({ length: 2 }, (_, half) => (
                    <div
                      key={`${hour}:${half * 30}`}
                      className="time-option"
                      onClick={() => handleTimeChange(`${String(hour).padStart(2, '0')}:${half === 0 ? '00' : '30'}`)}
                    >
                      {`${String(hour).padStart(2, '0')}:${half === 0 ? '00' : '30'}`}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <textarea
            placeholder="Add description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskPopUp;