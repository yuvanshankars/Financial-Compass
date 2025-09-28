import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-logo">
          <span className="logo-icon">$</span>
          <span>ExpenseTracker</span>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h5>Product</h5>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Security</a>
          </div>
          <div className="link-group">
            <h5>Company</h5>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="link-group">
            <h5>Resources</h5>
            <a href="#">Blog</a>
            <a href="#">Help Center</a>
            <a href="#">API</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.</p>
        <div className="legal-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;