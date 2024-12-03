import React, { useState, useEffect, useRef} from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/header';
import AddGroupTaskPopup from './components/addGroupTaskPopUp';
import EditGroupTaskPopup from './components/editGroupTaskPopUp';
import AddGroupEventPopup from './components/addGroupEventPopUp';
import EditGroupEventPopup from './components/editGroupEventPopUp';
import InviteFriendsPopup from './components/inviteFriendsPopUp';
import axios from 'axios';
import './groupPage.css';
import images from '../assets';

const GroupPage = ({username}) => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [groupTasks, setGroupTasks] = useState([]);
    const [groupEvents, setGroupEvents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        assignedTo: ''
      });

    const [tasks, setTasks] = useState([]);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    const [events, setEvents] = useState([]);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [isEditEventOpen, setIsEditEventOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);

    const [newMessage, setNewMessage] = useState('');
    const ws = useRef(null);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });

    const [isInvitePopupOpen, setIsInvitePopupOpen] = useState(false);
    const openInvitePopup = () => setIsInvitePopupOpen(true);
    const closeInvitePopup = () => setIsInvitePopupOpen(false);

    // Fetch group data on mount
    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const response = await axios.get(`/api/groups/${groupId}`);
                console.log('Fetched group:', response.data); 
                if (response.data) {
                    setGroup(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch group:', error);
                if (error.response?.status === 404) {
                    console.log('Group not found');
                }
            }
        };
    
        if (groupId) {
            fetchGroupData();
        }
    }, [groupId]);

    // Fetch group tasks
  useEffect(() => {
    const fetchGroupTasks = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}/tasks`);
        setGroupTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch group tasks:', error);
      }
    };
    fetchGroupTasks();
  }, [groupId]);

  // Fetch group events
  useEffect(() => {
    const fetchGroupEvents = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}/events`);
        setGroupEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch group events:', error);
      }
    };
    fetchGroupEvents();
  }, [groupId]);

  // Fetch group tasks
  useEffect(() => {
    const fetchGroupEvents = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}/events`);
        setGroupEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch group events:', error);
      }
    };
    fetchGroupEvents();
  }, [groupId]);

  useEffect(() => {
    const fetchMessages = async () => {
        try {
            const response = await axios.get(`/api/groups/${groupId}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    fetchMessages();
}, [groupId]);


  /*
  const openEditTaskPopup = (task) => {
    setTaskToEdit(task);
    setIsEditTaskOpen(true);
  };
*/

  const handleAddTask = async (taskData) => {
    try {
      await axios.post(`/api/groups/${groupId}/tasks`, {...taskData, createdBy: username});
      // Refresh tasks
      const response = await axios.get(`/api/groups/${groupId}/tasks`);
      setGroupTasks(response.data);
      setIsAddTaskOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      await axios.post(`/api/groups/${groupId}/events`, eventData);
      // Refresh events
      const response = await axios.get(`/api/groups/${groupId}/events`);
      setGroupEvents(response.data);
      setIsAddEventOpen(false);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const openEditTaskPopup = (task) => {
    setTaskToEdit(task);
    setIsEditTaskOpen(true);
  };

  const handleEditTask = async (taskId, updatedTask) => {
    try {
      const response = await axios.put(`/api/groups/${groupId}/tasks/${taskId}`, updatedTask);
  
      if (response.status === 200) {
        const updatedTasks = tasks.map(task =>task._id === taskId ? { ...task, ...updatedTask } : task
        );
  
        // Update the state with the new task list
        setGroupTasks(updatedTasks);
        setIsEditTaskOpen(false);
      } 
    } catch (error) {
      console.error("Failed to edit task:", error.response?.data || error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this task?");
    if (!isConfirmed) return;

    try {
        // Make DELETE request to the server
        await axios.delete(`/api/groups/${groupId}/tasks/${taskId}`);
        
        // Update the state to reflect the task removal
        setGroupTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        console.log('Task deleted successfully');
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
};

//Event functions
const openEditEventPopup = (event) => {
    setEventToEdit(event);
    setIsEditEventOpen(true);
  };
/*
const handleAddEvent = async (eventData) => {
    try {
        await axios.post(`/api/groups/${groupId}/events`, {...eventData, createdBy: username});
        // Refresh tasks
        const response = await axios.get(`/api/groups/${groupId}/events`);
        setGroupEvents(response.data);
        setIsAddEventOpen(false);
      } catch (error) {
        console.error('Failed to add event:', error);
      }
  };
*/
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
        setIsEditEventOpen(false);
        setEventToEdit(null);
      }
    } catch (err) {
      console.error('Failed to edit event:', err);
      alert('Failed to update event. Please try again.');
    }
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
    alert('Failed to delete event. Please try again.');
  }
};


useEffect(() => {
  const connectWebSocket = () => {
      ws.current = new WebSocket(`ws://localhost:8080?username=${username}`);

      ws.current.onopen = () => {
          console.log('WebSocket connection established');
      };

      ws.current.onmessage = async (event) => {
        try {
          let messageData;
          
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            messageData = JSON.parse(text);
          } else {
            messageData = JSON.parse(event.data);
          }
      
          if (messageData.groupId === groupId) {
            setMessages(prevMessages => {
              const messageExists = prevMessages.some(
                msg => msg.id === messageData.id
              );
              if (!messageExists) {
                return [...prevMessages, messageData];
              }
              return prevMessages;
            });
          }
        }  catch (error) {
              console.warn('Error parsing message:', error);
          }
      };

      ws.current.onclose = () => {
          console.log('WebSocket connection closed, retrying...');
          setTimeout(connectWebSocket, 3000);
      };
  };
  connectWebSocket();

  return () => {
      if (ws.current) {
          ws.current.close();
      }
  };
}, [username, groupId]);

