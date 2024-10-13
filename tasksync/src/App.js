// src/App.js
import React, { useState } from 'react';
import './App.css';
import LandingPage from './view/landingPage';
import AuthPage from './view/authPage';
import Dashboard from './view/mainDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const navigateToAuth = () => {
    setCurrentPage('auth');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUsername(username);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateToAuth} />}
      {currentPage === 'auth' && <AuthPage onLogin={handleLogin} />}
      {currentPage === 'dashboard' && isAuthenticated && <Dashboard username={username} onLogout={handleLogout} />}
    </div>
  );
}

export default App;