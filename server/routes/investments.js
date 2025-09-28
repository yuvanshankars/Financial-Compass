const express = require('express');
const router = express.Router();
const { getInvestments, addInvestment, updateInvestment, deleteInvestment } = require('../controllers/investments');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getInvestments).post(protect, addInvestment);
router.route('/:id').put(protect, updateInvestment).delete(protect, deleteInvestment);

module.exports = router;