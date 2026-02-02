import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../services/notificationService';
import { toast } from 'react-hot-toast';
import { MonthlyReportIcon, WeeklyReportIcon, DailyReportIcon, TransactionIcon } from './icons';
import { BellIcon, CheckCircleIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'monthly_report':
      return <MonthlyReportIcon className="h-6 w-6 text-emerald-400" />;
    case 'weekly_report':
      return <WeeklyReportIcon className="h-6 w-6 text-teal-400" />;
    case 'daily_report':
      return <DailyReportIcon className="h-6 w-6 text-blue-400" />;
    case 'new_transaction':
      return <TransactionIcon className="h-6 w-6 text-yellow-400" />;
    default:
      return <BellIcon className="h-6 w-6 text-gray-400" />;
  }
};

const getNotificationStyles = (type) => {
  switch (type) {
    case 'monthly_report':
    case 'income':
      return 'border-emerald-500/50 hover:bg-emerald-900/10';
    case 'expense':
      return 'border-red-500/50 hover:bg-red-900/10';
    default:
      return 'border-gray-700/50 hover:bg-gray-800/50';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      // Ensure we handle the data structure correctly
      setNotifications(res.data || res);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      toast.success('Marked as read', {
        style: {
          background: '#1E293B',
          color: '#fff',
        }
      });
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (notifications.filter(n => !n.read).length === 0) return;

      await Promise.all(notifications.filter(n => !n.read).map(n => markAsRead(n._id)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All marked as read', {
        style: {
          background: '#1E293B',
          color: '#fff',
        }
      });
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-[#0F172A] min-h-screen text-white p-6">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
              Notifications
            </h1>
            <p className="text-gray-400 mt-2">
              Stay updated with your financial activity
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${unreadCount > 0
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50'
              : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
              }`}
          >
            <CheckCircleIcon className="h-5 w-5" />
            <span>Mark all as read</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-[#1E293B]/50 rounded-2xl p-12 text-center border border-gray-800">
            <div className="mx-auto h-24 w-24 bg-[#0F172A] rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-gray-700">
              <BellIcon className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
            <p className="text-gray-400">
              We'll notify you when important financial events occur.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`relative group overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${getNotificationStyles(notification.type)
                  } ${notification.read
                    ? 'bg-[#1E293B]/30 border-gray-800 opacity-75'
                    : 'bg-[#1E293B] border-gray-700 shadow-lg shadow-black/20'
                  }`}
              >
                {!notification.read && (
                  <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                )}

                <div className="flex items-start gap-5">
                  <div className={`flex-shrink-0 p-3 rounded-xl bg-[#0F172A] border border-gray-700/50 ${!notification.read ? 'shadow-md ring-1 ring-emerald-500/20' : ''}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-lg font-semibold truncate pr-8 ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="mt-1 text-gray-400 leading-relaxed text-sm">
                      {/* Replace $ with ₹ just in case the backend didn't do it */}
                      {notification.message.replace(/\$/g, '₹')}
                    </p>

                    {!notification.read && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                        >
                          Mark as Read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;