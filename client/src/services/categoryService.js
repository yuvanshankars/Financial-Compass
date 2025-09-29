import api from './api';

/**
 * Get all categories
 * @returns {Promise} Promise with the response data
 */
export const getCategories = async () => {
  const response = await api.get('/api/categories');
  return response.data;
};

/**
 * Get a category by ID
 * @param {string} id - Category ID
 * @returns {Promise} Promise with the response data
 */
export const getCategory = async (id) => {
  const response = await api.get(`/api/categories/${id}`);
  return response.data;
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name
 * @param {string} categoryData.color - Category color
 * @param {string} categoryData.icon - Category icon
 * @returns {Promise} Promise with the response data
 */
export const createCategory = async (categoryData) => {
  const response = await api.post('/api/categories', categoryData);
  return response.data;
};

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Category data
 * @returns {Promise} Promise with the response data
 */
export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/api/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise} Promise with the response data
 */
export const deleteCategory = async (id) => {
  const response = await api.delete(`/api/categories/${id}`);
  return response.data;
};

/**
 * Get default category suggestions
 * @returns {Promise} Promise with the response data
 */
export const getCategorySuggestions = async () => {
  const response = await api.get('/api/categories/suggestions');
  return response.data;
};

/**
 * Create multiple categories at once
 * @param {Array} categoriesData - Array of category objects
 * @returns {Promise} Promise with the response data
 */
export const createMultipleCategories = async (categoriesData) => {
  const promises = categoriesData.map(categoryData => 
    api.post('/api/categories', categoryData)
  );
  const responses = await Promise.allSettled(promises);
  
  const successful = responses
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value.data);
    
  const failed = responses
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);
    
  return {
    successful,
    failed,
    total: categoriesData.length,
    successCount: successful.length,
    failureCount: failed.length
  };
};