import React, { useState, useEffect } from "react";
import "./addTaskPopUp.css"; 

const AddTaskPopUp = ({ isOpen, closeModal, onSave }) => {

  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; 
  };

  const getCurrentTime = () => {
    const date = new Date();
    return date.toTimeString().split(' ')[0].slice(0, 5); 
  };


  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTime, setTaskTime] = useState(getCurrentTime());
  const [taskDate, setTaskDate] = useState(getCurrentDate());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState(""); //state for error message

  useEffect(() => {
    if (isOpen) {
      setError(""); // Clear error message when the modal opens
      setTaskTitle(""); // Clear task title
      setTaskDescription(""); // Clear task description
      setTaskTime(getCurrentTime()); // Reset time
      setTaskDate(getCurrentDate()); // Reset date
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!taskTitle.trim()) {
      setError("Please Enter a Valid Task Title."); //setting error message
      return;
    }

    const task = {
      title: taskTitle,
      description: taskDescription,
      time: taskTime,
      date: taskDate,
    };
    onSave(task);
    setTaskTitle("");
    setTaskDescription("");
    setTaskTime(taskTime);
    setTaskDate(taskDate);
  };

  const handleTimeChange = (time) => {
    setTaskTime(time);
    setShowTimePicker(false);
  };

  const toggleTimePicker = () => {
    setShowTimePicker(prevState => !prevState);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
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
                value={formatTime(taskTime)}
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
                      {formatTime(`${String(hour).padStart(2, '0')}:${half === 0 ? '00' : '30'}`)}
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

          