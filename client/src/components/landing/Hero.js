import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Financial Control at Your Fingertips</h1>
            <p>
              Professional-grade expense tracking with the simplicity you need. 
              Monitor cash flow, optimize spending, and achieve your financial goals.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="primary-button">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="primary-button">
                    Start Free Trial
                  </Link>
                  <Link to="/login" className="secondary-button">
                    Enterprise Demo <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
            <div className="trust-badges">
              <div className="badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#D4AF37" strokeWidth="2"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#D4AF37" strokeWidth="2"/>
                </svg>
                <span>Bank-level Security</span>
              </div>
              <div className="badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#D4AF37" strokeWidth="2"/>
                </svg>
                <span>SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-preview">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="tab active">Portfolio</div>
              <div className="tab">Transactions</div>
              <div className="tab">Analytics</div>
            </div>
            <div className="preview-content">
              <div className="preview-card">
                <div className="card-header">
                  <h3>Financial Overview</h3>
                  <select className="time-selector">
                    <option>Q2 2023</option>
                    <option>Q1 2023</option>
                    <option>2022</option>
                  </select>
                </div>
                <div className="stats-grid">
                  <div className="stat income">
                    <p>Assets</p>
                    <p>$124,850</p>
                    <div className="trend up">+2.4%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;