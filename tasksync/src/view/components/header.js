import React from 'react';
import './header.css';
import NotificationBell from './notificationBell';

const Header = ({ userId }) => {
    return (
        <header className="header">
          <div className="header-title">
            <h1>Welcome</h1>
          </div>
          <nav className="header-nav">
            <ul className="nav-links">
             <NotificationBell userId={userId} />
              <li><a href="#home">Home</a></li>
              <li><a href="#event-planning">Event Planning</a></li>
              <li><a href="#collaboration">Collaboration</a></li>
            </ul>
          </nav>
        </header>
      );
    };
export default Header;