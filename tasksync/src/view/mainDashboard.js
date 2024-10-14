import React, { useState, useEffect } from 'react';
import Sidebar from './components/sidebar';
import Header from './components/header';
import './mainDashboard.css';
import images from '../assets';

const fetchUserInfo = async (username) => {
  try {
    const response = await fetch(`/user/${username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user information');
    }
    const user = await response.json();
    console.log('Fetched User:', user); 
    return user;
  } catch (err) {
    console.error(err);
    return { username: '', email: '' };
  }
};

const MainDashboard = ({ username }) => {
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });

  useEffect(() => {
    const getUserInfo = async () => {
      const user = await fetchUserInfo(username);
      setUserInfo(user);
      console.log('Set User Info:', user); 
    };

    getUserInfo();
  }, [username]);

  console.log('User Info:', userInfo); 

  return (
    <div className="main-dashboard">
      <Sidebar userInfo={userInfo} />
      <div className="main-content">
        <Header />
        <div className="content">
          {/* Task List Section */}
          <section className="task-list-section">
            <div className="task">
              <div className="task-icon"></div>
              <div className="task-details">
                <h4>No Tasks Yet</h4>
                <p>Select the plus icon to add a task</p>
              </div>
              <div className="task-options">
                <button className="task-menu">...</button>
              </div>
            </div>
            {/* Add Task Button - Moved Here */}
            <div className="add-task-button">
              <button>
                <img src={images['plus.png']} alt="Add Task" />
              </button>
            </div>
          </section>

          {/* Friends Section */}
          <section className="friends-section">
            <h3>Friends</h3>
            <div className="friends-list">
              <div className="friend">
                <img src={images['defualtpf.jpg']} alt="Friend 1" />
              </div>
              <div className="friend">
                <img src="/path/to/friend2.png" alt="Friend 2" />
              </div>
              <div className="friend">
                <img src="/path/to/friend3.png" alt="Friend 3" />
              </div>
              <div className="friend">
                <img src="/path/to/friend4.png" alt="Friend 4" />
              </div>
              <div className="friend">
                <img src="/path/to/friend5.png" alt="Friend 5" />
              </div>
            </div>
            <div className="friend-buttons">
              <button className="add-new">Add New</button>
              <button className="show-all">Show All</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
