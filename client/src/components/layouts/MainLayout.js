import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import FinancialAssistant from '../FinancialAssistant';
import { getNotifications } from '../../services/notificationService';
import {
  Bars3Icon, // Import Bars3Icon here
} from '@heroicons/react/24/outline'; // Adjust the import path as necessary

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications for indicator...');
        const res = await getNotifications();
        console.log('Notifications response:', res);
        const unread = res.data.filter(n => !n.read).length;
        console.log('Unread count:', unread);
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to fetch notifications for indicator:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]"> {/* Lighter background for better contrast with dark sidebar */}

      {/* Sidebar Component */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
        handleLogout={handleLogout}
        unreadCount={unreadCount}
      />

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 border-b border-gray-200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
            {/* Content Container with slight fade-in effect */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>

      <FinancialAssistant />
    </div>
  );
};

export default MainLayout;