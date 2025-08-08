import api from './api';

/**
 * Get all budgets
 * @param {Object} params - Query parameters
 * @param {string} [params.month] - Month in YYYY-MM format
 * @returns {Promise} Promise with the response data
 */
export const getBudgets = async (params = {}) => {
  const response = await api.get('/budgets', { params });
  return response.data;
};

/**
 * Get a budget by ID
 * @param {string} id - Budget ID
 * @returns {Promise} Promise with the response data
 */
export const getBudget = async (id) => {
  const response = await api.get(`/budgets/${id}`);
  return response.data;
};

/**
 * Create a new budget
 * @param {Object} budgetData - Budget data
 * @param {string} budgetData.category - Category ID
 * @param {number} budgetData.amount - Budget amount
 * @param {string} budgetData.month - Month in YYYY-MM format
 * @returns {Promise} Promise with the response data
 */
export const createBudget = async (budgetData) => {
  const response = await api.post('/budgets', budgetData);
  return response.data;
};

/**
 * Update a budget
 * @param {string} id - Budget ID
 * @param {Object} budgetData - Budget data
 * @returns {Promise} Promise with the response data
 */
export const updateBudget = async (id, budgetData) => {
  const response = await api.put(`/budgets/${id}`, budgetData);
  return response.data;
};

/**
 * Delete a budget
 * @param {string} id - Budget ID
 * @returns {Promise} Promise with the response data
 */
export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

/**
 * Get budget progress
 * @param {Object} params - Query parameters
 * @param {string} [params.month] - Month in YYYY-MM format
 * @returns {Promise} Promise with the response data
 */
export const getBudgetProgress = async (params = {}) => {
  const response = await api.get('/budgets/progress', { params });
  return response.data;
};