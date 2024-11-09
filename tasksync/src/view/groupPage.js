import React from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/header';
import './groupPage.css';

const GroupPage = ({username}) => {
    const { groupId } = useParams();
    
    return (
      <div className="group-page">
        <Header username={username} />

        <h1>Group ID: {groupId}</h1>
      </div>
    );
  };
  
  export default GroupPage;