import api from './api';

export const getRecurringTransactions = async () => {
  const response = await api.get('/api/recurring-transactions');
  return response.data;
};

export const addRecurringTransaction = async (transactionData) => {
  const response = await api.post('/api/recurring-transactions', transactionData);
  return response.data;
};

export const updateRecurringTransaction = async (id, transactionData) => {
  const response = await api.put(`/api/recurring-transactions/${id}`, transactionData);
  return response.data;
};

export const deleteRecurringTransaction = async (id) => {
  const response = await api.delete(`/api/recurring-transactions/${id}`);
  return response.data;
};