const mongoose = require('mongoose');

const RecurringTransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [100, 'Description cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: [true, 'Please specify transaction type']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please add a category']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: [true, 'Please specify frequency']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null // null means no end date
  },
  dayOfMonth: {
    type: Number,
    min: [1, 'Day of month must be between 1 and 31'],
    max: [31, 'Day of month must be between 1 and 31'],
    // Required only for monthly frequency
    validate: {
      validator: function(v) {
        return this.frequency !== 'monthly' || (v >= 1 && v <= 31);
      },
      message: 'Day of month is required for monthly frequency'
    }
  },
  dayOfWeek: {
    type: Number,
    min: [0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
    max: [6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
    // Required only for weekly frequency
    validate: {
      validator: function(v) {
        return this.frequency !== 'weekly' || (v >= 0 && v <= 6);
      },
      message: 'Day of week is required for weekly frequency'
    }
  },
  lastProcessedDate: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
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

// Create index for faster queries
RecurringTransactionSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);