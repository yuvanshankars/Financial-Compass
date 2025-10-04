const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

// @desc    Get all recurring transactions
// @route   GET /api/recurring-transactions
// @access  Private
exports.getRecurringTransactions = async (req, res, next) => {
  try {
    const recurringTransactions = await RecurringTransaction.find({ user: req.user.id }).populate('category');

    return res.status(200).json({
      success: true,
      count: recurringTransactions.length,
      data: recurringTransactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Add recurring transaction
// @route   POST /api/recurring-transactions
// @access  Private
exports.addRecurringTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, frequency, startDate, endDate, paymentMethod, notes } = req.body;

    const recurringTransaction = await RecurringTransaction.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
      frequency,
      startDate,
      endDate,
      paymentMethod,
      notes,
    });

    return res.status(201).json({
      success: true,
      data: recurringTransaction,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error',
      });
    }
  }
};

exports.handleRecurring = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurringTransactions = await RecurringTransaction.find({
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  for (const recurring of recurringTransactions) {
    const transactionDate = new Date(recurring.startDate);
    if (transactionDate.getDate() === today.getDate()) {
      const transaction = new Transaction({
        user: recurring.user,
        title: recurring.title,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        date: today,
        paymentMethod: recurring.paymentMethod,
        notes: recurring.notes,
      });
      await transaction.save();
    }
  }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring-transactions/:id
// @access  Private
exports.updateRecurringTransaction = async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        error: 'No recurring transaction found',
      });
    }

    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this recurring transaction',
      });
    }

    const updatedRecurringTransaction = await RecurringTransaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category');

    return res.status(200).json({
      success: true,
      data: updatedRecurringTransaction,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring-transactions/:id
// @access  Private
exports.deleteRecurringTransaction = async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        error: 'No recurring transaction found',
      });
    }

    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this recurring transaction',
      });
    }

    await recurringTransaction.remove();

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};