import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './compactCalendar.css';

const CompactCalendar = ({ tasks }) => {
  const events = tasks.map(task => ({
    id: task._id,
    title: task.title,
    start: task.startDate,
    end: task.endDate,
  }));

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
        contentHeight= "100%"
        dayMaxEvents={true}  
        eventDisplay="list-item"  
      />
    </div>
  );
};

export default CompactCalendar;
