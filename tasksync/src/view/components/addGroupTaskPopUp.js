import React, { useState } from "react";
import "./addTaskPopUp.css";

const AddGroupTaskPopup = ({ isOpen, closeModal, onSave, groupMembers }) => {
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
  const [assignedTo, setAssignedTo] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    const task = {
      title: taskTitle,
      description: taskDescription,
      time: taskTime,
      date: new Date(taskDate).toISOString().split('T')[0],
      assignedTo: assignedTo
    };
    onSave(task);
    setTaskTitle("");
    setTaskDescription("");
    setTaskTime(getCurrentTime());
    setTaskDate(getCurrentDate());
    setAssignedTo("");
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
        <h2>Add Group Task</h2>

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

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="assign-select"
          >
            <option value="">Assign to...</option>
            {groupMembers.map(member => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Add description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!taskTitle || !assignedTo}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupTaskPopup;