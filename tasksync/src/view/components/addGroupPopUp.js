import React, { useState } from 'react';
import './addGroupPopUp.css';

const AddGroupPopUp = ({ isOpen, onClose, onAddGroup }) => {
  const [groupName, setGroupName] = useState('');

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleAddGroup = () => {
    if (groupName.trim()) {
      onAddGroup(groupName);
      setGroupName('');
      onClose(); // Close the popup after adding the group
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Create a New Group</h2>
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={handleGroupNameChange}
          className="group-name-input"
        />
        <div className="popup-actions">
          <button className="add-group-btn" onClick={handleAddGroup}>Add Group</button>
          <button className="close-popup-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupPopUp;