const cron = require('node-cron');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running recurring transaction job...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurringTransactions = await RecurringTransaction.find({
    startDate: { $lte: today },
    $or: [{ endDate: { $gte: today } }, { endDate: null }],
  });

  for (const rTransaction of recurringTransactions) {
    let shouldCreateTransaction = false;
    const lastCreated = rTransaction.lastCreated ? new Date(rTransaction.lastCreated) : null;

    switch (rTransaction.frequency) {
      case 'Daily':
        shouldCreateTransaction = true;
        break;
      case 'Weekly':
        if (!lastCreated || (today.getTime() - lastCreated.getTime()) >= 7 * 24 * 60 * 60 * 1000) {
          shouldCreateTransaction = true;
        }
        break;
      case 'Every 2 Weeks':
        if (!lastCreated || (today.getTime() - lastCreated.getTime()) >= 14 * 24 * 60 * 60 * 1000) {
          shouldCreateTransaction = true;
        }
        break;
      case 'Monthly':
        if (!lastCreated || lastCreated.getMonth() !== today.getMonth()) {
          shouldCreateTransaction = true;
        }
        break;
      case 'Quarterly':
        if (!lastCreated || Math.floor(lastCreated.getMonth() / 3) !== Math.floor(today.getMonth() / 3)) {
          shouldCreateTransaction = true;
        }
        break;
      case 'Yearly':
        if (!lastCreated || lastCreated.getFullYear() !== today.getFullYear()) {
          shouldCreateTransaction = true;
        }
        break;
    }

    if (shouldCreateTransaction) {
      await Transaction.create({
        user: rTransaction.user,
        title: rTransaction.title,
        amount: rTransaction.amount,
        type: rTransaction.type,
        category: rTransaction.category,
        date: today,
        paymentMethod: rTransaction.paymentMethod,
        notes: rTransaction.notes,
      });

      await Notification.create({
        user: rTransaction.user,
        title: 'Recurring Transaction Processed',
        message: `Your recurring transaction "${rTransaction.title}" for $${rTransaction.amount} has been processed.`,
      });

      rTransaction.lastCreated = today;
      await rTransaction.save();
    }
  }
});