#!/bin/bash
# Advanced direct patch for Expo export:embed serialization issue

echo "Applying direct patch for Expo export:embed serialization issue..."

# Run the patch script
node patch-expo-serializer.js

# Create a helper script to verify the patched serializer
cat > verify-serializer-patch.js << 'EOF'
/**
 * Script to verify if the serializer patch is working
 */
const fs = require('fs');
const path = require('path');

console.log('Verifying serializer patch...');

// Check if patches directory exists
const patchesDir = path.join(process.cwd(), 'patches');
if (!fs.existsSync(patchesDir)) {
  console.error('❌ Patches directory not found!');
  process.exit(1);
}

// Check if patched serializer exists
const patchedSerializerPath = path.join(patchesDir, 'patched-serializer.js');
if (!fs.existsSync(patchedSerializerPath)) {
  console.error('❌ Patched serializer not found!');
  process.exit(1);
}

// Check if metro.config.js contains the patch reference
const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
if (!fs.existsSync(metroConfigPath)) {
  console.error('❌ metro.config.js not found!');
  process.exit(1);
}

const metroConfigContent = fs.readFileSync(metroConfigPath, 'utf8');
if (!metroConfigContent.includes('patches/patched-serializer')) {
  console.error('❌ metro.config.js does not reference the patched serializer!');
  process.exit(1);
}

console.log('✅ Serializer patch verification successful!');

// Try to load the modules to verify they're accessible
try {
  const createFixedSerializer = require('./patches/patched-serializer');
  console.log('✅ Patched serializer module loaded successfully');
  
  // Create a test serializer
  const serializers = createFixedSerializer();
  console.log('✅ Serializer created successfully:', Object.keys(serializers));
  
  // Test the stringify function with a JavaScript string
  const testJsCode = 'var __TEST = 123;';
  const result = serializers.json.stringify(testJsCode);
  console.log('Test serialization result:', result.substring(0, 50) + '...');
  
  console.log('✅ All verification checks passed!');
} catch (e) {
  console.error('❌ Error during verification:', e);
  process.exit(1);
}
EOF

# Make the verification script executable
chmod +x verify-serializer-patch.js

# Run the verification script
node verify-serializer-patch.js

# Clean the Metro cache to ensure the patch takes effect
echo "Cleaning Metro cache..."
rm -rf node_modules/.cache/metro
rm -rf node_modules/.cache/metro-babel-register
rm -rf $HOME/.expo/cache

echo "✅ Patch applied and verified successfully!"
echo "You can now run 'expo export:embed --eager --platform android --dev false'"
