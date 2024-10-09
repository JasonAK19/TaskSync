import React from 'react';
import './sidebar.css';

const Sidebar = () => {
  return (
    <div className="Sidebar">
      <div className="menu">
        <button className="menu-item">
          <i className="fa fa-calendar"></i> Open Full Calendar
        </button>
        <button className="menu-item">
          <i className="fa fa-plus"></i> Create Event
        </button>
        <button className="menu-item">
          <i className="fa fa-tasks"></i> Merge Task
        </button>
      </div>

      <div className="bottom-menu">
        <button className="menu-item">
          <i className="fa fa-cog"></i> Settings
        </button>
        <button className="menu-item">Sign Out</button>
      </div>
    </div>
  );
};

export default Sidebar;