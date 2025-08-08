import api from './api';

/**
 * Get all recurring transactions
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Number of items per page
 * @param {string} [params.sort] - Sort field
 * @param {string} [params.order] - Sort order (asc, desc)
 * @returns {Promise} Promise with the response data
 */
export const getRecurringTransactions = async (params = {}) => {
  const response = await api.get('/recurring-transactions', { params });
  return response.data;
};

/**
 * Get a recurring transaction by ID
 * @param {string} id - Recurring transaction ID
 * @returns {Promise} Promise with the response data
 */
export const getRecurringTransaction = async (id) => {
  const response = await api.get(`/recurring-transactions/${id}`);
  return response.data;
};

/**
 * Create a new recurring transaction
 * @param {Object} transactionData - Recurring transaction data
 * @param {string} transactionData.description - Transaction description
 * @param {number} transactionData.amount - Transaction amount
 * @param {string} transactionData.type - Transaction type (income/expense)
 * @param {string} transactionData.category - Category ID
 * @param {string} transactionData.frequency - Frequency (daily, weekly, monthly, yearly)
 * @param {string} transactionData.startDate - Start date
 * @param {string} [transactionData.endDate] - End date (optional)
 * @returns {Promise} Promise with the response data
 */
export const createRecurringTransaction = async (transactionData) => {
  const response = await api.post('/recurring-transactions', transactionData);
  return response.data;
};

/**
 * Update a recurring transaction
 * @param {string} id - Recurring transaction ID
 * @param {Object} transactionData - Recurring transaction data
 * @returns {Promise} Promise with the response data
 */
export const updateRecurringTransaction = async (id, transactionData) => {
  const response = await api.put(`/recurring-transactions/${id}`, transactionData);
  return response.data;
};

/**
 * Delete a recurring transaction
 * @param {string} id - Recurring transaction ID
 * @returns {Promise} Promise with the response data
 */
export const deleteRecurringTransaction = async (id) => {
  const response = await api.delete(`/recurring-transactions/${id}`);
  return response.data;
};

/**
 * Generate transactions from a recurring transaction
 * @param {string} id - Recurring transaction ID
 * @param {Object} params - Parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @returns {Promise} Promise with the response data
 */
export const generateTransactions = async (id, params) => {
  const response = await api.post(`/recurring-transactions/${id}/generate`, params);
  return response.data;
};