const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get all recurring transactions for a user
// @route   GET /api/recurring-transactions
// @access  Private
exports.getRecurringTransactions = async (req, res) => {
  try {
    // Build query
    let query = { user: req.user.id };

    // Filter by active status
    if (req.query.active === 'true') {
      query.active = true;
    } else if (req.query.active === 'false') {
      query.active = false;
    }

    // Filter by type (expense or income)
    if (req.query.type && ['expense', 'income'].includes(req.query.type)) {
      query.type = req.query.type;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by frequency
    if (req.query.frequency && ['daily', 'weekly', 'monthly', 'yearly'].includes(req.query.frequency)) {
      query.frequency = req.query.frequency;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await RecurringTransaction.countDocuments(query);

    // Execute query
    const recurringTransactions = await RecurringTransaction.find(query)
      .populate('category', 'name color icon')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: recurringTransactions.length,
      pagination,
      data: recurringTransactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single recurring transaction
// @route   GET /api/recurring-transactions/:id
// @access  Private
exports.getRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(
      req.params.id
    ).populate('category', 'name color icon');

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Recurring transaction not found'
      });
    }

    // Make sure user owns recurring transaction
    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this recurring transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new recurring transaction
// @route   POST /api/recurring-transactions
// @access  Private
exports.createRecurringTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verify category exists and belongs to user
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to use this category'
      });
    }

    // Validate frequency-specific fields
    if (req.body.frequency === 'weekly' && (req.body.dayOfWeek === undefined || req.body.dayOfWeek === null)) {
      return res.status(400).json({
        success: false,
        error: 'Day of week is required for weekly frequency'
      });
    }

    if (req.body.frequency === 'monthly' && (req.body.dayOfMonth === undefined || req.body.dayOfMonth === null)) {
      return res.status(400).json({
        success: false,
        error: 'Day of month is required for monthly frequency'
      });
    }

    // Create recurring transaction
    const recurringTransaction = await RecurringTransaction.create({
      ...req.body,
      user: req.user.id
    });

    // Populate category details
    const populatedRecurringTransaction = await RecurringTransaction.findById(
      recurringTransaction._id
    ).populate('category', 'name color icon');

    res.status(201).json({
      success: true,
      data: populatedRecurringTransaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring-transactions/:id
// @access  Private
exports.updateRecurringTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Recurring transaction not found'
      });
    }

    // Make sure user owns recurring transaction
    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this recurring transaction'
      });
    }

    // If category is being updated, verify it exists and belongs to user
    if (req.body.category && req.body.category !== recurringTransaction.category.toString()) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      if (category.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to use this category'
        });
      }
    }

    // Validate frequency-specific fields
    const frequency = req.body.frequency || recurringTransaction.frequency;
    
    if (frequency === 'weekly') {
      const dayOfWeek = req.body.dayOfWeek !== undefined ? req.body.dayOfWeek : recurringTransaction.dayOfWeek;
      if (dayOfWeek === undefined || dayOfWeek === null) {
        return res.status(400).json({
          success: false,
          error: 'Day of week is required for weekly frequency'
        });
      }
    }

    if (frequency === 'monthly') {
      const dayOfMonth = req.body.dayOfMonth !== undefined ? req.body.dayOfMonth : recurringTransaction.dayOfMonth;
      if (dayOfMonth === undefined || dayOfMonth === null) {
        return res.status(400).json({
          success: false,
          error: 'Day of month is required for monthly frequency'
        });
      }
    }

    // Update recurring transaction
    recurringTransaction = await RecurringTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color icon');

    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring-transactions/:id
// @access  Private
exports.deleteRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Recurring transaction not found'
      });
    }

    // Make sure user owns recurring transaction
    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this recurring transaction'
      });
    }

    await recurringTransaction.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Process recurring transactions (create actual transactions)
// @route   POST /api/recurring-transactions/process
// @access  Private
exports.processRecurringTransactions = async (req, res) => {
  try {
    // Get all active recurring transactions for the user
    const recurringTransactions = await RecurringTransaction.find({
      user: req.user.id,
      active: true
    }).populate('category');

    const now = new Date();
    const processedTransactions = [];

    // Process each recurring transaction
    for (const recurringTx of recurringTransactions) {
      // Skip if not yet started
      if (recurringTx.startDate > now) {
        continue;
      }

      // Skip if end date is set and has passed
      if (recurringTx.endDate && recurringTx.endDate < now) {
        continue;
      }

      // Determine if transaction should be created based on frequency and last processed date
      let shouldCreate = false;
      const lastProcessed = recurringTx.lastProcessedDate || recurringTx.startDate;

      switch (recurringTx.frequency) {
        case 'daily':
          // Create if last processed was yesterday or earlier
          shouldCreate = isBeforeToday(lastProcessed);
          break;

        case 'weekly':
          // Create if it's the right day of the week and last processed was at least a week ago
          shouldCreate =
            now.getDay() === recurringTx.dayOfWeek &&
            daysBetween(lastProcessed, now) >= 7;
          break;

        case 'monthly':
          // Create if it's the right day of the month and last processed was at least a month ago
          shouldCreate =
            now.getDate() === recurringTx.dayOfMonth &&
            (now.getMonth() > lastProcessed.getMonth() ||
              now.getFullYear() > lastProcessed.getFullYear());
          break;

        case 'yearly':
          // Create if it's the right day and month and last processed was at least a year ago
          shouldCreate =
            now.getDate() === lastProcessed.getDate() &&
            now.getMonth() === lastProcessed.getMonth() &&
            now.getFullYear() > lastProcessed.getFullYear();
          break;
      }

      if (shouldCreate) {
        // Create the actual transaction
        const transaction = await Transaction.create({
          amount: recurringTx.amount,
          description: recurringTx.description,
          date: now,
          type: recurringTx.type,
          category: recurringTx.category._id,
          user: req.user.id
        });

        // Update the last processed date
        recurringTx.lastProcessedDate = now;
        await recurringTx.save();

        processedTransactions.push({
          recurringTransactionId: recurringTx._id,
          transactionId: transaction._id,
          description: transaction.description,
          amount: transaction.amount,
          category: recurringTx.category.name
        });
      }
    }

    res.status(200).json({
      success: true,
      count: processedTransactions.length,
      data: processedTransactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Helper function to check if a date is before today
function isBeforeToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// Helper function to calculate days between two dates
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
  return diffDays;
}