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