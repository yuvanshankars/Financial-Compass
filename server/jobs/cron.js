const cron = require('node-cron');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const User = require('../models/User');

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
        message: `Your recurring transaction "${rTransaction.title}" for ₹${rTransaction.amount} has been processed.`,
      });

      rTransaction.lastCreated = today;
      await rTransaction.save();
    }
  }
});

// Schedule a job to run every day at 11:59 PM
cron.schedule('59 23 * * *', async () => {
  console.log('Generating daily reports...');
  const users = await User.find({});
  for (const user of users) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const transactions = await Transaction.find({
      user: user._id,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    await Notification.create({
      user: user._id,
      title: 'Daily Report',
      message: `Your daily report is ready. Income: ₹${income.toFixed(2)}, Expenses: ₹${expenses.toFixed(2)}`,
      type: 'daily_report',
    });
  }
});

// Schedule a job to run every Sunday at 11:59 PM
cron.schedule('59 23 * * 0', async () => {
  console.log('Generating weekly reports...');
  const users = await User.find({});
  for (const user of users) {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);

    const transactions = await Transaction.find({
      user: user._id,
      date: { $gte: startOfWeek, $lt: endOfWeek },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    await Notification.create({
      user: user._id,
      title: 'Weekly Report',
      message: `Your weekly report is ready. Income: ₹${income.toFixed(2)}, Expenses: ₹${expenses.toFixed(2)}`,
      type: 'weekly_report',
    });
  }
});

// Schedule a job to run on the last day of every month at 11:59 PM
cron.schedule('59 23 L * *', async () => {
  console.log('Generating monthly reports...');
  const users = await User.find({});
  for (const user of users) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const transactions = await Transaction.find({
      user: user._id,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    await Notification.create({
      user: user._id,
      title: 'Monthly Report',
      message: `Your monthly report is ready. Income: ₹${income.toFixed(2)}, Expenses: ₹${expenses.toFixed(2)}`,
      type: 'monthly_report',
    });
  }
});