const Notification = require('../models/Notification');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;

    const notification = await Notification.create({
      user: req.user.id,
      title,
      message,
      type,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Make sure user owns notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this notification' });
    }

    notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};