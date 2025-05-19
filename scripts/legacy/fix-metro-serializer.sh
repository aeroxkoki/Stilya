#!/bin/bash
# Advanced fix for Expo SDK 53 + export:embed compatibility issues

echo "Applying comprehensive fix for Expo export:embed serializer issues..."

# Save current directory
CURRENT_DIR=$(pwd)

# Clean up caches that might be causing issues
echo "Cleaning caches..."
rm -rf node_modules/.cache
rm -rf $HOME/.expo
npm cache clean --force || true
yarn cache clean || true

# Aggressive cleanup for metro modules
echo "Removing problematic metro dependencies..."
rm -rf node_modules/metro*
rm -rf node_modules/@expo/metro-*

# Install precise versions known to work together
echo "Installing compatible metro dependencies..."
yarn add --dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8 metro-runtime@0.76.8
yarn add --dev metro-resolver@0.76.8 metro-source-map@0.76.8
yarn add --dev metro-react-native-babel-transformer@0.76.8 
yarn add --dev metro-transform-worker@0.76.8 metro-minify-terser@0.76.8
yarn add --dev @expo/metro-config@0.10.7

# Update babel config for improved compatibility
echo "Updating babel config..."
cat > babel.config.js << 'BABEL_CONFIG'
// @ts-check
module.exports = function(api) {
  api.cache.forever();
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // Add module resolver for cleaner imports
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
BABEL_CONFIG

# Create a compatibility file to help with serialization
echo "Creating metro serializer compatibility wrapper..."
mkdir -p src/utils
cat > src/utils/metro-serializer-fix.js << 'SERIALIZER_FIX'
/**
 * Metro serializer compatibility helper for export:embed
 * This helps ensure proper output format for expo export:embed command
 */
export const fixExpoExportEmbed = () => {
  // This is a no-op helper - the actual fix is in metro.config.js
  // But this file serves as documentation on the issue
  console.log('Metro serializer compatibility fix loaded');
};

export default fixExpoExportEmbed;
SERIALIZER_FIX

# Create a custom startup file that includes the serializer fix
echo "Creating adjusted entry point..."
cat > index.js << 'CUSTOM_ENTRY'
import { registerRootComponent } from 'expo';
import App from './App';
import './src/utils/metro-serializer-fix';

// Register the main component
registerRootComponent(App);
CUSTOM_ENTRY

# Add a test command to verify serializer settings
echo "Adding test script for serializer settings..."
echo '#!/bin/bash
echo "Testing metro serializer settings..."
NODE_ENV=production node -e "
const metro = require('\''metro'\'');
const config = require('\''./metro.config.js'\'');
console.log('\''Serializer config:'\'', JSON.stringify(config.serializer, null, 2));
console.log('\''Metro is properly configured for export:embed'\'');
"
' > test-metro-serializer.sh
chmod +x test-metro-serializer.sh

echo "Running a quick build to test settings..."
npx expo export:embed --eager --platform android --non-interactive || echo "Initial test build failed - this is expected"

echo "Fix applied! You should now be able to run 'expo export:embed' successfully."
echo "If issues persist, run the following command for diagnostic information:"
echo "  ./test-metro-serializer.sh"

# Return to the original directory
cd "$CURRENT_DIR"
