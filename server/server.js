const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const recurringTransactionRoutes = require('./routes/recurringTransactions');
const smsRoutes = require('./routes/sms');
const investmentRoutes = require('./routes/investmentRoutes');
const financialGoalRoutes = require('./routes/financialGoals');

// Initialize express app
const app = express();

// app.use(helmet.contentSecurityPolicy(({
//   directives: {
//     defaultSrc: ["'self'"],
//     scriptSrc: ["'self'"],
//     styleSrc: ["'self'"],
//     fontSrc: ["'self'"],
//     imgSrc: ["'self'"],
//     connectSrc: ["'self'"],
//   },
// })));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recurring-transactions', recurringTransactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/financial-goals', financialGoalRoutes);

// Catch-all route for debugging
app.use((req, res, next) => {
  console.log(`Unhandled request: ${req.method} ${req.originalUrl}`);
  next();
});

// Cron job
// require('./jobs/cron');

const PORT = 5002;

const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  console.error('Unhandled Rejection Details:', err.stack);
  server.close(() => process.exit(1));
});