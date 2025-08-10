import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">$</span>
            <span>ExpenseTracker</span>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="nav-button">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Sign In
                </Link>
                <Link to="/register" className="nav-button">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero section */}
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
                    <div className="stat expense">
                      <p>Liabilities</p>
                      <p>$42,180</p>
                      <div className="trend down">-1.2%</div>
                    </div>
                    <div className="stat balance">
                      <p>Net Worth</p>
                      <p>$82,670</p>
                      <div className="trend up">+4.1%</div>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="performance-chart">
                    <div className="chart-placeholder"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="features-section">
        <div className="section-header">
          <h2 className="section-subtitle">ENTERPRISE-GRADE TOOLS</h2>
          <h3 className="section-title">Institutional Quality Financial Management</h3>
          <p className="section-description">
            ExpenseTracker provides the sophisticated tools professionals need with 
            the simplicity personal finance demands.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#D4AF37">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h4>Comprehensive Tracking</h4>
            <p>
              Monitor all accounts in one place with real-time synchronization and 
              detailed transaction categorization.
            </p>
            <div className="feature-link">
              <a href="#">Learn more</a>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33325 8H12.6666" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 3.33334L12.6667 8.00001L8 12.6667" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#D4AF37">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4>Advanced Budgeting</h4>
            <p>
              Set targets by category with rollover balances and predictive 
              forecasting based on your spending patterns.
            </p>
            <div className="feature-link">
              <a href="#">Learn more</a>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33325 8H12.6666" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 3.33334L12.6667 8.00001L8 12.6667" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#D4AF37">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h4>Portfolio Analytics</h4>
            <p>
              Visualize your financial health with institutional-grade dashboards 
              and customizable reporting.
            </p>
            <div className="feature-link">
              <a href="#">Learn more</a>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33325 8H12.6666" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 3.33334L12.6667 8.00001L8 12.6667" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
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

      {/* Footer */}
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

      {/* CSS Styles */}
      <style jsx>{`
        /* ===== Global Styles ===== */
        .landing-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FFFFFF;
          color: #0B1F3A;
          min-height: 100vh;
          line-height: 1.6;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        /* ===== Navigation ===== */
        .navbar {
          background: #0B1F3A;
          color: #FFFFFF;
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(11, 31, 58, 0.1);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .logo-icon {
          background: #2ECC71;
          color: #0B1F3A;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-link {
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #D4AF37;
        }

        .nav-button {
          background: #2ECC71;
          color: #0B1F3A;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .nav-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
        }

        /* ===== Hero Section ===== */
        .hero-section {
          background: #0B1F3A;
          color: #FFFFFF;
          padding: 80px 0 120px;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(135deg, rgba(11, 31, 58, 0.9) 0%, rgba(46, 204, 113, 0.15) 100%);
          z-index: 1;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          padding: 40px 0;
        }

        .hero-text h1 {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
          color: #FFFFFF;
        }

        .hero-text p {
          font-size: 1.125rem;
          line-height: 1.6;
          margin-bottom: 32px;
          color: #ECEFF1;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 40px;
        }

        .trust-badges {
          display: flex;
          gap: 24px;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #ECEFF1;
        }

        .badge svg {
          width: 16px;
          height: 16px;
        }

        /* ===== Dashboard Preview ===== */
        .hero-preview {
          position: relative;
          z-index: 2;
        }

        .dashboard-preview {
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(11, 31, 58, 0.2);
          border: 1px solid rgba(236, 239, 241, 0.3);
        }

        .preview-header {
          display: flex;
          background: #FFFFFF;
          border-bottom: 1px solid #ECEFF1;
        }

        .tab {
          padding: 12px 24px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #607D8B;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab.active {
          color: #0B1F3A;
          border-bottom: 2px solid #2ECC71;
        }

        .preview-content {
          padding: 24px;
        }

        .preview-card {
          background: #FFFFFF;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .preview-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0B1F3A;
        }

        .time-selector {
          background: #ECEFF1;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 0.875rem;
          color: #0B1F3A;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat {
          padding: 16px;
          border-radius: 8px;
          background: #F5F7FA;
        }

        .stat p:first-child {
          font-size: 0.75rem;
          color: #607D8B;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat p:nth-child(2) {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0B1F3A;
          margin-bottom: 6px;
        }

        .trend {
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .trend.up {
          background: rgba(46, 204, 113, 0.1);
          color: #2ECC71;
        }

        .trend.down {
          background: rgba(235, 87, 87, 0.1);
          color: #EB5757;
        }

        .divider {
          height: 1px;
          background: #ECEFF1;
          margin: 20px 0;
        }

        .performance-chart {
          height: 200px;
          background: #F5F7FA;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .chart-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #F5F7FA 0%, #E8EBF0 50%, #F5F7FA 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ===== Features Section ===== */
        .features-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 24px;
        }

        .section-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 80px;
        }

        .section-subtitle {
          font-size: 0.875rem;
          font-weight: 600;
          color: #2ECC71;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 20px;
          color: #0B1F3A;
        }

        .section-description {
          font-size: 1.125rem;
          line-height: 1.6;
          color: #607D8B;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .feature-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 32px;
          border: 1px solid #ECEFF1;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(11, 31, 58, 0.05);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(11, 31, 58, 0.1);
          border-color: #D4AF37;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .feature-icon svg {
          width: 24px;
          height: 24px;
        }

        .feature-card h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #0B1F3A;
        }

        .feature-card p {
          color: #607D8B;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .feature-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2ECC71;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .feature-link a:hover {
          text-decoration: underline;
        }

        /* ===== CTA Section ===== */
        .cta-section {
          background: #0B1F3A;
          color: #FFFFFF;
          padding: 100px 24px;
        }

        .cta-container {
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #0B1F3A 0%, #1A3A6A 100%);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .cta-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232ECC71' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .cta-content {
          position: relative;
          z-index: 2;
          padding: 80px;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 16px;
          color: #FFFFFF;
        }

        .cta-content p {
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto 32px;
          color: #ECEFF1;
        }

        .cta-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        /* ===== Footer ===== */
        .app-footer {
          background: #ECEFF1;
          color: #0B1F3A;
          padding: 60px 0 0;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 80px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.25rem;
          margin-bottom: 20px;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .link-group h5 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #2ECC71;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .link-group a {
          display: block;
          margin-bottom: 12px;
          font-size: 0.875rem;
          color: #607D8B;
          transition: color 0.2s;
        }

        .link-group a:hover {
          color: #0B1F3A;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #CFD8DC;
          margin-top: 60px;
        }

        .footer-bottom p {
          font-size: 0.75rem;
          color: #607D8B;
        }

        .legal-links {
          display: flex;
          gap: 20px;
        }

        .legal-links a {
          font-size: 0.75rem;
          color: #607D8B;
          transition: color 0.2s;
        }

        .legal-links a:hover {
          color: #0B1F3A;
        }

        /* ===== Buttons ===== */
        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          background: #2ECC71;
          color: #0B1F3A;
          box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
          border: none;
          cursor: pointer;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
        }

        .primary-button.light {
          background: #FFFFFF;
          color: #0B1F3A;
        }

        .primary-button.light:hover {
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
        }

        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          color: #FFFFFF;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* ===== Responsive Design ===== */
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-content {
            text-align: center;
          }

          .hero-text p {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions, .trust-badges {
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .hero-text h1 {
            font-size: 2.25rem;
          }

          .section-title, .cta-content h2 {
            font-size: 1.75rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .footer-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .cta-content {
            padding: 60px 24px;
          }

          .cta-actions {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .nav-actions {
            gap: 12px;
          }

          .nav-button {
            padding: 8px 16px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .trust-badges {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;