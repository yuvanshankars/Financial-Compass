import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Chatbot from '../Chatbot';
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,

  CurrencyDollarIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  BanknotesIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Budgets', href: '/budgets', icon: CurrencyDollarIcon },
    { name: 'Recurring', href: '/recurring-transactions', icon: ArrowPathIcon },

    { name: 'Investments', href: '/investments', icon: BanknotesIcon },
    { name: 'Add from SMS', href: '/sms-sync', icon: ChatBubbleBottomCenterTextIcon }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#ECEFF1]">
      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
        aria-hidden="true"
      >
        <div
          className="fixed inset-0 bg-[#0B1F3A] bg-opacity-80"
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        <div className="fixed inset-y-0 left-0 flex max-w-xs w-full flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 border-b border-[#ECEFF1]">
            <div className="flex items-center">
            <span className="text-2xl font-extrabold tracking-tight shadow-sm animate-color-shift">
            ExpenseTracker
          </span>
            </div>
            <button
              type="button"
              className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-[#607D8B] hover:text-[#0B1F3A] hover:bg-[#ECEFF1] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-lg ${isActive
                      ? 'bg-[#0B1F3A] text-white'
                      : 'text-[#0B1F3A] hover:bg-[#ECEFF1]'
                      } transition-colors`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${isActive ? 'text-white' : 'text-[#607D8B] group-hover:text-[#0B1F3A]'}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-shrink-0 border-t border-[#ECEFF1] p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-10 w-10 text-[#607D8B]" />
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-[#0B1F3A]">{user?.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-[#607D8B] hover:text-[#0B1F3A] flex items-center mt-1 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-[#CFD8DC] bg-white shadow-sm">
          <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
            <div className="flex items-center flex-shrink-0 px-6">
            <span className="text-2xl font-extrabold tracking-tight shadow-sm animate-color-shift">
            ExpenseTracker
          </span>
            </div>
            <nav className="mt-10 flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive
                      ? 'bg-[#0B1F3A] text-white'
                      : 'text-[#0B1F3A] hover:bg-[#ECEFF1]'
                      } transition-colors`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-[#607D8B] group-hover:text-[#0B1F3A]'}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-[#ECEFF1] p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-10 w-10 text-[#607D8B]" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#0B1F3A]">{user?.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-[#607D8B] hover:text-[#0B1F3A] flex items-center mt-1 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 border-b border-[#ECEFF1]">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-[#607D8B] hover:text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl shadow border border-[#CFD8DC] p-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-4">
        {/* SMS Sync Icon */}
        <Link
          to="/sms-sync"
          className="bg-[#0B1F3A] text-white rounded-full p-4 shadow-lg hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          title="Add from SMS"
        >
          <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
        </Link>

        {/* Chatbot */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="bg-[#0B1F3A] text-white rounded-full p-4 shadow-lg hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          title="Open Chatbot"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
        </button>
      </div>

      {chatbotOpen && (
        <div className="fixed bottom-20 right-4 z-50">
          <Chatbot />
        </div>
      )}
    </div>
  );
};

export default MainLayout;