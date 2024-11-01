import React, { useState } from 'react';
import axios from 'axios';
import './friendRequestPopUp.css';

const FriendRequestPopUp = ({ isOpen, onClose, userId }) => {
  const [username, setUsername] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSendRequest = async () => {
    try {
      await axios.post('/friend-requests', { fromUserId: userId, toUsername: username });
      alert('Friend request sent!');
      setUsername('');
      onClose();
    } catch (err) {
      alert('Failed to send friend request: ' + err.response.data.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Send Friend Request</h2>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={handleUsernameChange}
          className="username-input"
        />
        <div className="popup-actions">
          <button className="send-request-btn" onClick={handleSendRequest}>Send Request</button>
          <button className="close-popup-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestPopUp;