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

  const taskEvents = tasks.map(task => {
    const taskDate = task.date;
    // Use saved time if it exists, otherwise default to 9:00
    const startDateTime = task.time ? 
      `${taskDate}T${task.time}:00` :
      `${taskDate}T09:00:00`;
      
    // Set end time 1 hour after start
    const [hours, minutes] = (task.time || '09:00').split(':');
    const endHour = String(Number(hours) + 1).padStart(2, '0');
    const endDateTime = `${taskDate}T${endHour}:${minutes}:00`;
  
    return {
      id: task._id,
      title: task.title,
      start: startDateTime,
      end: endDateTime,
      className: 'task-event'
    };
  });
  
  const groupTaskEvents = groupTasks.map(task => {
    const taskDate = task.date;
    const startDateTime = `${taskDate}T09:00:00`;
    const endDateTime = `${taskDate}T10:00:00`;
  
    return {
      id: task._id,
      title: task.title,
      start: startDateTime,
      end: endDateTime,
      className: 'group-task-event'
    };
  });

  const allEvents = [...taskEvents, ...groupTaskEvents];

  const eventContent = (arg) => {
    return (
      <div className={`custom-event ${arg.event.classNames}`}>
        <span className="event-dot"></span>
        <span className="event-title">{arg.event.title}</span>
      </div>
    );
  };

  return (
    <div className="full-calendar-page">
      <Sidebar userInfo={userInfo} onLogout={onLogout} groups={groups} setGroups={setGroups} />
      <div className="main-content">
        <Header username={username} />
        <div className="full-calendar-view">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            events={allEvents}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            height="100%"
            contentHeight="100%"
            eventDisplay="block"
            eventContent={eventContent}
          />
        </div>
      </div>
    </div>
  );
};

export default FullCalendarView;