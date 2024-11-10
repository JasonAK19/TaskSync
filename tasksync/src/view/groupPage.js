import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/header';
import AddGroupTaskPopup from './components/addGroupTaskPopUp';
import axios from 'axios';
import './groupPage.css';

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
      await axios.post(`/api/groups/${groupId}/tasks`, {
        ...taskData,
        createdBy: username
      });
      // Refresh tasks
      const response = await axios.get(`/api/groups/${groupId}/tasks`);
      setGroupTasks(response.data);
      setIsAddTaskOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
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
                                <img src="/default-avatar.png" alt={member} />
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
                        {messages.map(message => (
                            <div key={message.id} className="message">
                                <span className="message-sender">{message.sender}: </span>
                                <span className="message-text">{message.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="message-input">
                        <input type="text" placeholder="Type a message..." />
                        <button>Send</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default GroupPage;