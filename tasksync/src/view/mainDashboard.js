import React, { useState, useEffect } from 'react';
import Sidebar from './components/sidebar';
import Header from './components/header';
import AddTaskPopUp from './components/addTaskPopUp';
import EditTaskPopUp from "./components/editTaskPopUp";
import AddGroupPopUp from './components/addGroupPopUp'; 
import FriendRequestPopUp from './components/friendRequestPopUp';

import axios from 'axios';
import './mainDashboard.css';
import images from '../assets';

const fetchUserInfo = async (username) => {
  try {
    const response = await fetch(`/user/${username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user information');
    }
    const user = await response.json();
    return user;
  } catch (err) {
    console.error(err);
    return { username: '', email: '' };
  }
};

const fetchTasks = async (username) => {
  try {
    const response = await axios.get(`/tasks/${username}`);
    return response.data;
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    return [];
  }
};

const fetchFriends = async (username) => {
  try {
    const response = await axios.get(`/friends/${username}`);
    return response.data;
  } catch (err) {
    console.error('Failed to fetch friends list:', err);
    return [];
  }
};

const MainDashboard = ({ username, userId, onLogout }) => {
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isAddTaskPopUpOpen, setIsAddTaskPopUpOpen] = useState(false);
  const [isEditTaskPopUpOpen, setIsEditTaskPopUpOpen] = useState(false);
  const [isAddGroupPopUpOpen, setIsAddGroupPopUpOpen] = useState(false); // State for AddGroupPopUp
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [dropdownVisible, setTaskMenuVisible] = useState(null);
  const [isFriendRequestPopUpOpen, setIsFriendRequestPopUpOpen] = useState(false);


  useEffect(() => {
    const getUserInfo = async () => {
      const user = await fetchUserInfo(username);
      setUserInfo(user);
    };

    const getTasks = async () => {
      const tasks = await fetchTasks(username);
      setTasks(tasks);
    };

    const getFriends = async () => {
      const friends = await fetchFriends(username);
      setFriends(friends);
    };

    getUserInfo();
    getTasks();
    getFriends();
  }, [username]);

  const handleAddTask = async (task) => {
    try {
      const response = await axios.post('/tasks', { username, task });
      setTasks([...tasks, { ...task, _id: response.data.taskId }]);
      setIsAddTaskPopUpOpen(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleAddGroup = (groupName) => {
    setIsAddGroupPopUpOpen(false);
  };

  const openEditTaskPopup = (task) => {
    setTaskToEdit(task);
    setIsEditTaskPopUpOpen(true);
  };

  const handleEditTask = async (taskId, updatedTask) => {
    try {
      const response = await axios.put(`/tasks/${taskId}`, updatedTask);
      if (response.status === 200) {
        const updatedTasks = tasks.map(task =>
          task._id === taskId ? { ...task, ...updatedTask } : task
        );
        setTasks(updatedTasks);
        setIsEditTaskPopUpOpen(false);
      }
    } catch (err) {
      console.error('Error details:', err.response);
    }
  };

  const handleDelete = async (taskId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this task?");
    if (!isConfirmed) return;
    try {
      const response = await axios.delete(`/tasks/${taskId}`);
      if (response.status === 200) {
        const updatedTasks = tasks.filter(task => task._id !== taskId);
        setTasks(updatedTasks);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const toggleTaskMenu = (taskId) => {
    setTaskMenuVisible(dropdownVisible === taskId ? null : taskId);
  };

  return (
    <div className="main-dashboard">
      <Sidebar userInfo={userInfo} onLogout={onLogout} onOpenAddGroupPopUp={() => setIsAddGroupPopUpOpen(true)} />
      <div className="main-content">
        <Header />
        <div className="content">
          <section className="task-list-section">
            {tasks.length === 0 ? (
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
            ) : (
              tasks.map(task => (
                <div key={task._id} className="task">
                  <div className="task-icon"></div>
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                  </div>
                  <div className="task-options">
                    <button onClick={() => toggleTaskMenu(task._id)} className="task-menu">...</button>
                      {dropdownVisible === task._id && (
                        <div className="dropdown-menu">
                          <button onClick={() => openEditTaskPopup(task)}>Edit</button>
                          <button onClick={() => handleDelete(task._id)}>Delete</button>
                        </div>
                      )}
                  </div>
                </div>
              ))
            )}
            <div className="add-task-button">
              <button onClick={() => setIsAddTaskPopUpOpen(true)}>
                <img src={images['plus.png']} alt="Add Task" />
              </button>
            </div>
          </section>

          {/* Friends Section */}
          <section className="friends-section">
            <h3>Friends</h3>
            <div className="friends-list">
              {friends.length === 0 ? (
                <p>No friends added yet.</p>
              ) : (
                friends.map(friend => (
                  <div key={friend._id} className="friend">
                    <img src={friend.profilePicture || images['defaultpf.jpg']} alt={friend.name} />
                  </div>
                ))
              )}
            </div>
            <div className="friend-buttons">
            <button className="add-new" onClick={() => setIsFriendRequestPopUpOpen(true)}>Add New</button>
              <button className="show-all">Show All</button>
            </div>
          </section>
        </div>
      </div>

      {/* Add Task Popup */}
      <AddTaskPopUp isOpen={isAddTaskPopUpOpen} closeModal={() => setIsAddTaskPopUpOpen(false)} onSave={handleAddTask} />
      
      {/* Edit Task Popup */}
      <EditTaskPopUp isOpen={isEditTaskPopUpOpen} closeModal={() => setIsEditTaskPopUpOpen(false)} onSave={(updatedTask) => handleEditTask(taskToEdit._id, updatedTask)} onDelete={() => handleDelete(taskToEdit._id)} task={taskToEdit} />

      {/* Add Group Popup */}
      <AddGroupPopUp isOpen={isAddGroupPopUpOpen} onClose={() => setIsAddGroupPopUpOpen(false)} onAddGroup={handleAddGroup} />
      
      {/* Friend Request Popup */}
      <FriendRequestPopUp isOpen={isFriendRequestPopUpOpen} onClose={() => setIsFriendRequestPopUpOpen(false)} userId={userId} />
    </div>
  );
};

export default MainDashboard;