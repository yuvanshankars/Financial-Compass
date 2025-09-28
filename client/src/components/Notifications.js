import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../services/notificationService';
import { toast } from 'react-hot-toast';

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
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="fixed top-16 right-4 w-80 bg-white shadow-lg rounded-lg p-4">
      <h3 className="text-lg font-bold mb-2">Notifications</h3>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification._id} className={`p-2 rounded-lg ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
              <p className="font-bold">{notification.title}</p>
              <p>{notification.message}</p>
              {!notification.read && (
                <button onClick={() => handleMarkAsRead(notification._id)} className="text-sm text-blue-500 hover:underline">
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;