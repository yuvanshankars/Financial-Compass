import api from './api';

export const getFinancialGoals = () => api.get('/financial-goals');
export const addFinancialGoal = (data) => api.post('/financial-goals', data);
export const updateFinancialGoal = (id, data) => api.put(`/financial-goals/${id}`, data);
export const deleteFinancialGoal = (id) => api.delete(`/financial-goals/${id}`);