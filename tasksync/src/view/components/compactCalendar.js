import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import moment from 'moment';
import './compactCalendar.css';

const CompactCalendar = ({ tasks = [], events = [] }) => {

  const taskEvents = tasks.map(task => ({
    id: task._id,
    title: task.title,
    start: task.date,
    end: task.date,
    className: 'task-event'
  }));


  const calendarEvents = events.map(event => ({
    id: event._id,
    title: event.title,
    start: event.startDateTime,
    end: event.endDateTime,
    className: 'calendar-event'
  }));

  const allEvents = [...taskEvents, ...calendarEvents];

  const dayCellContent = (arg) => {
    const hasTask = allEvents.some(event => {
      const eventDate = moment(event.start).format('YYYY-MM-DD');
      const currentDate = moment(arg.date).format('YYYY-MM-DD');
      return eventDate === currentDate;
    });
  

    return (
      <div className="fc-daygrid-day-number">
        {arg.dayNumberText}
      </div>
    );
  };

  const eventContent = (arg) => {
    return (
      <div className= {`custom-event ${arg.event.classNames}`}>
        <span className="event-dot"></span>
        <span className="event-title">{arg.event.title}</span>
      </div>
    );
  };

  return (
    <div className="compact-calendar">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={allEvents}
        headerToolbar={{
          left: 'title',
          right: 'prev,next'
        }}
        height="100%"
        contentHeight="100%"
        eventDisplay="list-item"
        dayCellContent={dayCellContent}
        eventContent={eventContent}
      />
    </div>
  );
};

export default CompactCalendar;