// FriendRequestPopUp.stories.js
import React from 'react';
import FriendRequestPopUp from './friendRequestPopUp';

export default {
  title: 'Components/FriendRequestPopUp',
  component: FriendRequestPopUp,
  argTypes: {
    isOpen: { control: 'boolean' },
  },
};

// Template to render the component
const Template = (args) => <FriendRequestPopUp {...args} />;

export const OpenPopup = Template.bind({});
OpenPopup.args = {
  isOpen: true,
  currentUser: { username: 'testUser' },
  onClose: () => alert('Popup closed'),
};

