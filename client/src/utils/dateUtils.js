/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateToString = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date to a human-readable string (e.g., "January 1, 2023")
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateToReadable = (date) => {
  if (!date) return '';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Get the first day of the month for a given date
 * @param {Date} date - The date
 * @returns {Date} - First day of the month
 */
export const getFirstDayOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get the last day of the month for a given date
 * @param {Date} date - The date
 * @returns {Date} - Last day of the month
 */
export const getLastDayOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Get an array of month names
 * @returns {string[]} - Array of month names
 */
export const getMonthNames = () => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Get the current month name
 * @returns {string} - Current month name
 */
export const getCurrentMonthName = () => {
  return getMonthNames()[new Date().getMonth()];
};

/**
 * Get month name by index (0-11)
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} - Month name
 */
export const getMonthNameByIndex = (monthIndex) => {
  return getMonthNames()[monthIndex];
};

const dateUtils = {
  formatDateToString,
  formatDateToReadable,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getMonthNames,
  getCurrentMonthName,
  getMonthNameByIndex
};

export default dateUtils;