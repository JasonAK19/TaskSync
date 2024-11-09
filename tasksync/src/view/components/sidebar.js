import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import AddGroupPopUp from './addGroupPopUp.js';
import images from '../../assets';
import myGroupsIcon from '../../assets/myGroups.png';
import './sidebar.css';

const Sidebar = ({ userInfo = {}, onLogout, onOpenAddGroupPopUp, groups = [], setGroups }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for the popup
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const fetchGroups = async () => {
      
      try {
        const response = await axios.get(`/api/user/${userInfo.username}/groups`);
        console.log('API Response:', response.data); // Log the API response
        setGroups(response.data.groups || []);
        console.log('Groups state:', response.data.groups || []); // Log the updated state
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };

    if (userInfo.username) {
      fetchGroups();
    }
  }, [userInfo.username, setGroups]);

  const handleAddGroup = (groupName) => {
    setGroups([...groups, { name: groupName }]);
  };

  const handleGroupClick = (group) => {
    if (group && group._id) {
      navigate(`/group/${group._id}`);
    }
  };

  return (
    <div className="Sidebar">
      <div className="profile-section">
        <img src={images['defaultpf.jpg']} alt="Profile" className="profile-picture" />
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

        <button className="menu-item" onClick={onOpenAddGroupPopUp}>
          <img src={images['createGroups.png']} alt="task" className="menu-icon" /> Create Group
        </button>

        <button className="menu-item">
          <img src={images['merge.png']} alt="merge" className="menu-icon" /> Merge Schedules
        </button>
        
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
                <li key={index} className="group-item" onClick={() => handleGroupClick(group)}>
                  {group.name}
                </li>
              ))
            ) : (
              <li className="group-item no-groups">You don't have any groups yet</li>
            )}
          </ul>
        </div>
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