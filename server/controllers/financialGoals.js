const FinancialGoal = require('../models/FinancialGoal');

// @desc    Get all financial goals
// @route   GET /api/financial-goals
// @access  Private
exports.getFinancialGoals = async (req, res) => {
  try {
    const financialGoals = await FinancialGoal.find({ user: req.user.id });
    res.status(200).json({ success: true, data: financialGoals });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Add a financial goal
// @route   POST /api/financial-goals
// @access  Private
exports.addFinancialGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    const financialGoal = await FinancialGoal.create({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: 0,
      targetDate,
    });
    res.status(201).json({ success: true, data: financialGoal });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a financial goal
// @route   PUT /api/financial-goals/:id
// @access  Private
exports.updateFinancialGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, isAchieved } = req.body;
    let financialGoal = await FinancialGoal.findById(req.params.id);

    if (!financialGoal) {
      return res.status(404).json({ success: false, error: 'Financial goal not found' });
    }

    if (financialGoal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    financialGoal = await FinancialGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: financialGoal });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a financial goal
// @route   DELETE /api/financial-goals/:id
// @access  Private
exports.deleteFinancialGoal = async (req, res) => {
  try {
    const financialGoal = await FinancialGoal.findById(req.params.id);

    if (!financialGoal) {
      return res.status(404).json({ success: false, error: 'Financial goal not found' });
    }

    if (financialGoal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await financialGoal.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};