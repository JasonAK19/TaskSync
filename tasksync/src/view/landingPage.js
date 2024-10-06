import React, { useEffect } from 'react';
import hands from '../assets/handstogether.jpg';
import { Presenter } from '../presenter';

function LandingPage() {
  useEffect(() => {
    const presenter = new Presenter({
      render: (data) => {
        document.querySelector('.landing-page h1').textContent = data.title;
        document.querySelector('.landing-page p').textContent = data.description;
        const buttons = document.querySelectorAll('.landing-page .buttons button');
        buttons.forEach((button, index) => {
          button.className = data.buttons[index].className;
          button.textContent = data.buttons[index].text;
        });
      }
    });
    presenter.initialize();
  }, []);

  return (
    <div className="landing-page">
      <div className="image-container">
        <img src={hands} alt="Hands Together" className="landing-image" />
      </div>
      <div className="content">
      <h1>Loading...</h1>
      <p>Loading description...</p>
        <div className="buttons">
          <button></button>
          <button></button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;