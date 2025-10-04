const cron = require('node-cron');
const { handleRecurring } = require('./controllers/recurringTransactions');

// Schedule to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running recurring transactions check...');
  handleRecurring();
});