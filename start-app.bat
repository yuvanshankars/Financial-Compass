@echo off
REM Automated startup script for Financial Compass application

echo ===================================
echo   FINANCIAL COMPASS STARTER
echo ===================================
echo This script will start both the server and client applications.
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Display Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js %NODE_VERSION% detected.

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm is not installed or not in your PATH.
    pause
    exit /b 1
)

REM Check for MongoDB
where mongod >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo MongoDB is installed.
    set MONGO_INSTALLED=1
) else (
    echo WARNING: MongoDB is not installed or not in your PATH.
    echo The application requires MongoDB to run properly.
    echo You can install MongoDB from https://www.mongodb.com/try/download/community
    
    REM Check if Docker is available as an alternative
    where docker >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Docker is installed. You can run MongoDB in a container.
        set /p RUN_DOCKER=Would you like to start MongoDB in a Docker container? (y/n): 
        
        if /i "%RUN_DOCKER%"=="y" (
            echo Starting MongoDB in Docker...
            docker run --name mongodb -p 27017:27017 -d mongo
            if %ERRORLEVEL% equ 0 (
                echo MongoDB container started successfully.
                set MONGO_INSTALLED=1
            ) else (
                echo Failed to start MongoDB container.
            )
        )
    ) else (
        echo Docker is not installed. Cannot start MongoDB in a container.
    )
    
    if not defined MONGO_INSTALLED (
        set /p CONTINUE=Continue without MongoDB? The application may not work correctly. (y/n): 
        if /i not "%CONTINUE%"=="y" (
            pause
            exit /b 1
        )
    )
)

REM Install dependencies if needed
echo.
echo Checking for dependencies...

REM Server dependencies
echo Installing server dependencies...
cd /d "%~dp0server"

if not exist "node_modules" (
    echo Server node_modules not found. Installing...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install server dependencies. Please check your network connection.
        echo You can try running 'npm install' manually in the server directory.
        set /p CONTINUE_WITHOUT_SERVER=Continue without installing server dependencies? (y/n): 
        if /i not "%CONTINUE_WITHOUT_SERVER%"=="y" (
            pause
            exit /b 1
        )
    ) else (
        echo Server dependencies installed successfully.
    )
) else (
    echo Server dependencies already installed.
)

REM Client dependencies
echo.
echo Installing client dependencies...
cd /d "%~dp0client"

if not exist "node_modules" (
    echo Client node_modules not found. Installing...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install client dependencies. Please check your network connection.
        echo You can try running 'npm install' manually in the client directory.
        set /p CONTINUE_WITHOUT_CLIENT=Continue without installing client dependencies? (y/n): 
        if /i not "%CONTINUE_WITHOUT_CLIENT%"=="y" (
            pause
            exit /b 1
        )
    ) else (
        echo Client dependencies installed successfully.
    )
) else (
    echo Client dependencies already installed.
)

REM Start the applications
echo.
echo Starting the applications...

REM Start the server in a new window
echo Starting the server...
start cmd /k "cd /d "%~dp0server" && echo Starting server... && npm run dev"

REM Give the server a moment to start
timeout /t 5 /nobreak > nul

REM Start the client in a new window
echo Starting the client...
start cmd /k "cd /d "%~dp0client" && echo Starting client... && npm start"

echo.
echo Both applications have been started in separate windows.
echo Server is running on http://localhost:5000
echo Client is running on http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul