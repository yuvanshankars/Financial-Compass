import api from './api';

/**
 * Get all transactions with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Number of items per page
 * @param {string} [params.sort] - Sort field
 * @param {string} [params.type] - Transaction type (expense or income)
 * @param {string} [params.category] - Category ID
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @param {string} [params.search] - Search term
 * @returns {Promise} Promise with the response data
 */
export const getTransactions = async (params = {}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

/**
 * Get a transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise} Promise with the response data
 */
export const getTransaction = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise} Promise with the response data
 */
export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

/**
 * Update a transaction
 * @param {string} id - Transaction ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise} Promise with the response data
 */
export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);
  return response.data;
};

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise} Promise with the response data
 */
export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

/**
 * Get transaction statistics
 * @param {Object} params - Query parameters
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @returns {Promise} Promise with the response data
 */
export const getTransactionStats = async (params = {}) => {
  const response = await api.get('/transactions/stats', { params });
  return response.data;
};