import React from 'react';
import EditTaskPopUp from './editTaskPopUp';

export default {
  title: 'Components/EditTaskPopUp',
  component: EditTaskPopUp,
};

const Template = (args) => <EditTaskPopUp {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  task: {
    title: 'Some Task',
    description: 'Task for editing.',
    time: '12:30',
    date: '2024-10-14',
  },
  closeModal: () => {},
  onSave: () => {},
};