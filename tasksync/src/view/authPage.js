import React, { useState } from 'react';
import axios from 'axios';
import workingTogether from '../assets/workingtogether.jpg';
import './authPage.css';

function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      console.log('User registered:', response.data);
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <div className="auth-page">
      <div className = "authImageContainer">
      <img src={workingTogether} alt="Hands Together" className="authImage" />
      </div>

      <div className="auth-form">
        {showSignUp ? (
          <div className="sign-up-form">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUpSubmit}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <button type="submit">Sign Up</button>
            </form>
          </div>
        ) : (
          <div className="login-form">
            <h2>Log In</h2>
            <form>
              <label>Username</label>
              <input type="text" name="username" required />

              <label>Password</label>
              <input type="password" name="password" required />

              <button type="submit">Log In</button>
            </form>
          </div>
        )}

<div className="auth-options">
        <button onClick={() => setShowSignUp(false)} className={!showSignUp ? 'active' : ''}>
          Log In
        </button>
        <button onClick={() => setShowSignUp(true)} className={showSignUp ? 'active' : ''}>
          Sign Up
        </button>
      </div>
      
      </div>
    </div>
  );
}

export default AuthPage;