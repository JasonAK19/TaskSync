import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';
import './fullCalendarView.css';
import Header from './components/header';
import Sidebar from './components/sidebar';

const FullCalendarView = ({ username, userInfo, onLogout, groups, setGroups }) => {
  const [tasks, setTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userTasksResponse = await axios.get(`/tasks/${username}`);
        setTasks(userTasksResponse.data);

        const groupTasksResponse = await axios.get(`/api/user/${username}/groups/tasks`);
        setGroupTasks(groupTasksResponse.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    fetchTasks();
  }, [username]);

  const allTasks = [...tasks, ...groupTasks].map(task => ({
    id: task._id,
    title: task.title,
    start: task.startDateTime,
    end: task.endDateTime,
    className: 'task-event'
  }));

  return (
    <div className="full-calendar-page">
      <Sidebar userInfo={userInfo} onLogout={onLogout} groups={groups} setGroups={setGroups} />
      <div className="main-content">
        <Header username={username} />
        <div className="full-calendar-view">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            events={allTasks}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            height="100%"
            contentHeight="100%"
            eventDisplay="block"
          />
        </div>
      </div>
    </div>
  );
};

export default FullCalendarView;