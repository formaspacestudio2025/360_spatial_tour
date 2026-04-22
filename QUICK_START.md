# Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js (Required)
Download and install from: https://nodejs.org/
- Choose LTS version (v20+)
- This includes npm automatically

### 2. Verify Installation
Open new terminal and run:
```bash
node --version
npm --version
```

## Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start server
npm run dev
```

Server will start on: http://localhost:3000

## Test Backend API

### Using curl (PowerShell):
```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:3000/health

# Create walkthrough
Invoke-RestMethod -Uri http://localhost:3000/api/walkthroughs -Method POST -ContentType "application/json" -Body '{"name":"Test Building"}'

# List walkthroughs
Invoke-RestMethod -Uri http://localhost:3000/api/walkthroughs
```

### Using Postman or Thunder Client:
1. Import endpoints from README.md
2. Test each endpoint

## Frontend Setup (Module 2)

Will be created in next module.

## LM Studio Setup (Module 3)

1. Download: https://lmstudio.ai
2. Load vision-enabled model (e.g., llava-v1.6)
3. Start local server (port 1234)

## Troubleshooting

### npm not found:
- Install Node.js from https://nodejs.org
- Restart terminal after installation

## Project Status

✅ Module 1: Backend - COMPLETE
⏳ Module 2: Frontend - Next
⏳ Module 3-7: Pending