const handleSendMessage = async () => {
  if (newMessage.trim() && ws.current?.readyState === WebSocket.OPEN) {
    const messageData = {
      id: Date.now() + Math.random().toString(36).substring(7),
      groupId: groupId,
      sender: username,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Send as string
      ws.current.send(JSON.stringify(messageData));
      
      // Store in database
      await axios.post(`/api/groups/${groupId}/messages`, messageData);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  }
};

    return (
        <div className="group-page">
            <Header username={username} />

            {/* Group Info Section */}
            <section className="group-header">
                <h1>{group?.name}
                <div className="group-actions">
                    
                    <button onClick={openInvitePopup} className="invite-button">Invite Friends</button>
                    <button className="leave-button" onClick={handleLeaveGroup}>Leave Group</button>
                </div>

                </h1>
                

                <div className="group-members">
                    <h3>Members</h3>
                    <div className="members-list">
                        {group?.members?.map(member => (
                            <div key={member} className="member">
                                <img src= {images['defaultpf.jpg']} alt={member} />
                                <span className="member-username">{member}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="group-content">
                {/* Shared Tasks Section */}
                <section className="group-tasks">
                <AddGroupTaskPopup
                    isOpen={isAddTaskOpen}
                    closeModal={() => setIsAddTaskOpen(false)}
                    onSave={handleAddTask}
                    groupMembers={group?.members || []}
                />
                <EditGroupTaskPopup
                    isOpen={isEditTaskOpen}
                    closeModal={() => setIsEditTaskOpen(false)}
                    onSave={(updatedTask) => handleEditTask(taskToEdit._id, updatedTask)} 
                    onDelete={() => handleDeleteTask(taskToEdit._id)} 
                    task={taskToEdit}
                    groupMembers={group?.members || []}
                />
                <AddGroupEventPopup
                    isOpen={isAddEventOpen}
                    closeModal={() => setIsAddEventOpen(false)}
                    onSave={handleAddEvent}
                    groupMembers={group?.members || []}
                />
                <EditGroupEventPopup
                    isOpen={isEditEventOpen}
                    closeModal={() => setIsEditEventOpen(false)}
                    onSave={(eventPayload) => handleEditEvent(eventToEdit._id, eventPayload)} 
                    onDelete={() => handleDeleteEvent(eventToEdit._id)} 
                    task={eventToEdit}
                    groupMembers={group?.members || []}
                />
                <InviteFriendsPopup
                isOpen={isInvitePopupOpen}
                onClose={closeInvitePopup}
                groupId={groupId} // Pass the current group ID
                />
                    <h3>Group Tasks</h3>
                    <button className="add-task-btn" onClick={() => setIsAddTaskOpen(true) }> Add Task</button>
                    <div className="tasks-list">
                        {groupTasks.map(task => (
                            <div key={task.id} className="task-item">
                                <h4>Task: {task.title}</h4>
                                <p>Assigned to: {task.assignedTo}</p>
                                <p>Due: {new Date(task.date).toLocaleDateString(
                                    'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }
                                )} at {task.time}</p>
                                <button onClick={() => openEditTaskPopup(task)}>Edit Task</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Group Events Section */}
                <section className="group-events">
                    <h3>Upcoming Events</h3>
                    <button className="add-event-btn"  onClick={() => setIsAddEventOpen(true) }>Schedule Event</button>
                    <div className="events-list">
                        {groupEvents.map(event => (
                            <div key={event.id} className="event-item">
                                <h4> Event: {event.title}</h4>
                                <p> Location:{' '} {event.location ? event.location : 'None'}</p>

                                <p>
                                    From:{' '}
                                    {new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).format(new Date(event.startDateTime))}
                                    </p>

                                    <p>
                                    To:{' '}
                                    {new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).format(new Date(event.endDateTime))}
                                    </p>
                                
                                <button onClick={() => openEditEventPopup(event)}>Edit Event</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Group Chat Section */}
                <section className="group-chat">
          <h3>Group Chat</h3>
          <div className="chat-messages">
            {messages.map((message, index) => (
                <div 
                key={`${message.sender}-${message.timestamp}-${index}`} 
                className={`message ${message.sender === username ? 'own-message' : ''}`}
                >
                <span className="message-sender">{message.sender}: </span>
                <span className="message-text">{message.text}</span>
                <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                </div>
            ))}
            </div>
          <div className="message-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </section>
        </div>
    </div>
    );
};

export default GroupPage;