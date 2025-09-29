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
    const { name, targetAmount, currentAmount, targetDate } = req.body;
    const financialGoal = await FinancialGoal.create({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
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
    const financialGoal = await FinancialGoal.findById(req.params.id);

    if (!financialGoal) {
      return res.status(404).json({ success: false, error: 'Financial goal not found' });
    }

    if (financialGoal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const { name, targetAmount, currentAmount, targetDate, isAchieved } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (targetAmount !== undefined) updateFields.targetAmount = targetAmount;
    if (currentAmount !== undefined) updateFields.currentAmount = currentAmount;
    if (targetDate !== undefined) updateFields.targetDate = targetDate;
    if (isAchieved !== undefined) updateFields.isAchieved = isAchieved;

    const updatedGoal = await FinancialGoal.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ success: true, data: updatedGoal });
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

    await financialGoal.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};