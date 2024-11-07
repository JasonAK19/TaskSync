import React, { useState, useEffect } from 'react';
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
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateToAuth} />}
      {currentPage === 'auth' && <AuthPage onLogin={handleLogin} />}
      {currentPage === 'dashboard' && isAuthenticated && (
        <Dashboard username={username} userInfo={userInfo} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;