const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const { protect } = require('../middleware/auth'); // Correctly import the protect middleware

// GET all investments for user
router.get('/', protect, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id }).sort({ date: -1 });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new investment
router.post('/', protect, async (req, res) => {
  const { name, type, amount, date, notes } = req.body;
  try {
    const newInvestment = new Investment({
      user: req.user.id,
      name,
      type,
      amount,
      date,
      notes
    });
    await newInvestment.save();
    res.status(201).json(newInvestment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// PUT / DELETE: add later if needed

module.exports = router;