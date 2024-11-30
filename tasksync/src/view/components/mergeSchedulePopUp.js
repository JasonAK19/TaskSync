import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './mergeSchedulePopUp.css';

const MergeSchedulePopUp = ({ isOpen, onClose, currentUser, onMerge }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [shareType, setShareType] = useState('task');

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
    }
  }, [currentUser]);

  
  const handleMerge = async () => {
    if (selectedFriend && shareType) {
      try {
        await axios.post('/api/merge-schedules', { username: currentUser, friend: selectedFriend, type: shareType });
        onMerge(selectedFriend, shareType);
        onClose();
      } catch (error) {
        console.error('Failed to merge schedules:', error);
        alert('Failed to merge schedules. Please try again.');
      }
    } else {
      alert('Please select a friend and a share type.');
    }
  };
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Merge Schedules</h2>
        <div className="form-group">
          <label>Select Friend</label>
          <select value={selectedFriend} onChange={(e) => setSelectedFriend(e.target.value)}>
            <option value="">Select a friend</option>
            {friends.map(friend => (
              <option key={friend._id} value={friend.username}>{friend.username}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Share Type</label>
          <select value={shareType} onChange={(e) => setShareType(e.target.value)}>
            <option value="task">Task</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div className="popup-actions">
          <button onClick={handleMerge} className="merge-btn">Merge</button>
          <button onClick={onClose} className="close-popup-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MergeSchedulePopUp;