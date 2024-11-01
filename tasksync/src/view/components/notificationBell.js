import React, { useState, useEffect } from 'react';
import axios from 'axios';
import images from '../../assets';
import './notificationBell.css';

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/notifications/${userId}`);
        setNotifications(response.data);
        setUnreadCount(response.data.filter(notification => !notification.read).length);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(`/friend-requests/${userId}`);
        setFriendRequests(response.data);
      } catch (err) {
        console.error('Failed to fetch friend requests:', err);
      }
    };

    fetchNotifications();
    fetchFriendRequests();
  }, [userId]);

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      ));
      setUnreadCount(unreadCount - 1);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`/friend-requests/${requestId}`, { status: 'accepted' });
      setFriendRequests(friendRequests.filter(request => request._id !== requestId));
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await axios.put(`/friend-requests/${requestId}`, { status: 'declined' });
      setFriendRequests(friendRequests.filter(request => request._id !== requestId));
    } catch (err) {
      console.error('Failed to decline friend request:', err);
    }
  };

  return (
    <div className="notification-bell">
      <img src={images["notification.png"]} alt="notification" onClick={handleBellClick} className="notification-icon" />
      {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      {isDropdownOpen && (
        <div className="notification-dropdown">
          {notifications.map(notification => (
            <div key={notification._id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <p>{notification.message}</p>
              {!notification.read && <button onClick={() => markAsRead(notification._id)}>Mark as read</button>}
            </div>
          ))}
          {friendRequests.map(request => (
            <div key={request._id} className="friend-request-item">
              <p>Friend request from {request.fromUserId}</p>
              <button onClick={() => handleAcceptRequest(request._id)}>Accept</button>
              <button onClick={() => handleDeclineRequest(request._id)}>Decline</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;