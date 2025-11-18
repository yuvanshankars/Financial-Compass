import api from './api';

// Get all investments
export const getInvestments = async () => {
  const response = await api.get('/api/investments');
  return response.data;
};

// Add a new investment
export const addInvestment = async (investmentData) => {
  const response = await api.post('/api/investments', investmentData);
  return response.data;
};

// Update an investment
export const updateInvestment = async (id, investmentData) => {
  const response = await api.put(`/api/investments/${id}`, investmentData);
  return response.data;
};

// Delete an investment
export const deleteInvestment = async (id) => {
  const response = await api.delete(`/api/investments/${id}`);
  return response.data;
};