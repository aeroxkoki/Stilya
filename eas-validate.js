/**
 * Enhanced validation script for Expo and EAS configuration
 * This script validates both app.json and app.config.js
 */

// Import required modules
const fs = require('fs');
const path = require('path');

// Define validation functions
function validateAppJson() {
  try {
    const appJsonPath = path.resolve(__dirname, 'app.json');
    if (!fs.existsSync(appJsonPath)) {
      console.error('app.json not found');
      return false;
    }
    
    const content = fs.readFileSync(appJsonPath, 'utf8');
    const appJson = JSON.parse(content);
    
    // Basic validation checks
    if (!appJson.expo) {
      console.error('Missing expo section in app.json');
      return false;
    }

    // Validate scheme exists for deep linking
    if (!appJson.expo.scheme) {
      console.warn('Warning: No scheme defined in app.json. Deep linking may not work properly.');
      // Not failing for this, just warning
    }
    
    console.log('app.json validated successfully');
    return true;
  } catch (error) {
    console.error('Error validating app.json:', error.message);
    return false;
  }
}

function validateAppConfig() {
  try {
    // App config validation
    const appConfig = require('./app.config.js');
    console.log('app.config.js loaded successfully');
    return true;
  } catch (error) {
    console.error('Error validating app.config.js:', error.message);
    return false;
  }
}

// Run validations
const appJsonValid = validateAppJson();
const appConfigValid = validateAppConfig();

// Exit with appropriate code
if (appJsonValid && appConfigValid) {
  process.exit(0);
} else {
  process.exit(1);
}
