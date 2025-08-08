const express = require('express');
const { check } = require('express-validator');
const {
  getRecurringTransactions,
  getRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions
} = require('../controllers/recurringTransactions');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Process recurring transactions
router.post('/process', processRecurringTransactions);

// Get all recurring transactions and create a recurring transaction
router
  .route('/')
  .get(getRecurringTransactions)
  .post(
    [
      check('amount', 'Amount is required').not().isEmpty(),
      check('amount', 'Amount must be a number').isNumeric(),
      check('description', 'Description is required').not().isEmpty(),
      check('type', 'Type must be either expense or income').isIn([
        'expense',
        'income'
      ]),
      check('category', 'Category is required').not().isEmpty(),
      check('frequency', 'Frequency is required').not().isEmpty(),
      check('frequency', 'Frequency must be daily, weekly, monthly, or yearly').isIn([
        'daily',
        'weekly',
        'monthly',
        'yearly'
      ]),
      check('startDate', 'Start date is required').not().isEmpty(),
      check('dayOfWeek', 'Day of week must be between 0 and 6')
        .optional()
        .isInt({ min: 0, max: 6 }),
      check('dayOfMonth', 'Day of month must be between 1 and 31')
        .optional()
        .isInt({ min: 1, max: 31 })
    ],
    createRecurringTransaction
  );

// Get, update, and delete a recurring transaction
router
  .route('/:id')
  .get(getRecurringTransaction)
  .put(
    [
      check('amount', 'Amount must be a number').optional().isNumeric(),
      check('type', 'Type must be either expense or income')
        .optional()
        .isIn(['expense', 'income']),
      check('frequency', 'Frequency must be daily, weekly, monthly, or yearly')
        .optional()
        .isIn(['daily', 'weekly', 'monthly', 'yearly']),
      check('dayOfWeek', 'Day of week must be between 0 and 6')
        .optional()
        .isInt({ min: 0, max: 6 }),
      check('dayOfMonth', 'Day of month must be between 1 and 31')
        .optional()
        .isInt({ min: 1, max: 31 })
    ],
    updateRecurringTransaction
  )
  .delete(deleteRecurringTransaction);

module.exports = router;