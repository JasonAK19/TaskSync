import React, { useState, useEffect } from "react";
import moment from 'moment-timezone';
import "./editTaskPopUp.css";

const EditGroupTaskPopup = ({ isOpen, closeModal, onSave, onDelete, groupMembers, task }) => {
  

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskTime(task.time);
      const formattedDate = task.date
      ? moment.tz(task.date, 'America/New_York').format('YYYY-MM-DD') // Convert to EST
      : '';
      setTaskDate(formattedDate);
      setAssignedTo(task.assignedTo)
    }
  }, [task, isOpen]);


  const handleSave = () => {
    const updatedTask = {
      title: taskTitle,
      description: taskDescription,
      time: taskTime,
      date: moment.tz(taskDate, 'America/New_York').utc().format(), 
      assignedTo: assignedTo
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
        <h2>Edit Group Task</h2>

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
            placeholder="Edit description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!taskTitle || !assignedTo}>
            Save
          </button>

          <button 
          className="delete-btn" 
          onClick={() => handleDelete(task._id)}
          disabled={!taskTitle || !assignedTo}>
            Delete Task
          </button>

        </div>
      </div>
    </div>
  );
};

export default EditGroupTaskPopup;