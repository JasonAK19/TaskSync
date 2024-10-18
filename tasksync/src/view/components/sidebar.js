import React, { useState } from 'react';
import images from '../../assets';
import myGroupsIcon from '../../assets/myGroups.png';
import './sidebar.css';
import AddGroupPopUp from './addGroupPopUp.js';

const Sidebar = ({ userInfo, onLogout }) => {
  console.log('Sidebar User Info:', userInfo);

  const [groups, setGroups] = useState([
    { name: 'Study Group' },
    { name: 'Project Team' },
    { name: 'Fitness Buddies' },
    { name: 'Book Club' },
    { name: 'Gaming Friends' },
  ]);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for the popup

  const handleAddGroup = (groupName) => {
    setGroups([...groups, { name: groupName }]);
  };

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

        <button className="menu-item" onClick={() => setIsPopupOpen(true)}>
          <img src={images['createGroups.png']} alt="task" className="menu-icon" /> Create Group
        </button>

        <button className="menu-item">
          <img src={images['merge.png']} alt="merge" className="menu-icon" /> Merge Schedules
        </button>
      </div>

      {/* Group Section */}
      <div className="group-section-box">
        <div className="group-section">
          <h4 className="group-title">
            <img src={myGroupsIcon} alt="My Groups" className="group-icon" /> 
            Your Groups
          </h4>
          <ul className={`group-list ${groups.length > 4 ? 'scrollable' : ''}`}>
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <li key={index} className="group-item">
                  {group.name}
                </li>
              ))
            ) : (
              <li className="group-item no-groups">No groups yet</li>
            )}
          </ul>
        </div>
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

      {isPopupOpen && (
        <AddGroupPopUp
          onClose={() => setIsPopupOpen(false)}
          onAddGroup={handleAddGroup}
        />
      )}
    </div>
  );
};

export default Sidebar;