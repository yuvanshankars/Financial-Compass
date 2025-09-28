const express = require('express');
const { check } = require('express-validator');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getCategorySummary,
  getMonthlyTrend,
  getPerformanceSummary,
  createBulkTransactions,
  getTransactionsByDate
} = require('../controllers/transactions');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get monthly summary
router.get('/summary/monthly', getMonthlySummary);

// Get category summary
router.get('/summary/category', getCategorySummary);

// Get monthly trend
router.get('/summary/trend', getMonthlyTrend);

// Get performance summary
router.get('/summary/performance', getPerformanceSummary);

// Create bulk transactions
router.post('/bulk', createBulkTransactions);

// Get all transactions and create a transaction
router
  .route('/')
  .get(getTransactions)
  .post(
    [
      check('amount', 'Amount is required').not().isEmpty(),
      check('amount', 'Amount must be a number').isNumeric(),
      check('description', 'Description is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('type', 'Type must be either expense or income').isIn([
        'expense',
        'income'
      ]),
      check('category', 'Category is required').not().isEmpty()
    ],
    createTransaction
  );

router.get('/date/:date', getTransactionsByDate);

// Get, update, and delete a transaction
router
  .route('/:id')
  .get(getTransaction)
  .put(
    [
      check('amount', 'Amount must be a number').optional().isNumeric(),
      check('type', 'Type must be either expense or income')
        .optional()
        .isIn(['expense', 'income'])
    ],
    updateTransaction
  )
  .delete(deleteTransaction);

module.exports = router;