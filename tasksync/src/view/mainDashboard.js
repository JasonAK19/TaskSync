import React, { useState, useEffect } from 'react';

import Sidebar from './components/sidebar';
import Header from './components/header';
import AddTaskPopUp from './components/addTaskPopUp';
import EditTaskPopUp from "./components/editTaskPopUp";
import AddGroupPopUp from './components/addGroupPopUp'; 
import FriendRequestPopUp from './components/friendRequestPopUp';
import CompactCalendar from './components/compactCalendar';
import EventPopUp from './components/eventPopUp';
import axios from 'axios';
import './mainDashboard.css';
import images from '../assets';

const fetchFromMultipleInstances = async (endpoints) => {
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to fetch from ${endpoint}:`, error);
    }
  }
  throw new Error('All instances failed');
};

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
    const data = await fetchFromMultipleInstances([
      `http://localhost:3001/friends/${username}`,
      `http://localhost:3002/friends/${username}`
    ]);
    return data;
  } catch (err) {
    console.error('Failed to fetch friends list:', err);
    return [];
  }
};

const fetchGroups = async (username) => {
  try {
    const response = await axios.get(`/api/user/${username}/groups`);
    console.log('Dashboard API Response:', response.data);
    return response.data.groups || [];
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return [];
  }
};

const fetchEvents = async (username) => {
  try {
    const response = await axios.get(`/api/events/${username}`);
    console.log('Events:', response.data);
    return response.data;
  } catch (err) {
    console.error('Failed to fetch events:', err);
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
  const [groups, setGroups] = useState([]);
  const [isEventPopUpOpen, setIsEventPopUpOpen] = useState(false);
  const [events, setEvents] = useState([]);


  useEffect(() => {

    if (!username) return;

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

    const getGroups = async () => {
      const groups = await fetchGroups(username);
      setGroups(groups);
    };
    
    const getEvents = async () => {
      const events = await fetchEvents(username);
      setEvents(events);
    };

    if (username) {
      getGroups();
    }
    getUserInfo();
    getTasks();
    getFriends();
    getEvents();
  }, [username]);

  const handleAddTask = async (task) => {
    try {
      const response = await axios.post('/tasks', { username, task });
      setTasks([...tasks, { ...task, _id: response.data.taskId, startDate: task.startDate, endDate: task.endDate }]);
      setIsAddTaskPopUpOpen(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };
  
  const handleAddGroup = async (groupData) => {
    try {
      const response = await axios.post('/api/groups', groupData);
      setGroups([...groups, response.data.group]);
      setIsAddGroupPopUpOpen(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
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

  const handleSaveEvent = async (eventData) => {
    try {
      const response = await axios.post('/api/events', { ...eventData, createdBy: userId });
      setEvents([...events, response.data]);
      setIsEventPopUpOpen(false);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  return (
    <div className="main-dashboard">
      <Sidebar userInfo={userInfo} onLogout={onLogout}
       onOpenAddGroupPopUp={() => setIsAddGroupPopUpOpen(true)}
       onOpenEventPopUp={() => setIsEventPopUpOpen(true)}
        groups={groups} 
        setGroups={setGroups} />

<div className="main-content">
  <Header username={username} />
  <div className="content">
    <div className="add-task-button">
      <button className="add-new-task" onClick={() => setIsAddTaskPopUpOpen(true)}> Add New Tasks</button>
    </div>
    
    <section className="task-section-box">
      <h3 className="task-box-title">Your Tasks</h3>

      {/* Conditionally add 'scrollable' class if there are tasks */}
      <div className={`task-list-section ${tasks.length > 0 ? 'scrollable' : ''}`}>
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
              
              <div className="task-details">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
              </div>
              <div className="task-date">
                <h4>{task.date}</h4>
                <h4>{task.time}</h4>
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
      </div>
    </section>
  


             {/* Calendar Section */}
          <section className="calendar-section compact-calendar-container" >
            <CompactCalendar tasks={tasks} />
          </section>

          {/* Friends Section */}
          <div className="friends-section">
            {/* Friends Section Buttons */}
          <div className="friend-buttons">
            <button className="add-new" onClick={() => setIsFriendRequestPopUpOpen(true)}>Add New Friends</button>
              <button className="show-all">Show All Friends</button>
            </div>
            <h3>Friends</h3>
            <div className="friends-list">
              {friends.length === 0 ? (
                <p>No friends added yet.</p>
              ) : (
                friends.map(friend => (
                  <div key={friend._id} className="friend">
                    <img src={friend.profilePicture || images['defaultpf.jpg']} alt={friend.name} />
                    <span className="friend-username">{friend.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
         
        </div>
      </div>

      {/* Add Task Popup */}
      <AddTaskPopUp isOpen={isAddTaskPopUpOpen} closeModal={() => setIsAddTaskPopUpOpen(false)} onSave={handleAddTask} />
      
      {/* Edit Task Popup */}
      <EditTaskPopUp isOpen={isEditTaskPopUpOpen} closeModal={() => setIsEditTaskPopUpOpen(false)} onSave={(updatedTask) => handleEditTask(taskToEdit._id, updatedTask)} onDelete={() => handleDelete(taskToEdit._id)} task={taskToEdit} />

      {/* Add Group Popup */}
      <AddGroupPopUp isOpen={isAddGroupPopUpOpen} onClose={() => setIsAddGroupPopUpOpen(false)} onAddGroup={handleAddGroup} currentUser={username} />
      
      {/* Friend Request Popup */}
      <FriendRequestPopUp isOpen={isFriendRequestPopUpOpen} onClose={() => setIsFriendRequestPopUpOpen(false)} currentUser={{username: username}} />

      {/* Event Popup */}
      <EventPopUp isOpen={isEventPopUpOpen} onClose={() => setIsEventPopUpOpen(false)} onSave={handleSaveEvent} />
    </div>
  );
};

export default MainDashboard;