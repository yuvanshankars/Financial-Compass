const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notifications');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getNotifications);
router.route('/:id').put(protect, markAsRead);

module.exports = router;