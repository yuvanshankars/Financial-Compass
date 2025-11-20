const axios = require('axios');
const FormData = require('form-data');
const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const sendEmail = require('../utils/email');
const fs = require('fs');

// @desc    Scan a bill and extract details
// @route   POST /api/transactions/scan
// @access  Private
exports.scanBill = async (req, res) => {
  console.log('scanBill function started.');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  try {
    if (!req.file) {
      console.log('No file uploaded.');
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    console.log('Uploaded file details:', req.file);

    // OCR.space API implementation with axios and form-data
    const form = new FormData();
    form.append('language', 'eng');
    form.append('file', fs.createReadStream(req.file.path));
    form.append('apikey', process.env.OCR_SPACE_API_KEY);
    form.append('filetype', req.file.mimetype.split('/')[1].toUpperCase());

    console.log('Making OCR.space API call.');
    const ocrResponse = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders(),
    }).catch(err => {
      console.error('Error in OCR.space API call:', err);
      return null;
    });
    console.log('OCR.space API call finished.');

    console.log('OCR.space API Response:', JSON.stringify(ocrResponse.data, null, 2));

    if (!ocrResponse.data.ParsedResults || ocrResponse.data.ParsedResults.length === 0) {
      return res.status(400).json({ success: false, error: 'Could not parse the document.' });
    }

    const parsedText = ocrResponse.data.ParsedResults[0].ParsedText;
    console.log('Parsed Text:', parsedText);

    // Function to format date to YYYY-MM-DD
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      
      if (dateStr instanceof Date) {
        if (isNaN(dateStr.getTime())) return '';
        dateStr = dateStr.toString();
      }
    
      if (typeof dateStr !== 'string') {
          return '';
      }

      let date;
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const monthIndex = monthNames.indexOf(dateStr.trim().toLowerCase().substring(0, 3));
      if (monthIndex > -1) {
        date = new Date();
        date.setMonth(monthIndex);
        const dayMatch = dateStr.match(/\b(\d{1,2})\b/);
        if(dayMatch) {
            date.setDate(parseInt(dayMatch[0], 10));
        } else {
            date.setDate(1);
        }
      } else {
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // More robust parsing for total amount, date, and supplier name
    const lines = parsedText.split('\r\n');
    let totalAmount = '';
    let date = '';
    let supplierName = '';

    // Regex for amount
    const amountRegex = /(\d+\.\d{2})/;
    const potentialAmounts = [];

    // 1. Find all potential amounts
    lines.forEach((line, index) => {
      const amountMatches = line.match(new RegExp(amountRegex, 'g'));
      if (amountMatches) {
        amountMatches.forEach(amount => {
          potentialAmounts.push({
            amount: parseFloat(amount),
            context: line.toLowerCase(),
            prevLineContext: index > 0 ? lines[index - 1].toLowerCase() : ''
          });
        });
      }
    });

    console.log('Potential amounts found:', potentialAmounts);

    // 2. Determine the final amount
    let finalAmount = null;
    const totalKeywordAmounts = potentialAmounts.filter(p =>
      (p.context.includes('total') || p.prevLineContext.includes('total')) &&
      !p.context.includes('sub') && !p.prevLineContext.includes('sub')
    );

    if (totalKeywordAmounts.length > 0) {
      finalAmount = Math.max(...totalKeywordAmounts.map(p => p.amount));
    }

    if (finalAmount === null) {
      const amountKeywordAmounts = potentialAmounts.filter(p =>
        p.context.includes('amount') || p.prevLineContext.includes('amount')
      );
      if (amountKeywordAmounts.length > 0) {
        finalAmount = Math.max(...amountKeywordAmounts.map(p => p.amount));
      }
    }

    if (finalAmount === null && potentialAmounts.length > 0) {
      finalAmount = Math.max(...potentialAmounts.map(p => p.amount));
    }

    if (finalAmount !== null) {
      totalAmount = finalAmount.toFixed(2);
    }
    
    console.log('Final amount selected:', totalAmount);

    // 3. --- DATE LOGIC ---
    const dateLine = lines.find(line => line.toLowerCase().includes('date'));
    if (dateLine) {
        console.log('Date line found:', dateLine);
        const fullDateRegex = /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/;
        let match = dateLine.match(fullDateRegex);
        if (match) {
            date = formatDate(match[0]);
        }

        if (!date) {
            const monthRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
            const dayRegex = /\b(\d{1,2})\b/;
            const yearRegex = /\b(\d{4})\b/;

            const monthMatch = dateLine.match(monthRegex);
            const dayMatch = dateLine.match(dayRegex);
            const yearMatch = dateLine.match(yearRegex);

            const month = monthMatch ? monthMatch[0] : null;
            let day = dayMatch ? parseInt(dayMatch[0], 10) : null;
            const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

            if (day && (day < 1 || day > 31)) {
                day = null;
            }

            if (month || day || year) {
                const d = new Date();
                if (year) d.setFullYear(year);
                if (month) d.setMonth(new Date(Date.parse(month +" 1, 2000")).getMonth());
                if (day) d.setDate(day);
                
                date = formatDate(d);
            }
        }
        if(date) console.log('Date found:', date);
    }
    // --- END DATE LOGIC ---

    // 4. --- SUPPLIER NAME LOGIC ---
    const supplierKeywords = ['restaurant', 'cafe', 'store', 'market', 'bhavan', 'pothigai'];
    let potentialSuppliers = [];

    lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('date:') || lowerLine.includes('time:') || lowerLine.includes('total') || lowerLine.match(/(\d+\.\d{2})/)) {
            return;
        }
        if (line.replace(/[^a-zA-Z]/g, "").length < 3 || line.length > 50) {
            return;
        }

        let score = 0;
        if (index === 0) {
            score += 5;
        }
        if (supplierKeywords.some(keyword => lowerLine.includes(keyword))) {
            score += 3;
        }
        if (line.length > 3 && line === line.toUpperCase()) {
            score += 2;
        }

        if (score > 0) {
            potentialSuppliers.push({ name: line.trim(), score: score });
        }
    });

    if (potentialSuppliers.length > 0) {
        potentialSuppliers.sort((a, b) => b.score - a.score);
        supplierName = potentialSuppliers[0].name;
        console.log('Potential suppliers:', potentialSuppliers);
    } else if (lines.length > 0) {
        supplierName = lines.find(line => line.trim() !== '') || '';
    }
    console.log('Supplier name selected:', supplierName);
    // --- END SUPPLIER NAME LOGIC ---

    const extractedData = {
      description: supplierName,
      amount: totalAmount,
      date: date,
      category: null,
      type: 'expense',
      shopName: supplierName
    };

    res.status(200).json({ success: true, data: extractedData });
  } catch (err) {
    console.error('Full error in scanBill:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

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
    console.error('Error in createTransaction:', err);
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

    // Send email notification
    try {
      await sendEmail({
        email: req.user.email,
        subject: `New ${transaction.type} transaction created`,
        message: `A new transaction of ${transaction.amount} has been created.`
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
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