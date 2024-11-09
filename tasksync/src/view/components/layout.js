import React from 'react';
import Sidebar from './sidebar';

const AuthLayout = ({ children, userInfo, onLogout, groups, setGroups }) => {
    return (
      <div className="app-layout">
        <Sidebar 
          userInfo={userInfo} 
          onLogout={onLogout}
          groups={groups}
          setGroups={setGroups}
        />
        <div className="main-content">
          {children}
        </div>
      </div>
    );
  };

export default AuthLayout;