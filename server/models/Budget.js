const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0, 'Budget amount must be positive']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please add a category']
  },
  month: {
    type: Number,
    required: [true, 'Please specify month'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: [true, 'Please specify year'],
    min: [2000, 'Year must be 2000 or later']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for user, category, month, and year to ensure uniqueness
BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);