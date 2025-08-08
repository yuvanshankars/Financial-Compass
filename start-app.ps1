# Automated startup script for Financial Compass application

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Function to display colored messages
function Write-ColoredMessage {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Display welcome message
Write-ColoredMessage "===================================" "Cyan"
Write-ColoredMessage "  FINANCIAL COMPASS STARTER" "Cyan"
Write-ColoredMessage "===================================" "Cyan"
Write-ColoredMessage "This script will start both the server and client applications." "Yellow"
Write-ColoredMessage ""

# Check for Node.js
if (-not (Test-CommandExists "node")) {
    Write-ColoredMessage "ERROR: Node.js is not installed or not in your PATH." "Red"
    Write-ColoredMessage "Please install Node.js from https://nodejs.org/" "Red"
    exit 1
}

# Check Node.js version
$nodeVersion = (node -v).Substring(1)
Write-ColoredMessage "Node.js version $nodeVersion detected." "Green"

# Check for npm
if (-not (Test-CommandExists "npm")) {
    Write-ColoredMessage "ERROR: npm is not installed or not in your PATH." "Red"
    exit 1
}

# Check for MongoDB
$mongoInstalled = $false
if (Test-CommandExists "mongod") {
    $mongoInstalled = $true
    Write-ColoredMessage "MongoDB is installed." "Green"
} else {
    Write-ColoredMessage "WARNING: MongoDB is not installed or not in your PATH." "Yellow"
    Write-ColoredMessage "The application requires MongoDB to run properly." "Yellow"
    Write-ColoredMessage "You can install MongoDB from https://www.mongodb.com/try/download/community" "Yellow"
    
    # Check if Docker is available as an alternative
    if (Test-CommandExists "docker") {
        Write-ColoredMessage "Docker is installed. You can run MongoDB in a container." "Yellow"
        $runDocker = Read-Host "Would you like to start MongoDB in a Docker container? (y/n)"
        
        if ($runDocker -eq "y") {
            Write-ColoredMessage "Starting MongoDB in Docker..." "Cyan"
            docker run --name mongodb -p 27017:27017 -d mongo
            if ($LASTEXITCODE -eq 0) {
                Write-ColoredMessage "MongoDB container started successfully." "Green"
                $mongoInstalled = $true
            } else {
                Write-ColoredMessage "Failed to start MongoDB container." "Red"
            }
        }
    } else {
        Write-ColoredMessage "Docker is not installed. Cannot start MongoDB in a container." "Yellow"
    }
    
    if (-not $mongoInstalled) {
        $continue = Read-Host "Continue without MongoDB? The application may not work correctly. (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
}

# Install dependencies if needed
Write-ColoredMessage "\nChecking for dependencies..." "Cyan"

# Server dependencies
Write-ColoredMessage "Installing server dependencies..." "Cyan"
Set-Location -Path "$PSScriptRoot\server"

if (-not (Test-Path -Path "node_modules")) {
    Write-ColoredMessage "Server node_modules not found. Installing..." "Yellow"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ColoredMessage "Failed to install server dependencies. Please check your network connection." "Red"
        Write-ColoredMessage "You can try running 'npm install' manually in the server directory." "Yellow"
        $continueWithoutServer = Read-Host "Continue without installing server dependencies? (y/n)"
        if ($continueWithoutServer -ne "y") {
            exit 1
        }
    } else {
        Write-ColoredMessage "Server dependencies installed successfully." "Green"
    }
} else {
    Write-ColoredMessage "Server dependencies already installed." "Green"
}

# Client dependencies
Write-ColoredMessage "\nInstalling client dependencies..." "Cyan"
Set-Location -Path "$PSScriptRoot\client"

if (-not (Test-Path -Path "node_modules")) {
    Write-ColoredMessage "Client node_modules not found. Installing..." "Yellow"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ColoredMessage "Failed to install client dependencies. Please check your network connection." "Red"
        Write-ColoredMessage "You can try running 'npm install' manually in the client directory." "Yellow"
        $continueWithoutClient = Read-Host "Continue without installing client dependencies? (y/n)"
        if ($continueWithoutClient -ne "y") {
            exit 1
        }
    } else {
        Write-ColoredMessage "Client dependencies installed successfully." "Green"
    }
} else {
    Write-ColoredMessage "Client dependencies already installed." "Green"
}

# Start the applications
Write-ColoredMessage "\nStarting the applications..." "Cyan"

# Start the server in a new window
Write-ColoredMessage "Starting the server..." "Cyan"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PSScriptRoot\server'; Write-Host 'Starting server...' -ForegroundColor Cyan; npm run dev"

# Give the server a moment to start
Start-Sleep -Seconds 5

# Start the client in a new window
Write-ColoredMessage "Starting the client..." "Cyan"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PSScriptRoot\client'; Write-Host 'Starting client...' -ForegroundColor Cyan; npm start"

Write-ColoredMessage "\nBoth applications have been started in separate windows." "Green"
Write-ColoredMessage "Server is running on http://localhost:5000" "Green"
Write-ColoredMessage "Client is running on http://localhost:3000" "Green"
Write-ColoredMessage "\nPress any key to exit this window..." "Yellow"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")