import React, { useState, useEffect } from "react";
import "./editTaskPopUp.css";

const EditTaskPopUp = ({ isOpen, closeModal, onSave, onDelete, task }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskTime(task.time);
      setTaskDate(task.date);
      setError("");
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (!taskTitle.trim()) {
      setError("Please Enter a Valid Task Title.");
      return;
    }
    const updatedTask = {
      title: taskTitle,
      description: taskDescription,
      time: taskTime,
      date: taskDate,
    };
    onSave(updatedTask);
    closeModal(); 
  };

  const handleDelete = () => {
    onDelete(task._id);
    closeModal();
  };

  const handleTimeChange = (time) => {
    setTaskTime(time);
    setShowTimePicker(false);
  };

  const toggleTimePicker = () => {
    setShowTimePicker(prevState => !prevState);
  };

  if (!isOpen) return null; 

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h2>Edit Task</h2>

        <div className="task-details">
          <input
            type="text"
            placeholder="Edit Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="task-title-input" 
          />
          
          {error && <p className="error-message">{error}</p>}

          <div className="date-time">
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
            />
            <div className="time-input-container">
              <input
                type="text"
                value={taskTime}
                onClick={toggleTimePicker}
                readOnly
              />
              <span className="clock-icon" onClick={toggleTimePicker}>🕒</span>
            </div>
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
            placeholder="Edit Description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <button className="save-btn" onClick={handleSave}>
            Save
          </button>

          <button className="delete-btn" onClick={() => handleDelete(task._id)}>
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskPopUp;
