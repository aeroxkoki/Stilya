#!/bin/bash
# Fix CI NPM configuration issues in GitHub Actions environment

echo "Setting up CI-compatible npm configuration..."

# Create a custom .npmrc file for CI environments
cat > .npmrc << EOF
# CI-compatible npm configuration
# Note: unsafe-perm has been removed, using newer settings instead
ignore-scripts=false
node-linker=hoisted
strict-peer-dependencies=false
legacy-peer-deps=true
# For CI environments
prefer-offline=true
force=true
loglevel=error
audit=false
fund=false
EOF

# Update package.json to include a CI-specific npm config setup
# Create a script to detect CI environment and use appropriate settings
cat > ci-npm-config.js << EOF
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
    const setting = \`\${key}=\${value}\`;
    if (!newConfig.includes(key + '=')) {
      newConfig += \`\n\${setting}\`;
    }
  });
  
  fs.writeFileSync(npmrcPath, newConfig.trim() + '\n');
  console.log('CI npm configuration updated successfully');
}
EOF

# Give execution permission to script
chmod +x ci-npm-config.js

echo "CI-compatible npm configuration created."
echo "Make sure to run 'node ci-npm-config.js' before npm operations in CI environment."
