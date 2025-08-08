/**
 * Date utility functions for the application
 */

/**
 * Get the first day of the current month
 * @returns {Date} First day of the current month
 */
const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the last day of the current month
 * @returns {Date} Last day of the current month
 */
const getLastDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get the first day of the current year
 * @returns {Date} First day of the current year
 */
const getFirstDayOfYear = () => {
  const date = new Date();
  return new Date(date.getFullYear(), 0, 1);
};

/**
 * Get the last day of the current year
 * @returns {Date} Last day of the current year
 */
const getLastDayOfYear = () => {
  const date = new Date();
  return new Date(date.getFullYear(), 11, 31);
};

/**
 * Get the date for the next occurrence based on frequency
 * @param {Date} startDate - The start date
 * @param {string} frequency - The frequency (daily, weekly, monthly, yearly)
 * @param {number} dayOfWeek - The day of week (0-6, Sunday to Saturday) for weekly frequency
 * @param {Date} lastProcessedDate - The last processed date
 * @returns {Date|null} The next occurrence date or null if no occurrence
 */
const getNextOccurrence = (startDate, frequency, dayOfWeek, lastProcessedDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // If start date is in the future, return null
  if (start > today) {
    return null;
  }
  
  let baseDate = lastProcessedDate ? new Date(lastProcessedDate) : start;
  baseDate.setHours(0, 0, 0, 0);
  
  let nextDate;
  
  switch (frequency) {
    case 'daily':
      nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + 1);
      break;
      
    case 'weekly':
      nextDate = new Date(baseDate);
      // Move to the next week
      nextDate.setDate(baseDate.getDate() + 7);
      
      // If dayOfWeek is specified, adjust to that day
      if (dayOfWeek !== undefined && dayOfWeek >= 0 && dayOfWeek <= 6) {
        const currentDay = nextDate.getDay();
        const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
        nextDate.setDate(nextDate.getDate() + daysToAdd);
      }
      break;
      
    case 'monthly':
      nextDate = new Date(baseDate);
      nextDate.setMonth(baseDate.getMonth() + 1);
      break;
      
    case 'yearly':
      nextDate = new Date(baseDate);
      nextDate.setFullYear(baseDate.getFullYear() + 1);
      break;
      
    default:
      return null;
  }
  
  return nextDate <= today ? nextDate : null;
};

module.exports = {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getFirstDayOfYear,
  getLastDayOfYear,
  getNextOccurrence
};