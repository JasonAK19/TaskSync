import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './inviteFriendsPopUp.css';

const InviteFriendsPopUp = ({ isOpen, onClose, onAddGroup, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        console.log('Fetching friends for user:', currentUser);
        const data = await Promise.race([
          axios.get(`http://localhost:3001/friends/${currentUser}`),
          axios.get(`http://localhost:3002/friends/${currentUser}`)
        ]);
        
        const friendsList = Array.isArray(data.data) ? data.data : [];
        console.log('Processed friends list:', friendsList);
        setFriends(friendsList);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
        console.error('Error details:', error.response?.data);
      }
    };

    if (currentUser) {
      fetchFriends();
    } else {
      console.warn('No currentUser provided to AddGroupPopUp');
    }
  }, [currentUser]);

  const handleUserSelect = (username) => {
    if (!selectedUsers.includes(username)) {
      setSelectedUsers([...selectedUsers, username]);
    }
    setSearchUser('');
    setShowDropdown(false);
  };

  const handleRemoveUser = (username) => {
    setSelectedUsers(selectedUsers.filter(user => user !== username));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      alert('Please add at least one friend to the group');
      return;
    }

    const groupData = {
      name: groupName,
      members: [...selectedUsers, currentUser],
      creator: currentUser
    };

    try {
      await onAddGroup(groupData);
      setGroupName('');
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchUser.toLowerCase()) &&
    !selectedUsers.includes(friend.username)
  );

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Invite Friends to Group</h2>
        
        <div className="add-users-section">
          <div className="user-search-container">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Add friends to group"
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="search-input"
              />
              <button 
                type="button"
                className={`dropdown-toggle ${showDropdown ? 'open' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
              />
            </div>

            <div className={`friends-dropdown ${showDropdown ? 'open' : ''}`}>
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => (
                  <div
                    key={friend._id}
                    className="friend-item"
                    onClick={() => handleUserSelect(friend.username)}
                  >
                    {friend.username}
                  </div>
                ))
              ) : (
                <div className="no-friends">No friends found</div>
              )}
            </div>
          </div>

          <div className="selected-users">
            {selectedUsers.map(username => (
              <span key={username} className="selected-user-tag">
                {username}
                <button 
                  type="button"
                  onClick={() => handleRemoveUser(username)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="popup-actions">
          <button onClick={handleSubmit} className="add-group-btn">
            Invite to Group
          </button>
          <button onClick={onClose} className="close-popup-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsPopUp;