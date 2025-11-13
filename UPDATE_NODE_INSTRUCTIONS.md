# Node.js Update Instructions for Server

## Problem
Your server is running Node.js v12 or earlier, which doesn't support Express 5.x
Error: `Cannot find module 'node:events'`

## Solution: Update Node.js to v18 or Higher

### Step 1: Check Current Version
```bash
node --version
```

### Step 2: Update Node.js (Choose ONE method)

#### Method A: Using NVM (Recommended)
```bash
# Install NVM if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version
```

#### Method B: Using NodeSource Repository (RHEL/CentOS/Rocky Linux)
```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs

# Verify
node --version
```

### Step 3: Reinstall Dependencies
```bash
cd /home/cureonmedicaltou/Medi-tour-frontend

# Clear existing node_modules
rm -rf node_modules package-lock.json

# Reinstall with updated Node.js
npm install
```

### Step 4: Start Server
```bash
node server.js
# Should now run on port 9050
```

## Required Versions
- **Node.js**: v18.0.0 or higher (v18 LTS or v20 LTS recommended)
- **npm**: v8.0.0 or higher (comes with Node.js 18+)

## After Update
Your server will run successfully on: http://localhost:9050
