// src/view/AuthPage.js
import React, { useState } from 'react';
import './authPage.css';

function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-options">
        <button onClick={() => setShowSignUp(false)} className={!showSignUp ? 'active' : ''}>
          Log In
        </button>
        <button onClick={() => setShowSignUp(true)} className={showSignUp ? 'active' : ''}>
          Sign Up
        </button>
      </div>

      <div className="auth-form">
        {showSignUp ? (
          <div className="sign-up-form">
            <h2>Sign Up</h2>
            <form>
              <label>Username</label>
              <input type="text" name="username" required />

              <label>Password</label>
              <input type="password" name="password" required />

              <label>Confirm Password</label>
              <input type="password" name="confirm-password" required />

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
      </div>
    </div>
  );
}

export default AuthPage;
