const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAsRead } = require('../controllers/notifications');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification);

router.route('/:id/read')
  .put(protect, markAsRead);

module.exports = router;