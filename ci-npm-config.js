// CI environment npm configuration setup
const fs = require('fs');
const path = require('path');

// Detect if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

if (isCI) {
  console.log('CI environment detected, applying compatible npm settings...');
  
  // These settings replace unsafe-perm for modern npm versions
  const ciSettings = {
    'ignore-scripts': false,
    'legacy-peer-deps': true,
    'strict-peer-dependencies': false,
    'loglevel': 'error'
  };
  
  // Write settings to .npmrc directly in CI
  const npmrcPath = path.join(process.cwd(), '.npmrc');
  const existingConfig = fs.existsSync(npmrcPath) 
    ? fs.readFileSync(npmrcPath, 'utf8') 
    : '';
  
  let newConfig = existingConfig;
  
  // Add each setting if not already present
  Object.entries(ciSettings).forEach(([key, value]) => {
    const setting = `${key}=${value}`;
    if (!newConfig.includes(key + '=')) {
      newConfig += `\n${setting}`;
    }
  });
  
  fs.writeFileSync(npmrcPath, newConfig.trim() + '\n');
  console.log('CI npm configuration updated successfully');
}
