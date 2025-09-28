const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getRecurringTransactions,
  addRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
} = require('../controllers/recurringTransactions');

router
  .route('/')
  .get(protect, getRecurringTransactions)
  .post(protect, addRecurringTransaction);

router
  .route('/:id')
  .put(protect, updateRecurringTransaction)
  .delete(protect, deleteRecurringTransaction);

module.exports = router;