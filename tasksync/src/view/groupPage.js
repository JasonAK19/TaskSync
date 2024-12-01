import React, { useState, useEffect, useRef} from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/header';
import AddGroupTaskPopup from './components/addGroupTaskPopUp';
import EditGroupTaskPopup from './components/editGroupTaskPopUp';
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
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [tasks, setTasks] = useState([]);const [newMessage, setNewMessage] = useState('');
    const ws = useRef(null);



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

  const openEditTaskPopup = (task) => {
    setTaskToEdit(task);
    setIsEditTaskOpen(true);
  };

  const handleEditTask = async (taskId, updatedTask) => {
    try {
        console.log('Sending updated task:', updatedTask); // Debug updated task
    
        // Make a PUT request to update the task on the server
        const response = await axios.put(`/api/groups/${groupId}/tasks/${taskId}`, updatedTask);
    
        console.log('Task successfully updated on the server:', response.data); // Debug server response
    
        // Refresh tasks after editing
        const tasksResponse = await axios.get(`/api/groups/${groupId}/tasks?_=${Date.now()}`);
        console.log('Fetched updated tasks:', tasksResponse.data); // Debug fetched tasks
    
        setGroupTasks(updatedTask);
        setIsEditTaskOpen(false);
      } catch (error) {
        console.error('Failed to edit task:', error.response?.data || error.message); // Debug errors
      }
  };

const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this task?");
    if (!isConfirmed) return;
    try {
      const response = await axios.delete(`/api/groups/${groupId}/tasks/${taskId}`);
      if (response.status === 200) {
        const updatedTasks = tasks.filter(task => task._id !== taskId);
        setTasks(updatedTasks);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
};

useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket('ws://localhost:8080');
  
      ws.current.onopen = () => {
        console.log('WebSocket connection established');
      };
  
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setMessages(prevMessages => {
            // Check for duplicate messages
            const isDuplicate = prevMessages.some(
              msg => msg.sender === message.sender && 
                    msg.text === message.text &&
                    msg.timestamp === message.timestamp
            );
            if (!isDuplicate) {
              return [...prevMessages, {...message, timestamp: new Date().toISOString()}];
            }
            return prevMessages;
          });
        } catch (error) {
          console.warn('Error parsing message:', error);
        }
      };
  
      ws.current.onclose = () => {
        console.log('WebSocket connection closed, retrying...');
        setTimeout(connectWebSocket, 3000); // Retry after 3 seconds
      };
  
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
  
    connectWebSocket();
  
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);
  
  const handleSendMessage = () => {
    if (newMessage.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const messageData = {
        sender: username,
        text: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      ws.current.send(JSON.stringify(messageData));
      setNewMessage('');
    }
  };

    return (
        <div className="group-page">
            <Header username={username} />

            {/* Group Info Section */}
            <section className="group-header">
                <h1>{group?.name}</h1>
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
                    <h3>Group Tasks</h3>
                    <button className="add-task-btn" onClick={() => setIsAddTaskOpen(true) }>
                        Add Task
                        </button>
                    
                    <div className="tasks-list">
                        {groupTasks.map(task => (
                            <div key={task.id} className="task-item">
                                <h4>{task.title}</h4>
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
                    <button className="add-event-btn">Schedule Event</button>
                    <div className="events-list">
                        {groupEvents.map(event => (
                            <div key={event.id} className="event-item">
                                <h4>{event.title}</h4>
                                <p>Date: {new Date(event.date).toLocaleString()}</p>
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