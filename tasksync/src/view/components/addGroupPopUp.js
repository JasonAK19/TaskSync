import React, { useState } from 'react';
import './addGroupPopUp.css';

const AddGroupPopUp = ({ isOpen, onClose, onAddGroup, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleAddGroup = async () => {
    if (groupName.trim()) {
      const newGroup = {
        name: groupName,
        creator: currentUser,
        members: [...selectedUsers, currentUser],
        createdAt: new Date()
      };
      
      await onAddGroup(newGroup);
      setGroupName('');
      setSelectedUsers([]);
      onClose();
    }
  };

  const handleAddUser = () => {
    if (searchUser && !selectedUsers.includes(searchUser)) {
      setSelectedUsers([...selectedUsers, searchUser]);
      setSearchUser('');
    }
  };

  const removeUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter(user => user !== userToRemove));
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
        
        <div className="add-users-section">
          <input
            type="text"
            placeholder="Add user by username"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="user-search-input"
          />
          <button onClick={handleAddUser} className="add-user-btn">Add User</button>
        </div>

        <div className="selected-users">
          {selectedUsers.map(user => (
            <div key={user} className="selected-user-tag">
              {user}
              <button onClick={() => removeUser(user)}>&times;</button>
            </div>
          ))}
        </div>

        <div className="popup-actions">
          <button className="add-group-btn" onClick={handleAddGroup}>Create Group</button>
          <button className="close-popup-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupPopUp;