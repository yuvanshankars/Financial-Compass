# Financial Compass - Backend

This is the backend Node.js application for the Financial Compass expense tracker.

## Features

- User authentication and authorization with JWT
- RESTful API endpoints for transactions, categories, budgets, and recurring transactions
- MongoDB database integration
- Input validation with express-validator
- Password hashing with bcrypt
- CORS support
- Logging with Morgan

## Tech Stack

- Node.js - JavaScript runtime
- Express - Web framework
- MongoDB - Database
- Mongoose - MongoDB object modeling
- JWT - Authentication
- bcrypt - Password hashing
- express-validator - Input validation

## Project Structure

```
/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middleware/         # Express middleware
├── models/             # Database models
├── routes/             # API routes
├── utils/              # Utility functions
└── server.js           # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Install dependencies
   ```
   npm install
   ```

2. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/financial-compass
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=30d
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Start the production server
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Transactions
- `GET /api/transactions` - Get all transactions for current user
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories for current user
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get all budgets for current user
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Recurring Transactions
- `GET /api/recurring-transactions` - Get all recurring transactions for current user
- `GET /api/recurring-transactions/:id` - Get recurring transaction by ID
- `POST /api/recurring-transactions` - Create a new recurring transaction
- `PUT /api/recurring-transactions/:id` - Update recurring transaction
- `DELETE /api/recurring-transactions/:id` - Delete recurring transaction
- `POST /api/recurring-transactions/process` - Process recurring transactions