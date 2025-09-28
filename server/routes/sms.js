const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// @route   POST api/sms/save
// @desc    Save transactions from SMS
// @access  Private
router.post('/save', protect, async (req, res) => {
  const { transactions } = req.body;

  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ msg: 'Invalid data' });
  }

  try {
    const transactionsToSave = transactions.map(t => ({
      ...t,
      user: req.user.id,
      source: 'sms'
    }));

    const result = await Transaction.insertMany(transactionsToSave);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;