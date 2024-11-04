// CompactCalendar.stories.js
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import CompactCalendar from './compactCalendar';
import dayGridPlugin from '@fullcalendar/daygrid';
import moment from 'moment';

export default {
  title: 'Components/CompactCalendar',
  component: CompactCalendar,
};

// Template to render the component
const Template = (args) => (
    <div style={{ height: '500px', width: '100%' }}> {/* Set an explicit height */}
      <CompactCalendar {...args} />
    </div>
  );

// Sample tasks data
const sampleTasks = [
  {
    _id: '1',
    title: 'Project Deadline',
    date: '2024-11-10'
  },
  {
    _id: '2',
    title: 'Team Meeting',
    date: '2024-11-15'
  },
  {
    _id: '3',
    title: 'Code Review',
    date: '2024-11-18'
  },
  {
    _id: '4',
    title: 'Client Presentation',
    date: '2024-11-20'
  }
];

// Default view with multiple tasks
export const DefaultView = Template.bind({});
DefaultView.args = {
  tasks: sampleTasks
};
