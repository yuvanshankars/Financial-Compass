import api from './api';

export const getNotifications = async () => {
  const res = await api.get('/api/notifications');
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await api.put(`/api/notifications/${id}/read`);
  return res.data;
};

export const createNotification = async (notification) => {
  const res = await api.post('/api/notifications', notification);
  return res.data;
};