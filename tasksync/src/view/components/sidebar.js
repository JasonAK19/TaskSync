import React from 'react';
import images from '../../assets';
import './sidebar.css';



const Sidebar = ({ userInfo, onLogout }) => {
  console.log('Sidebar User Info:', userInfo);

  return (
    <div className="Sidebar">
      <div className="profile-section">
        <img src={images['defualtpf.jpg']} alt="Profile" className="profile-picture" />
        <span className="username">{userInfo?.username}</span>
      </div>

      <button className="edit-profile-btn">Edit profile</button>

      <div className="menu">
        <button className="menu-item">
          <img src={images['calendar.png']} alt="calendar" className="menu-icon" /> Open Full Calendar
        </button>

        <button className="menu-item">
          <img src={images['memo.png']} alt="task" className="menu-icon" /> Create Event
        </button>

        <button className="menu-item">
          <img src={images['merge.png']} alt="merge" className="menu-icon" /> Merge Schedules
        </button>
      </div>

      <div className="bottom-menu">
        <button className="menu-item">
          <img src={images['setting.png']} alt="settings" className="menu-icon" /> Settings
        </button>
        <button className="menu-item" onClick={onLogout}>
          <img src={images['signout.png']} alt="logout" className="menu-icon" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;