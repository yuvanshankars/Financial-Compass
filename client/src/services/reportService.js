import api from './api';

/**
 * Get monthly summary (total income, expenses, balance)
 * @param {number} year - Year for the summary
 * @param {number} month - Month for the summary (1-12)
 * @returns {Promise} - Promise with the monthly summary data
 */
export const getMonthlySummary = async (year, month) => {
  const response = await api.get('/api/transactions/summary/monthly', {
    params: { year, month }
  });
  return response.data;
};

/**
 * Get spending by category for a month
 * @param {number} year - Year for the summary
 * @param {number} month - Month for the summary (1-12)
 * @param {boolean} cacheBuster - Whether to use cache buster
 * @returns {Promise} - Promise with the category summary data
 */
export const getCategorySummary = async (year, month, cacheBuster) => {
  try {
    const params = { year, month };
    if (cacheBuster) {
      params._ = new Date().getTime();
    }
    const response = await api.get('/api/transactions/summary/category', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching category summary in service:', error);
    throw error;
  }
};

/**
 * Get monthly trend for the year
 * @param {number} year - Year for the trend data
 * @param {boolean} cacheBuster - Whether to use cache buster
 * @returns {Promise} - Promise with the monthly trend data
 */
export const getMonthlyTrend = async (year, cacheBuster) => {
  try {
    const params = { year };
    if (cacheBuster) {
      params._ = new Date().getTime();
    }
    const response = await api.get('/api/transactions/summary/trend', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly trend in service:', error);
    throw error;
  }
};

export const getDailyTrend = async (year, month, cacheBuster) => {
  try {
    const params = { year, month };
    if (cacheBuster) {
      params._ = new Date().getTime();
    }
    const response = await api.get('/api/transactions/summary/daily', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily trend in service:', error);
    throw error;
  }
};

export const reportService = {
  getMonthlySummary,
  getCategorySummary,
  getMonthlyTrend,
  getDailyTrend,
};

export default reportService;