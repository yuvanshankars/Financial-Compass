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
 * @returns {Promise} - Promise with the category summary data
 */
export const getCategorySummary = async (year, month) => {
  const response = await api.get('/api/transactions/summary/category', {
    params: { year, month }
  });
  return response.data;
};

/**
 * Get monthly trend for the year
 * @param {number} year - Year for the trend data
 * @returns {Promise} - Promise with the monthly trend data
 */
export const getMonthlyTrend = async (year) => {
  try {
    const response = await api.get('/api/transactions/summary/trend', {
      params: { year }
    });
    console.log('Monthly trend API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getMonthlyTrend:', error);
    throw error;
  }
};

/**
 * Get yearly comparison data
 * @param {number} startYear - Start year for comparison
 * @param {number} endYear - End year for comparison
 * @returns {Promise} - Promise with the yearly comparison data
 */
export const getYearlyComparison = async (startYear, endYear) => {
  // Collect data for each year
  const years = [];
  
  for (let year = startYear; year <= endYear; year++) {
    const trendResponse = await getMonthlyTrend(year);
    
    // Calculate yearly totals
    const yearData = trendResponse.data.monthlyData.reduce(
      (acc, month) => {
        acc.totalIncome += month.totalIncome;
        acc.totalExpense += month.totalExpense;
        acc.balance += month.balance;
        acc.transactionCount += month.transactionCount;
        return acc;
      },
      { year, totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }
    );
    
    years.push(yearData);
  }
  
  return {
    success: true,
    data: {
      years
    }
  };
};

export const reportService = {
  getMonthlySummary,
  getCategorySummary,
  getMonthlyTrend,
  getYearlyComparison
};

export default reportService;