import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import images from '../../assets';
import './notificationBell.css';

const socket = io(window.location.port === '3001' ? 'http://localhost:3001' : 'http://localhost:3002', {
  transports: ['websocket', 'polling'],
  reconnection: true
});

const NotificationBell = ({ username }) => {
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ws, setWs] = useState(null);

  const connectWebSocket = useCallback(() => {
    const websocket = new WebSocket(`ws://localhost:8080?username=${username}`);

    websocket.onopen = () => {
      console.log('WebSocket connection established for notifications');
    };

    websocket.onmessage = async (event) => {
      try {
        let data;
        if (event.data instanceof Blob) {
          data = JSON.parse(await event.data.text());
        } else {
          data = JSON.parse(event.data);
        }

        // Handle new notification
        if (data.type === 'notification') {
          setNotifications(prev => {
            // Check if notification already exists
            const exists = prev.some(n => n._id === data.notification._id);
            if (!exists) {
              // Update unread count
              setUnreadCount(prevCount => prevCount + 1);
              // Add new notification to the list
              return [data.notification, ...prev];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed, attempting to reconnect...');
      setTimeout(connectWebSocket, 3000);
    };

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [username]);

  useEffect(() => {
    if (!username) {
      console.log('No username provided');
      return;
    }

    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications for username:', username);
        const response = await axios.get(`/api/notifications/${username}`);
        console.log('Received notifications:', response.data);
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    connectWebSocket();

    
    return () => {
      if (ws) {
        ws.close();
      }
    };
   

  }, [username, connectWebSocket]);

  const handleFriendRequest = async (requestId, action) => {
    try {
      console.log('Handling friend request:', requestId, action);
        
      // Update friend request status
      await axios.put(`/friend-requests/${requestId}`, { status: action });
        
      // Find the notification
      const notificationToDelete = notifications.find(n => n.requestId === requestId);
      if (notificationToDelete && notificationToDelete._id) {
        // Update notification in database
        await axios.put(`/api/notifications/${notificationToDelete._id}`, {
          handled: true,
          read: true
        });
        
        // Update local state immediately
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n._id === notificationToDelete._id 
              ? { ...n, handled: true, read: true }
              : n
          )
        );
  
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
  
      setIsDropdownOpen(false);
  
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
    }
  };

  const handleGroupInvite = async (groupId, action) => {
    try {
      console.log('Handling group invite:', groupId, action);
      
      // Update group membership status
      await axios.put(`/api/groups/${groupId}/members`, {
        action: action,
        userId: username
      });
      
      // Find and update the notification
      const notificationToDelete = notifications.find(n => n.groupId === groupId);
      if (notificationToDelete && notificationToDelete._id) {
        // Mark as handled in the database
        await axios.put(`/api/notifications/${notificationToDelete._id}`, {
          handled: true,
          read: true
        });
        
        // Update local state
        setNotifications(notifications.map(n => 
          n._id === notificationToDelete._id 
            ? { ...n, handled: true, read: true }
            : n
        ));
        
        // Update unread count if needed
        if (!notificationToDelete.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      
      setIsDropdownOpen(false);
  
    } catch (error) {
      console.error(`Failed to ${action} group invite:`, error);
    }
  };

  return (
    <div className="notification-bell">
      <div className="bell-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <img 
          src={images["notification.png"]} 
          alt="Notifications" 
          className="notification-icon"
        />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {isDropdownOpen && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="no-notifications">No notifications</div>
          ) : (
            notifications
              .filter(notification => !notification.handled)
              .map((notification) => (
                <div key={notification._id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {notification.type === 'friendRequest' && !notification.handled && (
                    <div className="friend-request-actions">
                      <button 
                        onClick={() => handleFriendRequest(notification.requestId, 'accepted')}
                        className="accept-btn">Accept</button>
                      <button 
                        onClick={() => handleFriendRequest(notification.requestId, 'declined')}
                        className="decline-btn">Decline</button>
                    </div>
                  )}
                  {notification.type === 'groupInvite' && !notification.handled && (
                    <div className="friend-request-actions">
                      <button 
                        onClick={() => handleGroupInvite(notification.groupId, 'accepted')}
                        className="accept-btn">Join</button>
                      <button 
                        onClick={() => handleGroupInvite(notification.groupId, 'declined')}
                        className="decline-btn">Decline</button>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

NotificationBell.propTypes = {
  username: PropTypes.string.isRequired
};

export default NotificationBell;