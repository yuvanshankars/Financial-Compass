const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes will be implemented as needed

module.exports = router;