// FriendRequestPopUp.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import './friendRequestPopUp.css';

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5
});

// Add error handling
socket.on('connect_error', (error) => {
  console.log('Socket connection error:', error);
});

const FriendRequestPopUp = ({ isOpen, onClose, currentUser }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on('friendRequest', (friendRequest) => {
      alert(`New friend request from ${friendRequest.fromUserId}`);
    });
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setError(null);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    
    // Input validation
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to send friend requests');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add validation logging
      console.log('Attempting to send request with:', {
        currentUser,
        targetUsername: username
      });
  
      // Validate currentUser
      if (!currentUser?.username) {
        throw new Error('Current user session not found');
      }
  
      const response = await axios.post('http://localhost:3001/friend-requests', { 
        fromUsername: currentUser.username, 
        toUsername: username.trim() 
      });
  
      console.log('Friend request response:', response.data);
      alert('Friend request sent!');
      setUsername('');
      onClose();
    } catch (err) {
      console.error('Friend request error:', err);
      alert(err.message || 'Failed to send friend request');
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

FriendRequestPopUp.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired
  }).isRequired
};

export default FriendRequestPopUp;