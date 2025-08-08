# How to Run the Financial Compass Application

## Automated Startup (Recommended)

We've provided automated startup scripts that will handle dependency installation and start both the server and client applications for you.

### Using PowerShell (Recommended for Windows 10/11)

1. Right-click on `start-app.ps1` in the root directory
2. Select "Run with PowerShell"
3. Follow the on-screen instructions

### Using Batch File (Alternative for Windows)

1. Double-click on `start-app.bat` in the root directory
2. Follow the on-screen instructions

## Manual Setup

If you prefer to set up and run the application manually, follow these steps:

### Prerequisites

Before starting, make sure you have the following installed:

1. **Node.js and npm** - Required for both frontend and backend
2. **MongoDB** - The application uses MongoDB as its database

### Step 1: Set Up MongoDB

The application requires MongoDB to be running. Based on the `.env` file, it's configured to connect to a local MongoDB instance:

```
MONGO_URI=mongodb://localhost:27017/financial-compass
```

You have several options to set up MongoDB:

#### Option 1: Install MongoDB Locally

1. Download and install MongoDB Community Edition from the [official website](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. The database will be automatically created when the server first connects

#### Option 2: Use MongoDB Atlas (Cloud)

If you prefer a cloud solution:

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Set up a new cluster
3. Get your connection string and update the `MONGO_URI` in the `server/.env` file

#### Option 3: Use Docker

If you have Docker installed:

```bash
docker run --name mongodb -p 27017:27017 -d mongo
```

### Step 2: Start the Backend Server

1. Open a terminal/command prompt
2. Navigate to the server directory:
   ```bash
   cd server
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   
   This will start the server using nodemon, which automatically restarts when changes are detected.

5. The server should start on port 5000 (as specified in the `.env` file)

### Step 3: Start the Frontend Client

1. Open a new terminal/command prompt window

2. Navigate to the client directory:
   ```bash
   cd client
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. The React development server should start and automatically open the application in your default web browser at http://localhost:3000

## Troubleshooting

### Network Issues During npm install

If you encounter network-related errors during `npm install` (such as ECONNRESET), try the following solutions:

1. **Check your internet connection**
2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```
3. **Use a different npm registry**:
   ```bash
   npm config set registry https://registry.npmjs.cf/
   ```
4. **Fix damaged lockfile**:
   ```bash
   # Windows
   del package-lock.json
   rd /s /q node_modules
   npm install
   ```

### MongoDB Connection Issues

- Ensure MongoDB is running on your system
- Check the connection string in `server/.env`
- If using MongoDB Atlas, ensure your IP address is whitelisted

### Port Conflicts

#### Error: listen EADDRINUSE: address already in use :::5000

If you see this error when starting the server, it means port 5000 is already in use by another application. Here are several ways to resolve this:

1. **Find and close the application using port 5000**:
   ```powershell
   # Find what's using port 5000
   netstat -ano | findstr :5000
   # The last number is the PID (Process ID)
   # Kill the process (replace PID with the actual number)
   taskkill /PID PID /F
   ```

2. **Change the server port**:
   - Open `server/.env` file
   - Change the PORT value to another port (e.g., 5001, 8000, etc.)
   ```
   PORT=5001
   ```
   - Save the file and restart the server

3. **Restart your computer** - This will close all running processes and free up the port

#### Other Port Conflicts

- If port 3000 (client) is already in use, you can modify it by:
  - Creating a `.env` file in the client directory with `PORT=3001` (or another available port)
  - Or pressing 'Y' when prompted if you want to use a different port when starting the React app

## Using the Application

1. Register a new account on the signup page
2. Log in with your credentials
3. Start tracking your expenses and managing your finances!