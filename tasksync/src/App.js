import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router,Routes,Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import LandingPage from './view/landingPage';
import AuthPage from './view/authPage';
import Dashboard from './view/mainDashboard';
import Sidebar from './view/components/sidebar';
import GroupPage from './view/groupPage';
import FullCalendarView from './view/fullCalendarView';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [groups, setGroups] = useState([]);


  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      handleLogin(savedUsername);
    }
  }, []);

  const navigateToAuth = () => {
    setCurrentPage('auth');
  };

  const handleLogin = async (username) => {
    try {
      const response = await axios.get(`/user/${username}`);
      setUserInfo(response.data);
      setIsAuthenticated(true);
      setUsername(username);
      setCurrentPage('dashboard');

      localStorage.setItem('username', username);
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };
  

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setUsername('');
    setUserInfo(null);
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            currentPage === 'landing' ? (
              <LandingPage onNavigate={navigateToAuth} />
            ) : currentPage === 'auth' ? (
              <AuthPage onLogin={handleLogin} />
            ) : currentPage === 'dashboard' && isAuthenticated ? (
              <Dashboard username={username} userInfo={userInfo} onLogout={handleLogout} />
            ) : null
          } />

          <Route path="/dashboard" element={
            isAuthenticated ? (
              <Dashboard username={username} userInfo={userInfo} onLogout={handleLogout} />
            ) : <Navigate to="/" />
          } />

          <Route path="/group/:groupId" element={
            isAuthenticated ? (
              <>
                <Sidebar userInfo={userInfo} onLogout={handleLogout} groups={groups} setGroups={setGroups} />

                <GroupPage username = {username}/>
              </>
            ) : <Navigate to="/" />
          } />
         <Route path="/full-calendar" element={
            isAuthenticated ? (
              <FullCalendarView username={username} userInfo={userInfo} onLogout={handleLogout} groups={groups} setGroups={setGroups} />
            ) : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;