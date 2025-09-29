const { check, validationResult } = require('express-validator');

exports.validateFinancialGoal = [
  check('name', 'Goal name is required').not().isEmpty().trim().escape(),
  check('targetAmount', 'Target amount must be a positive number').isFloat({ gt: 0 }),
  check('currentAmount', 'Current amount must be a number').optional().isFloat(),
  check('targetDate', 'Target date must be a valid date').optional({ checkFalsy: true }).isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];