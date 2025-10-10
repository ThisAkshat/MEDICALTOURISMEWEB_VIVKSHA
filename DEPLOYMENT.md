# Medical Tourism Frontend Deployment Guide

## Quick Setup (On your Ubuntu server)

### 1. Make the deployment script executable and run it:
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. Manual Setup (if you prefer step-by-step):

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server
node server.js
```

### 3. For Production (with PM2):

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start server.js --name "medical-tourism"

# Setup PM2 to restart on server reboot
pm2 startup
pm2 save
```

## Useful PM2 Commands:

- `pm2 status` - Check application status
- `pm2 logs medical-tourism` - View application logs
- `pm2 restart medical-tourism` - Restart the application
- `pm2 stop medical-tourism` - Stop the application
- `pm2 delete medical-tourism` - Remove the application

## Troubleshooting:

### If build fails:
- Check Node.js version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`

### If server won't start:
- Check if port 8080 is available: `netstat -tlnp | grep :8080`
- Check server.js exists and is correct
- Check dist folder exists after build

## Testing:

After deployment, test these URLs:
- http://165.22.223.163:8080 (Home)
- http://165.22.223.163:8080/doctors
- http://165.22.223.163:8080/treatments/surgical-treatment
- http://165.22.223.163:8080/about