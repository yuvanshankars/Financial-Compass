import React from 'react';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1 className="splash-title">ExpenseTracker</h1>
        <div className="loader-dots">
          <div className="dot1"></div>
          <div className="dot2"></div>
          <div className="dot3"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;