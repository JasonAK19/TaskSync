import React, { useState, useEffect } from 'react';

import Sidebar from './components/sidebar';
import Header from './components/header';
import AddTaskPopUp from './components/addTaskPopUp';
import EditTaskPopUp from "./components/editTaskPopUp";
import AddGroupPopUp from './components/addGroupPopUp'; 
import FriendRequestPopUp from './components/friendRequestPopUp';
import MergeSchedulePopUp from './components/mergeSchedulePopUp';
import CompactCalendar from './components/compactCalendar';
import EventPopUp from './components/eventPopUp';
import EditEventPopUp from './components/editEventPopUp';
import FriendsListPopUp from './components/friendsListPopUp';
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
  const [dropdownVisible1, setEventMenuVisible] = useState(null);
  const [isFriendRequestPopUpOpen, setIsFriendRequestPopUpOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isEventPopUpOpen, setIsEventPopUpOpen] = useState(false);
  const [isEditEventPopUpOpen, setIsEditEventPopUpOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [events, setEvents] = useState([]);
  const [isMergeSchedulePopUpOpen, setIsMergeSchedulePopUpOpen] = useState(false);
  const [isFriendsListPopUpOpen, setIsFriendsListPopUpOpen] = useState(false);


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

  //Task Stuff
  const handleAddTask = async (task) => {
    try {
      const response = await axios.post('/tasks', { username, task });
      setTasks([...tasks, { ...task, _id: response.data.taskId, startDate: task.startDate, endDate: task.endDate }]);
      setIsAddTaskPopUpOpen(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleEditTask = async (taskId, updatedTask) => {
    try {
      const response = await axios.put(`/tasks/${taskId}`, updatedTask);
      if (response.status === 200) {
        const updatedTasks = tasks.map(task => task._id === taskId ? { ...task, ...updatedTask } : task
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
      const response = await axios.delete(`/tasks/${taskId}?username=${username}`);
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

  //Event Stuff

  const toggleEventMenu = (eventId) => {
    setEventMenuVisible(dropdownVisible1 === eventId ? null : eventId);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const response = await axios.post('/api/events', { ...eventData, createdBy: username });
      setEvents([...events, response.data]);
      setIsEventPopUpOpen(false);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleEditEvent = async (eventId, eventPayload) => {
    try {
      const response = await axios.put(`/api/events/${eventId}`, {
        ...eventPayload,
        username // Add username 
      });
      
      if (response.status === 200) {
        setEvents(
          prevEvents => prevEvents.map(event => event._id === eventId ? { ...event, ...eventPayload } : event)
        );
        setIsEditEventPopUpOpen(false);
        setEventToEdit(null);
      }
    } catch (err) {
      console.error('Failed to edit event:', err);
      alert('Failed to update event. Please try again.');
    }
  };

  const openEditEventPopup = (event) => {
    setEventToEdit(event);
    setIsEditEventPopUpOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
  console.log('handleDeleteEvent called with eventId:', eventId);  // Check if the function is called
  const isConfirmed = window.confirm("Are you sure you want to delete this event?");
  if (!isConfirmed) return;

  try {
    const response = await axios.delete(`/api/events/${eventId}`, {
      params: { username } 
    });

    if (response.status === 200) {
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    }
  } catch (err) {
    console.error('Failed to delete event:', err);
  }
};

const removeFriend = async (friendUsername) => {
  const isConfirmed = window.confirm(`Are you sure you want to remove ${friendUsername} from your friends list?`);
  if (!isConfirmed) return;

  try {
    const response = await axios.delete(`/api/friends/${username}/remove`, {
      data: {
        friendUsername,
        currentUserId: userId 
      }
    });
    
    if (response.status === 200) {
      // Update local state
      setFriends(prevFriends => prevFriends.filter(friend => friend.username !== friendUsername));
    }
  } catch (error) {
    console.error('Failed to remove friend:', error);
    alert('Failed to remove friend. Please try again.');
  }
};




  const handleMergeSchedules = async (friend, type) => {
    try {
      const response = await axios.post('/api/merge-schedules', { username, friend, type });
      console.log('Merged schedules:', response.data);
      // Update tasks or events based on the response
    } catch (error) {
      console.error('Failed to merge schedules:', error);
    }
  };

  const formatTime = (time) => {
    if (!time) return ''; // Handle empty or undefined time
    const [hour, minute] = time.split(':').map(Number); // Split time into hours and minutes
    const ampm = hour >= 12 ? 'PM' : 'AM'; // Determine AM or PM
    const formattedHour = hour % 12 || 12; // Convert 0 or 24 to 12 for 12-hour format
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="main-dashboard">
      <Sidebar userInfo={userInfo} onLogout={onLogout}
       onOpenAddGroupPopUp={() => setIsAddGroupPopUpOpen(true)}
       onOpenEventPopUp={() => setIsEventPopUpOpen(true)}
        groups={groups} 
        setGroups={setGroups}
        onMergeSchedulePopUp={() => setIsMergeSchedulePopUpOpen(true)}
        onOpenAddTask={() => setIsAddTaskPopUpOpen(true)}
         />

<div className="main-content">
  <Header username={username} />
  <div className="content">
    
    <section className="task-section-box">
      <h3 className="task-box-title">Your Tasks</h3>

      {/* Conditionally add 'scrollable' class if there are tasks */}
      <div className={`task-list-section ${tasks.length > 0 ? 'scrollable' : ''}`}>
        {tasks.length === 0 ? (
          <div className="task">
            <div className="task-icon"></div>
            <div className="task-details">
              <h4>No Tasks Yet</h4>
              <p>Select Add New Task button to add a task</p>
            </div>
            <div className="task-options">
              <button className="task-menu">...</button>
            </div>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="task">
              
              <div className="task-details">
                <h4> Task:{' '} {task.title}</h4>
                <p> Description:{' '} {task.description ? task.description : 'None'}</p>
              </div>
              <div className="task-date">
                 <h4>Due:{' '} {task.date} {formatTime(task.time)}</h4>
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

        {/*Event*/}
    <section className="event-section-box">
      <h3 className="event-box-title">Your Events</h3>

  
      <div className={`event-list-section ${events.length > 0 ? 'scrollable' : ''}`}>
        {events.length === 0 ? (
          <div className="event">
            <div className="event-icon"></div>
            <div className="event-details">
              <h4>No Events Yet</h4>
              <p>Select Create Event button to add a event</p>
            </div>
            <div className="event-options">
              <button className="event-menu">...</button>
            </div>
          </div>
        ) : (
          events.map(events => (
            <div key={events._id} className="task">
              
              <div className="task-details">
                <h4> Event:{' '} {events.title}</h4>

                <p> Description:{' '} {events.description ? events.description : 'None'}</p>
              </div>
              <div className="task-datetime">
              <h4> Location:{' '} {events.location ? events.location : 'None'}</h4>
                <h4>
                From:{' '}
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }).format(new Date(events.startDateTime))}
                </h4>

                <h4>
                To:{' '}
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }).format(new Date(events.endDateTime))}
                </h4>

              </div>
              <div className="task-options">
                <button onClick={() => toggleEventMenu(events._id)} className="task-menu">...</button>
                {dropdownVisible1 === events._id && (
                  <div className="dropdown-menu">
                    <button onClick={() => openEditEventPopup(events)}>Edit</button>
                    <button onClick={() => handleDeleteEvent(events._id)}>Delete</button>
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
            <CompactCalendar tasks={tasks} events={events} />
          </section>

          {/* Friends Section */}
          <div className="friends-section">
            {/* Friends Section Buttons */}
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
            <div className="friend-buttons">
            <button className="add-new" onClick={() => setIsFriendRequestPopUpOpen(true)}>Add New Friends</button>
              <button className="show-all" onClick={() => setIsFriendsListPopUpOpen(true)}>Show All Friends</button>
            </div>
          </div>
         
        </div>
      </div>

      {/* Add Task Popup */}
      <AddTaskPopUp isOpen={isAddTaskPopUpOpen} closeModal={() => setIsAddTaskPopUpOpen(false)} onSave={handleAddTask} />
      
      {/* Edit Task Popup */}
      <EditTaskPopUp isOpen={isEditTaskPopUpOpen} closeModal={() => setIsEditTaskPopUpOpen(false)} onSave={(updatedTask) => handleEditTask(taskToEdit._id, updatedTask)} onDelete={() => handleDelete(taskToEdit._id)} task={taskToEdit} />

      {/* Event Popup */}
      <EventPopUp isOpen={isEventPopUpOpen} onClose={() => setIsEventPopUpOpen(false)} onSave={handleSaveEvent} />

      {/* Edit Event Popup */}
      <EditEventPopUp isOpen={isEditEventPopUpOpen} closeModal={() => {setIsEditEventPopUpOpen(false); setEventToEdit(null);}} onSave={(eventPayload) => handleEditEvent(eventToEdit._id, eventPayload)} event={eventToEdit} />

      {/* Add Group Popup */}
      <AddGroupPopUp isOpen={isAddGroupPopUpOpen} onClose={() => setIsAddGroupPopUpOpen(false)} onAddGroup={handleAddGroup} currentUser={username} />
      
      {/* Friend Request Popup */}
      <FriendRequestPopUp isOpen={isFriendRequestPopUpOpen} onClose={() => setIsFriendRequestPopUpOpen(false)} currentUser={{username: username}}  />

      {/* Event Popup */}
      <EventPopUp isOpen={isEventPopUpOpen} onClose={() => setIsEventPopUpOpen(false)} onSave={handleSaveEvent} />

      {/* Merge Schedule Popup */}
      <MergeSchedulePopUp isOpen={isMergeSchedulePopUpOpen} onClose={() => setIsMergeSchedulePopUpOpen(false)} currentUser={username} onMerge={(friend, type) => {console.log(`Merged schedules with ${friend} for ${type}`);  }} />
        
        {/* Friends List Popup */}
        <FriendsListPopUp isOpen={isFriendsListPopUpOpen} onClose={() => setIsFriendsListPopUpOpen(false)} friends={friends} onRemoveFriend={removeFriend} />
    </div>
  );
};

export default MainDashboard;