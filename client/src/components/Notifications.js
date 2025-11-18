import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../services/notificationService';
import { toast } from 'react-hot-toast';
import { MonthlyReportIcon, WeeklyReportIcon, DailyReportIcon, TransactionIcon } from './icons';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'monthly_report':
      return <MonthlyReportIcon />;
    case 'weekly_report':
      return <WeeklyReportIcon />;
    case 'daily_report':
      return <DailyReportIcon />;
    case 'new_transaction':
      return <TransactionIcon />;
    default:
      return null;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'income':
      return 'border-green-500';
    case 'expense':
      return 'border-red-500';
    default:
      return 'border-gray-200';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

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
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => markAsRead(n._id)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button 
          onClick={handleMarkAllAsRead}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600"
        >
          Mark All as Read
        </button>
      </div>
      {notifications.length === 0 ? (
        <p className="text-gray-500">You have no new notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white shadow-md rounded-lg p-4 flex items-start justify-between border-l-4 ${getNotificationColor(notification.type)} ${
                notification.read ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="mr-4">{getNotificationIcon(notification.type)}</div>
                <div>
                  <p className="font-bold text-lg">{notification.title}</p>
                  <p className="text-gray-600">{notification.message}</p>
                </div>
              </div>
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="ml-4 bg-green-500 text-white px-2 py-1 rounded-md text-sm hover:bg-green-600"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;