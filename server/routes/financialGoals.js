const express = require('express');
const router = express.Router();

// @route   GET api/financial-goals
// @desc    Get all financial goals
// @access  Private
router.get('/', (req, res) => {
  res.send('Financial goals route');
});

module.exports = router;