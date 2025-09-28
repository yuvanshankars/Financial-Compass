const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  console.log('Protect middleware hit');
  console.log('Headers:', req.headers);

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found:', token);
  }

  // Make sure token exists
  if (!token) {
    console.log('No token found, sending 401');
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Add user to req object
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log('User not found, sending 401');
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('User found:', req.user);
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};