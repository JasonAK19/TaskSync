// src/App.js
import React, { useState } from 'react';
import './App.css';
import LandingPage from './view/landingPage';
import AuthPage from './view/authPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigateToAuth = () => {
    setCurrentPage('auth');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateToAuth} />}
      {currentPage === 'auth' && <AuthPage />}
    </div>
  );
}

export default App;