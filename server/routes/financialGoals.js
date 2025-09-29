const express = require('express');
const router = express.Router();
const { getFinancialGoals, addFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = require('../controllers/financialGoals');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getFinancialGoals)
  .post(protect, addFinancialGoal);

router.route('/:id')
  .put(protect, updateFinancialGoal)
  .delete(protect, deleteFinancialGoal);

module.exports = router;