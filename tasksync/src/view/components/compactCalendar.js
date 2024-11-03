import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import moment from 'moment';
import './compactCalendar.css';

const CompactCalendar = ({ tasks }) => {
  const events = tasks.map(task => ({
    id: task._id,
    title: task.title,
    start: task.date,
    end: task.date,
  }));

  const dayCellContent = (arg) => {
    const hasTask = events.some(event => {
      const eventDate = moment(event.start).format('YYYY-MM-DD');
      const currentDate = moment(arg.date).format('YYYY-MM-DD');
      return eventDate === currentDate;
    });

    console.log(`Date: ${moment(arg.date).format('YYYY-MM-DD')}, Has Task: ${hasTask}`);

    return (
      <div className="fc-daygrid-day-number">
        {arg.dayNumberText}
      </div>
    );
  };

  const eventContent = (arg) => {
    return (
      <div className="custom-event">
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
        events={events}
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