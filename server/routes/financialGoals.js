const express = require('express');
const router = express.Router();
const { getFinancialGoals, addFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = require('../controllers/financialGoals');
const { protect } = require('../middleware/auth');

const { validateFinancialGoal } = require('../middleware/validators/financialGoalValidator');

router.route('/')
  .get(protect, getFinancialGoals)
  .post(protect, validateFinancialGoal, addFinancialGoal);

router.route('/:id')
  .put(protect, validateFinancialGoal, updateFinancialGoal)
  .delete(protect, deleteFinancialGoal);

module.exports = router;