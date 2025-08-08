/**
 * Utility functions for number formatting and calculations
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number with commas as thousands separators
 * @param {number} number - The number to format
 * @returns {string} - Formatted number string
 */
export const formatNumberWithCommas = (number) => {
  if (number === null || number === undefined) return '-';
  
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format a percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate the percentage change between two values
 * @param {number} oldValue - The old value
 * @param {number} newValue - The new value
 * @returns {number} - Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

/**
 * Round a number to a specified number of decimal places
 * @param {number} value - The value to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} - Rounded number
 */
export const roundToDecimals = (value, decimals = 2) => {
  if (value === null || value === undefined) return null;
  
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const numberUtils = {
  formatCurrency,
  formatNumberWithCommas,
  formatPercentage,
  calculatePercentageChange,
  roundToDecimals
};

export default numberUtils;