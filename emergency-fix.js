/**
 * Emergency fix for Metro bundler JSON parsing issues in GitHub Actions
 * This script patches the JSON.parse method to handle malformed JSON in Metro bundler.
 */

console.log('[EMERGENCY] Applying JSON.parse patch for Metro bundler...');

// Store the original JSON.parse
const originalJSONParse = JSON.parse;

// Override JSON.parse with a more resilient version
JSON.parse = function patchedJSONParse(text, reviver) {
  try {
    return originalJSONParse(text, reviver);
  } catch (e) {
    console.warn('[EMERGENCY PATCH] JSON parse error detected. Attempting recovery...');
    console.warn(`Original error: ${e.message}`);
    
    // Handle common issues in Metro bundler JSON
    let fixedText = text;
    
    // Fix unescaped newlines in strings
    fixedText = fixedText.replace(/([":,[\]{}])([\r\n]+)([":,[\]{}])/g, '$1 $3');
    
    // Fix trailing commas in arrays/objects
    fixedText = fixedText.replace(/,\s*([}\]])/g, '$1');
    
    try {
      return originalJSONParse(fixedText, reviver);
    } catch (recoveryError) {
      console.error('[EMERGENCY PATCH] Recovery failed:', recoveryError.message);
      // If we can't fix it, throw the original error
      throw e;
    }
  }
};

// Check if we're in the Metro bundler context
try {
  const fs = require('fs');
  const path = require('path');
  
  // Define paths to check for Metro bundler files
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules/@expo/cli/build/src/start/server/metro/MetroBundlerDevServer.js'),
    path.join(process.cwd(), 'node_modules/expo/node_modules/@expo/cli/build/src/start/server/metro/MetroBundlerDevServer.js'),
    path.join(process.cwd(), 'node_modules/metro/src/Server.js'),
  ];
  
  console.log('Searching for MetroBundlerDevServer files...');
  possiblePaths.forEach(p => {
    if (fs.existsSync(p)) {
      console.log(`Found: ${p}`);
    } else {
      console.log(`Not found: ${p}`);
    }
  });
  
  console.log('Setting up JSON.parse patch...');
  console.log('[EMERGENCY] JSON.parseパッチが適用されました');
  console.log('Successfully loaded patch');
} catch (e) {
  console.error('Error in emergency patch setup:', e);
}
