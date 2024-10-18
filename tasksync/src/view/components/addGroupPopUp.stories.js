import React, { useState } from 'react';
import AddGroupPopUp from './addGroupPopUp';

export default {
  title: 'Components/AddGroupPopUp',
  component: AddGroupPopUp,
};

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleAddGroup = (groupName) => {
    alert(`Group "${groupName}" created!`);
  };

  return (
    <div>
      {isOpen && (
        <AddGroupPopUp
          {...args}
          onClose={() => setIsOpen(false)}
          onAddGroup={handleAddGroup}
        />
      )}
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};