# The Financial Compass - Personal Expense Tracker

A comprehensive web application that helps users track their expenses, visualize spending patterns, and achieve financial goals.

## Features

### Phase 1: Foundation
- User authentication (signup, login, logout)
- Transaction management (add, edit, delete)
- Custom categories with icons/colors
- Dashboard overview with monthly financial summary

### Phase 2: Advanced Features
- Data visualization (pie charts, bar graphs)
- Budgeting system with visual indicators
- Recurring transactions

### Phase 3: User Experience
- Search and filter functionality
- Intuitive and responsive UI/UX

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Chart.js for data visualization
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── context/        # React context for state management
│       ├── services/       # API service functions
│       └── utils/          # Utility functions
├── server/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies for both client and server
   ```
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables
4. Start the development servers
   ```
   # In one terminal
   cd client && npm start
   
   # In another terminal
   cd server && npm run dev
   ```

## License
MIT