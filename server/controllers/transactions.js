const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    // Build query
    let query = { user: req.user.id };

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }

    // Filter by type (expense or income)
    if (req.query.type && ['expense', 'income'].includes(req.query.type)) {
      query.type = req.query.type;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by search term (in description)
    if (req.query.search) {
      query.description = { $regex: req.query.search, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Transaction.countDocuments(query);

    // Execute query
    const transactions = await Transaction.find(query)
      .populate('category', 'name color icon')
      .sort({ date: -1 })
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
      count: transactions.length,
      pagination,
      data: transactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      'category',
      'name color icon'
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private

// @desc    Get all transactions for a specific date
// @route   GET /api/transactions/date/:date
// @access  Private
exports.getTransactionsByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(req.params.date);
    nextDay.setDate(nextDay.getDate() + 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: {
        $gte: date,
        $lt: nextDay,
      },
    }).populate('category', 'name color icon');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

exports.createTransaction = async (req, res) => {
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

    // Create transaction
    const transaction = await Transaction.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this transaction'
      });
    }

    // If category is being updated, verify it exists and belongs to user
    if (req.body.category && req.body.category !== transaction.category.toString()) {
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

    // Update transaction
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color icon');

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this transaction'
      });
    }

    await transaction.deleteOne();

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

// @desc    Create new bulk transactions
// @route   POST /api/transactions/bulk
// @access  Private
exports.createBulkTransactions = async (req, res) => {
  const { transactions } = req.body;

  if (!transactions || !Array.isArray(transactions)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid input" });
  }

  const createdTransactions = [];

  for (const transactionData of transactions) {
    const { amount, description, date, type, category } = transactionData;

    // Basic validation
    if (!amount || !description || !date || !type || !category) {
      // Skip incomplete transactions
      continue;
    }

    try {
      const categoryDoc = await Category.findOne({
        _id: category,
        user: req.user.id,
      });
      if (!categoryDoc) {
        // Skip if category is invalid or doesn't belong to user
        continue;
      }

      const newTransaction = new Transaction({
        user: req.user.id,
        amount,
        description,
        date,
        type,
        category,
        source: "sms",
      });

      const savedTransaction = await newTransaction.save();
      createdTransactions.push(savedTransaction);
    } catch (error) {
      // Log error and continue with next transaction
      console.error("Error creating transaction:", error);
    }
  }

  res.status(201).json({
    success: true,
    data: createdTransactions,
  });
};



// @desc    Get monthly summary (total income, expenses, balance)
// @route   GET /api/transactions/summary/monthly
// @access  Private
exports.getMonthlySummary = async (req, res) => {
  try {
    // Get year and month from query params or use current date
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    console.log('User in getMonthlySummary:', req.user);
    console.log('Year:', year, 'Month:', month);

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all transactions for the specified month and year
    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get spending by category for a month
// @route   GET /api/transactions/summary/category
// @access  Private
exports.getCategorySummary = async (req, res) => {
  try {
    // Get year and month from query params or use current date
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate transactions by category
    const categorySummary = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
          type: 'expense' // Only include expenses
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          count: 1,
          name: '$categoryDetails.name',
          color: '$categoryDetails.color',
          icon: '$categoryDetails.icon'
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    // Calculate total expenses for percentage calculation
    const totalExpenses = categorySummary.reduce(
      (total, category) => total + category.totalAmount,
      0
    );

    // Map to the structure expected by the frontend
    const categoriesWithPercentage = categorySummary.map(category => ({
      ...category,
      percentage: totalExpenses > 0 ? (category.totalAmount / totalExpenses) * 100 : 0
    }));

    res.status(200).json({
      success: true,
      data: categoriesWithPercentage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get monthly trend for the year
// @route   GET /api/transactions/summary/trend
// @access  Private
exports.getMonthlyTrend = async (req, res) => {
  try {
    // Get year from query params or use current year
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    console.log('Monthly trend request - User ID:', req.user._id, 'User object:', req.user, 'Year:', year);

    // Create array to hold monthly data
    const monthlyData = [];

    // Loop through each month
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // Get all transactions for the month - ensure consistent user ID usage
      const transactions = await Transaction.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      });

      // Calculate totals
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpense += transaction.amount;
        }
      });

      const balance = totalIncome - totalExpense;

      monthlyData.push({
        month,
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      });
    }

    console.log('Monthly trend response - Data points:', monthlyData.length);

    res.status(200).json({
      success: true,
      data: {
        year,
        monthlyData
      }
    });
  } catch (err) {
    console.error('Error in getMonthlyTrend:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get performance summary for a user
// @route   GET /api/transactions/summary/performance
// @access  Private
exports.getPerformanceSummary = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    const summary = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.month",
          monthlyData: {
            $push: {
              type: "$_id.type",
              total: "$total"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          income: {
            $let: {
              vars: {
                incomeData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$monthlyData",
                        as: "md",
                        cond: { $eq: ["$$md.type", "income"] }
                      }
                    },
                    0
                  ]
                }
              },
              in: "$$incomeData.total"
            }
          },
          expense: {
            $let: {
              vars: {
                expenseData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$monthlyData",
                        as: "md",
                        cond: { $eq: ["$$md.type", "expense"] }
                      }
                    },
                    0
                  ]
                }
              },
              in: "$$expenseData.total"
            }
          }
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    // Format data for recharts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthNames.map((name, index) => {
      const monthData = summary.find(s => s.month === index + 1);
      return {
        name,
        income: monthData ? monthData.income : 0,
        expense: monthData ? monthData.expense : 0
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};