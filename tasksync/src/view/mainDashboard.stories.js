import React from 'react';
import MainDashboard from '../view/mainDashboard';

export default {
  title: 'MainDashboard',
  component: MainDashboard,
};

const Template = (args) => <MainDashboard {...args} />;

export const Default = Template.bind({});
Default.args = {};