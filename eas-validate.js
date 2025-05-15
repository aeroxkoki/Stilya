// Simple validation script for app.config.js
try {
  const appConfig = require('./app.config.js');
  console.log('app.config.js loaded successfully');
  process.exit(0);
} catch (error) {
  console.error('Error loading app.config.js:', error.message);
  process.exit(1);
}
