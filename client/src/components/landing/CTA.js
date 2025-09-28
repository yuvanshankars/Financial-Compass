import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CTA = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <h2>Ready to elevate your financial management?</h2>
          <p>
            Join executives, professionals, and savvy individuals who trust 
            ExpenseTracker for their personal finance needs.
          </p>
          <div className="cta-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="primary-button light">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="primary-button">
                  Start Free Trial
                </Link>
                <Link to="/login" className="secondary-button">
                  Schedule Demo <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;