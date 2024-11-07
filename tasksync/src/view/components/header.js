import React from 'react';
import './header.css';
import PropTypes from 'prop-types';
import NotificationBell from './notificationBell';

const Header = ({ username, notifications, setNotifications, unreadCount, setUnreadCount }) => {
    return (
        <header className="header">
          <div className="header-title">
            <h1>Welcome</h1>
          </div>
          <nav className="header-nav">
            <ul className="nav-links">
             <NotificationBell 
             username={username}
             notifications={notifications} 
             setNotifications={setNotifications}
             unreadCount={unreadCount}
             setUnreadCount={setUnreadCount}
              />
              <li><a href="#home">Home</a></li>
              <li><a href="#event-planning">Event Planning</a></li>
              <li><a href="#collaboration">Collaboration</a></li>
            </ul>
          </nav>
        </header>
      );
    };

Header.propTypes = {
  username: PropTypes.string.isRequired
};
export default Header;