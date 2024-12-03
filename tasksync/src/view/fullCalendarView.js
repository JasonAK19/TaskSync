import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';
import './fullCalendarView.css';
import Header from './components/header';
import Sidebar from './components/sidebar';

const FullCalendarView = ({ username, userInfo, onLogout, groups, setGroups }) => {
  const [groupTasks, setGroupTasks] = useState([]);
  const [groupNames, setGroupNames] = useState({});
  const [ownTasks, setOwnTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [sharedEvents, setSharedEvents] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch user's own tasks
        const userTasksResponse = await axios.get(`/tasks/${username}`);
        setOwnTasks(userTasksResponse.data);

        // Fetch tasks shared with user
        const sharedTasksResponse = await axios.get(`/tasks/shared/${username}`);
        setSharedTasks(sharedTasksResponse.data);

        // Fetch all groups
        const groupsResponse = await axios.get(`/api/user/${username}/groups`);
        const userGroups = groupsResponse.data.groups;
        
        // Create map of group IDs to names
        const groupNameMap = {};
        userGroups.forEach(group => {
          groupNameMap[group._id] = group.name;
        });
        setGroupNames(groupNameMap);
    
        // Fetch tasks for each group
        const allGroupTasksPromises = userGroups.map(group => 
          axios.get(`/api/groups/${group._id}/tasks`)
            .then(response => response.data.map(task => ({
              ...task,
              groupId: group._id
            })))
        );
        const groupTasksResponses = await Promise.all(allGroupTasksPromises);
        const allGroupTasks = groupTasksResponses.flatMap(tasks => tasks);
        
        setGroupTasks(allGroupTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };        

    fetchTasks();
  }, [username]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsResponse = await axios.get(`/api/events/${username}`);
        setEvents(eventsResponse.data);

        const sharedEventsResponse = await axios.get(`/api/events/shared/${username}`);
        setSharedEvents(sharedEventsResponse.data);
        // Fetch all events for each group
        const allGroupEventsPromises = groups.map(group => 
          axios.get(`/api/groups/${group._id}/events`)
            .then(response => response.data.map(event => ({
              ...event,
              groupId: group._id
            })))
        );
        const groupEventsResponses = await Promise.all(allGroupEventsPromises);
        const allGroupEvents = groupEventsResponses.flatMap(events => events);
        setGroupEvents(allGroupEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, [username, groups]);

  const ownTaskEvents = ownTasks.map(task => {
    const taskDate = new Date(task.date).toISOString().split('T')[0];
    const startDateTime = task.time ? 
      `${taskDate}T${task.time}:00` :
      `${taskDate}T09:00:00`;
      
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
  
  const sharedTaskEvents = sharedTasks.map(task => {
    const taskDate = new Date(task.date).toISOString().split('T')[0];
    const startDateTime = task.time ? 
      `${taskDate}T${task.time}:00` :
      `${taskDate}T09:00:00`;
      
    const [hours, minutes] = (task.time || '09:00').split(':');
    const endHour = String(Number(hours) + 1).padStart(2, '0');
    const endDateTime = `${taskDate}T${endHour}:${minutes}:00`;

    return {
      id: task._id,
      title: `[Shared] ${task.title}`,
      start: startDateTime,
      end: endDateTime,
      className: 'shared-task-event',
      editable: false
    };
  });
  
  const groupTaskEvents = groupTasks.map(task => {
    const taskDate = new Date(task.date).toISOString().split('T')[0];
    const startDateTime = task.time ? 
      `${taskDate}T${task.time}:00` :
      `${taskDate}T09:00:00`;
      
    const [hours, minutes] = (task.time || '09:00').split(':');
    const endHour = String(Number(hours) + 1).padStart(2, '0');
    const endDateTime = `${taskDate}T${endHour}:${minutes}:00`;

  
    return {
      id: task._id,
      title: `[${groupNames[task.groupId] || 'Group'}] ${task.title}`,
      start: startDateTime,
      end: endDateTime,
      className: 'group-task-event',
      extendedProps: {
        assignedTo: task.assignedTo
      }
    };
  });

  const userEvents = events.map(event => {
    const startDate = event.startDateTime;
    const endDate = event.endDateTime;

    if (!startDate || !endDate) {
      console.error('Invalid event date:', event);
      return null;
    }

    return {
      id: event._id,
      title: event.title,
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      className: 'user-event'
    };
  }).filter(event => event !== null);

  //const allEvents = [...ownTaskEvents, ...sharedTaskEvents, ...groupTaskEvents, ...userEvents];


  const sharedEventItems = sharedEvents.map(event => {
    const startDate = event.startDateTime;
    const endDate = event.endDateTime;
  
    if (!startDate || !endDate) {
      console.error('Invalid event date:', event);
      return null;
    }
  
    return {
      id: event._id,
      title: `[Shared] ${event.title}`,
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      className: 'shared-event',
      editable: false
    };
  }).filter(event => event !== null);

  const groupEventItems = groupEvents.map(event => {
  return {
    id: event._id,
    title: `${groupNames[event.groupId] || 'Group'}\n${event.title}`,
    start: new Date(event.startDateTime).toISOString(),
    end: new Date(event.endDateTime).toISOString(),
    className: 'group-event',
    extendedProps: {
      description: event.description,
      location: event.location,
      isAllDay: event.isAllDay,
      reminder: event.reminder,
      reminderTime: event.reminderTime,
      createdBy: event.createdBy
    }
  };
});
  
  const allEvents = [...ownTaskEvents, ...sharedTaskEvents, ...groupTaskEvents, ...userEvents, ...sharedEventItems, ...groupEventItems];
  console.log('All Events:', allEvents);

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