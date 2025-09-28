import axios from 'axios';

const API_URL = 'http://localhost:5002/api/investments';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all investments
export const getInvestments = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

// Add a new investment
export const addInvestment = async (investmentData) => {
  const response = await axios.post(API_URL, investmentData, getAuthHeaders());
  return response.data;
};