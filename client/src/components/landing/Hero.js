import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-content-left">
          <h1 className="hero-heading">Sign in.</h1>
          <p className="hero-subtext" style={{ fontSize: '18px', color: '#BDC3C7', marginBottom: '32px', maxWidth: '400px' }}>
            Effortlessly track your income and expenses. Gain financial clarity with real-time insights and smart budgeting tools designed for modern life.
          </p>

          <div className="social-login">
            <p style={{ marginBottom: '16px' }}>Sign in with</p>
            <div className="social-icons">
              <a href="#" className="social-btn apple" onClick={(e) => e.preventDefault()}>
                <svg viewBox="0 0 384 512" fill="currentColor" height="20">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 96.3 78.8 95.3 33.5-1.4 47.5-21.7 86.3-21.7 39 0 51.2 21.7 85.6 22 35.3.3 55.4-40.4 76.6-88.5 9-20.4 20-53.7 20-54.3-5-2.6-45.7-27.7-47-78.8zm-51.4-125c15.2-16.3 31.5-35.6 27.2-56-17.7 2.4-42.3 16.4-56.5 35-13.3 17.5-21.8 39.6-18.6 56.6 21.4 1.4 34.7-21.4 47.9-35.6z" />
                </svg>
              </a>
              <a href="/api/auth/google" className="social-btn google">
                <svg viewBox="0 0 488 512" fill="currentColor" height="20">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="hero-content-right">
          <div className="hero-illustration">
            <div className="phone-mockup floating-animation">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="app-header">
                  <div className="menu-icon"></div>
                  <div className="user-avatar"></div>
                </div>
                <div className="balance-card">
                  <span>Total Balance</span>
                  <h3>₹12,450.20</h3>
                  <div className="trend-badge">+2.4%</div>
                </div>
                <div className="action-buttons">
                  <div className="btn-circle"></div>
                  <div className="btn-circle"></div>
                  <div className="btn-circle"></div>
                </div>
                <div className="stat-bars">
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar" style={{ height: '70%' }}></div>
                  <div className="bar active" style={{ height: '50%' }}></div>
                  <div className="bar" style={{ height: '80%' }}></div>
                </div>
                <div className="floating-notification">
                  <div className="icon-box">☕</div>
                  <div className="text-box">
                    <p>Starbucks</p>
                    <span>-₹5.50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="hero-tagline">Travel and expense, at the speed of chat</h2>
        </div>
      </div>
    </div>
  );
};

export default Hero;