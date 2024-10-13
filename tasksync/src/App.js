// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import LandingPage from './view/landingPage';
import AuthPage from './view/authPage';
import Dashboard from './view/mainDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userInfo, setUserInfo] = useState(null);


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
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateToAuth} />}
      {currentPage === 'auth' && <AuthPage onLogin={handleLogin} />}
      {currentPage === 'dashboard' && isAuthenticated && <Dashboard username={username} userInfo={userInfo} onLogout={handleLogout} />}
    </div>
  );
}

export default App;