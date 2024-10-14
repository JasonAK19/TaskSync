import React from 'react';
import AddTaskPopUp from './addTaskPopUp';

export default {
  title: 'Components/AddTaskPopUp',
  component: AddTaskPopUp,
};

const Template = (args) => <AddTaskPopUp {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  closeModal: () => {},
};