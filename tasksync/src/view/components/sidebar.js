import React from 'react';
import images from '../../assets';
import './sidebar.css';

const Sidebar = () => {
  return (
    <div className="Sidebar">
        <div className="profile-section">
        <img src={images['defualtpf.jpg']} alt="Profile" className="profile-picture" />
        <span className="username">Username</span>
      </div>
      <div className="menu">
        <button className="menu-item">
            <img src={images['calendar.png']} alt="calendar" className="menu-icon" />
          <i className="fa fa-calendar"></i> Open Full Calendar
        </button>
        <button className="menu-item">
            <img src={images['memo.png']} alt="task" className="menu-icon" />
          <i className="fa fa-plus"></i> Create Event
        </button>
        <button className="menu-item">
          <i className="fa fa-tasks"></i> Merge Task
        </button>
      </div>

      <div className="bottom-menu">
        <button className="menu-item">
          <i className="fa fa-cog"></i>Settings
        </button>
        <button className="menu-item">Sign Out</button>
      </div>
    </div>
  );
};

export default Sidebar;