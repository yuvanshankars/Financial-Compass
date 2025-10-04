import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import setAuthToken from './utils/setAuthToken';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Budgets from './pages/Budgets';
import Investments from './pages/Investments';
import RecurringTransactions from './pages/RecurringTransactions';

import SmsSync from './pages/SmsSync';
import NotFound from './pages/NotFound';
import SplashScreen from './components/SplashScreen';


// Wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Wrapper for public routes
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  const { loading, isLoggingIn } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || showSplash || isLoggingIn) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><MainLayout><Transactions /></MainLayout></ProtectedRoute>} />
      <Route path="/transactions/new" element={<ProtectedRoute><MainLayout><AddTransaction /></MainLayout></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><MainLayout><Categories /></MainLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
      <Route path="/budgets" element={<ProtectedRoute><MainLayout><Budgets /></MainLayout></ProtectedRoute>} />
      <Route path="/investments" element={<ProtectedRoute><MainLayout><Investments /></MainLayout></ProtectedRoute>} />
      <Route path="/recurring-transactions" element={<ProtectedRoute><MainLayout><RecurringTransactions /></MainLayout></ProtectedRoute>} />

      <Route path="/sms-sync" element={<ProtectedRoute><MainLayout><SmsSync /></MainLayout></ProtectedRoute>} />
      

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;