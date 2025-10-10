#!/bin/bash

echo "🚀 Deploying Medical Tourism Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building Angular application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Stop existing process if running
pm2 stop medical-tourism 2>/dev/null || true
pm2 delete medical-tourism 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start server.js --name "medical-tourism" --log-date-format="YYYY-MM-DD HH:mm:ss"

# Setup PM2 to start on boot
pm2 startup
pm2 save

echo "✅ Deployment complete!"
echo "🌐 Application is running on:"
echo "   - http://localhost:8080"
echo "   - http://165.22.223.163:8080"
echo ""
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs medical-tourism"