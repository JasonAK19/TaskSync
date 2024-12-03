import React from 'react';
import './friendsListPopUp.css';
import images from '../../assets';
const FriendsListPopUp = ({ isOpen, onClose, friends, onRemoveFriend}) => {
  if (!isOpen) return null;

  return (
    <div className="friends-list-popup-overlay">
      <div className="friends-list-popup">
        <div className="friends-list-header">
          <h2>All Friends</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="friends-list-content">
          {friends.length === 0 ? (
            <p className="no-friends">No friends added yet.</p>
          ) : (
            <div className="friends-grid">
              {friends.map(friend => (
                <div key={friend._id} className="friend-item">
                  <img 
                    src={friend.profilePicture || images['defaultpf.jpg']} 
                    alt={friend.username} 
                    className="friend-avatar"
                  />
                  <span className="friend-name">{friend.username}</span>
                    <button 
                        className="remove-friend-btn"
                        onClick={() => onRemoveFriend(friend.username)}
                    >
                        Remove Friend
                    </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsListPopUp;