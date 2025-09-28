const Transaction = require('../models/Transaction');

// @desc    Save transactions from SMS
// @route   POST /api/sms/save
// @access  Private
exports.saveSmsTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body;
    const userId = req.user.id;

    const transactionsToSave = transactions.map(t => ({
      ...t,
      user: userId,
      smsData: t.smsData, // Ensure smsData is included
    }));

    await Transaction.insertMany(transactionsToSave);

    res.status(201).json({ success: true, message: 'Transactions saved successfully' });
  } catch (err) {
    console.error('Error saving SMS transactions:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};