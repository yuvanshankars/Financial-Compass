const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    // Get month and year from query params or use current date
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    // Find all budgets for the specified month and year
    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year
    }).populate('category', 'name color icon');

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate(
      'category',
      'name color icon'
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this budget'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res) => {
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

    // Check if budget already exists for this category, month, and year
    const existingBudget = await Budget.findOne({
      category: req.body.category,
      month: req.body.month,
      year: req.body.year,
      user: req.user.id
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: 'Budget already exists for this category in the specified month and year'
      });
    }

    // Create budget
    const budget = await Budget.create({
      ...req.body,
      user: req.user.id
    });

    // Populate category details
    const populatedBudget = await Budget.findById(budget._id).populate(
      'category',
      'name color icon'
    );

    res.status(201).json({
      success: true,
      data: populatedBudget
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this budget'
      });
    }

    // If category, month, or year is being updated, check for conflicts
    if (
      (req.body.category && req.body.category !== budget.category.toString()) ||
      (req.body.month && req.body.month !== budget.month) ||
      (req.body.year && req.body.year !== budget.year)
    ) {
      // If category is being updated, verify it exists and belongs to user
      if (req.body.category && req.body.category !== budget.category.toString()) {
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

      // Check if budget already exists for the new category, month, and year
      const existingBudget = await Budget.findOne({
        category: req.body.category || budget.category,
        month: req.body.month || budget.month,
        year: req.body.year || budget.year,
        user: req.user.id,
        _id: { $ne: req.params.id } // Exclude current budget
      });

      if (existingBudget) {
        return res.status(400).json({
          success: false,
          error: 'Budget already exists for this category in the specified month and year'
        });
      }
    }

    // Update budget
    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name color icon');

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

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

// @desc    Get budget progress (budget vs actual spending)
// @route   GET /api/budgets/progress
// @access  Private
exports.getBudgetProgress = async (req, res) => {
  try {
    // Get month and year from query params or use current date
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Find all budgets for the specified month and year
    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year
    }).populate('category', 'name color icon');

    // Get all expense transactions for the month
    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate },
      type: 'expense'
    });

    // Calculate spending by category
    const spendingByCategory = {};
    transactions.forEach(transaction => {
      const categoryId = transaction.category.toString();
      if (!spendingByCategory[categoryId]) {
        spendingByCategory[categoryId] = 0;
      }
      spendingByCategory[categoryId] += transaction.amount;
    });

    // Calculate progress for each budget
    const budgetProgress = budgets
      .filter(budget => budget.category !== null) // Filter out budgets with deleted categories
      .map(budget => {
        const categoryId = budget.category._id.toString();
        const spent = spendingByCategory[categoryId] || 0;
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        const status =
          percentage < 70 ? 'good' : percentage < 90 ? 'warning' : 'danger';

        return {
          _id: budget._id,
          category: budget.category,
          budgetAmount: budget.amount,
          spent,
          remaining,
          percentage,
          status,
          month,
          year
        };
      });

    res.status(200).json({
      success: true,
      count: budgetProgress.length,
      data: budgetProgress
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};