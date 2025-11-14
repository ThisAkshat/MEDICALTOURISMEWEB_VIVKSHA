// Compatible with Node.js v12 and Express 4.x
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const distPath = path.join(__dirname, 'dist', 'medical-tourism', 'browser');

// Check if build directory exists
if (!fs.existsSync(distPath)) {
  console.error('Build directory not found:', distPath);
  console.log('Please run "npm run build" first');
  process.exit(1);
}

// Serve static files from the Angular build directory
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false
}));

// Handle Angular routing - serve index.html for all non-API routes
app.get('*', function(req, res, next) {
  // Skip if it's an API route or static file
  if (req.path.startsWith('/api/') || 
      req.path.includes('.') || 
      fs.existsSync(path.join(distPath, req.path))) {
    return next();
  }
  
  // Serve index.html for Angular routes
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 9050;
app.listen(port, function() {
  console.log('CureOn Medical Tourism server running on http://localhost:' + port);
  console.log('Serving files from: ' + distPath);
  console.log('Test these URLs:');
  console.log('   - http://localhost:' + port);
  console.log('   - http://localhost:' + port + '/doctors');
  console.log('   - http://localhost:' + port + '/treatments/surgical-treatment');
  console.log('   - http://localhost:' + port + '/about');
  console.log('   - http://localhost:' + port + '/contact');
});