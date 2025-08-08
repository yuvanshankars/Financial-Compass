# Financial Compass - Frontend

This is the frontend React application for the Financial Compass expense tracker.

## Features

- User authentication (signup, login, logout)
- Dashboard with financial overview and charts
- Transaction management
- Category management with custom colors and icons
- Budget tracking with visual indicators
- Recurring transactions
- Responsive design using Tailwind CSS

## Tech Stack

- React.js - Frontend library
- React Router - For navigation
- Chart.js - For data visualization
- Tailwind CSS - For styling
- Axios - For API requests
- React Toastify - For notifications
- Date-fns - For date formatting

## Project Structure

```
/
├── public/             # Static files
└── src/                # React source code
    ├── components/     # Reusable UI components
    ├── pages/          # Page components
    ├── context/        # React context for state management
    ├── services/       # API service functions
    └── utils/          # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

1. Install dependencies
   ```
   npm install
   ```

2. Start the development server
   ```
   npm start
   ```

3. Build for production
   ```
   npm run build
   ```

## Environment Variables

The frontend is configured to proxy API requests to the backend server running on port 5000. This is set in the `package.json` file with the `"proxy": "http://localhost:5000"` setting.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from create-react-app