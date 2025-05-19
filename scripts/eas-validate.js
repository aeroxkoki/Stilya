#!/usr/bin/env node
/**
 * 最適化されたEAS設定バリデーションスクリプト
 */

// Import required modules
const fs = require('fs');
const path = require('path');

console.log('Validating EAS and Expo configuration...');

// Function to check if file exists
function checkFileExists(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: ${fileName} file is missing!`);
    process.exit(1);
  }
}

// Check if essential files exist
const easJsonPath = path.resolve(__dirname, '../eas.json');
const appJsonPath = path.resolve(__dirname, '../app.json');
const packageJsonPath = path.resolve(__dirname, '../package.json');

checkFileExists(easJsonPath, 'eas.json');
checkFileExists(appJsonPath, 'app.json');
checkFileExists(packageJsonPath, 'package.json');

// Function to validate JSON
function validateJson(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    console.error(`Error: ${fileName} is not valid JSON:`, error.message);
    return false;
  }
}

// Validate JSON files
const easJsonValid = validateJson(easJsonPath, 'eas.json');
const appJsonValid = validateJson(appJsonPath, 'app.json');
const packageJsonValid = validateJson(packageJsonPath, 'package.json');

if (!easJsonValid || !appJsonValid || !packageJsonValid) {
  process.exit(1);
}

// Check if CI profile exists in eas.json
const easConfig = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
if (!easConfig.build || !easConfig.build.ci) {
  console.error("Error: 'ci' profile is missing in eas.json under 'build'");
  process.exit(1);
}

// Check app configuration
const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
if (!appConfig.expo) {
  console.error("Error: 'expo' section is missing in app.json");
  process.exit(1);
}

console.log('EAS and app configuration appear valid.');
console.log('Checking Expo SDK compatibility...');

// Get the package.json content
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const expoVersion = packageJson.dependencies.expo.replace(/[\^~]/g, '');
const reactNativeVersion = packageJson.dependencies['react-native'].replace(/[\^~]/g, '');
const reactVersion = packageJson.dependencies.react.replace(/[\^~]/g, '');

console.log(`Found expo:${expoVersion}, react:${reactVersion}, react-native:${reactNativeVersion}`);

// Check compatibility based on Expo SDK 53 requirements
if (expoVersion.startsWith('53.')) {
  if (reactNativeVersion !== '0.79.2') {
    console.warn("Warning: Using Expo SDK 53 with incompatible react-native version. Should be 0.79.2.");
  }
  
  if (reactVersion !== '19.0.0') {
    console.warn("Warning: Using Expo SDK 53 with incompatible react version. Should be 19.0.0.");
  }
}

// Check Metro dependencies
const metroVersion = (packageJson.devDependencies && packageJson.devDependencies.metro) || 'not found';
const metroConfigVersion = (packageJson.devDependencies && packageJson.devDependencies['metro-config']) || 'not found';

if (metroVersion !== '0.76.8' || metroConfigVersion !== '0.76.8') {
  console.warn(`Warning: Metro dependencies may not be compatible with Expo SDK 53. Found metro:${metroVersion}, metro-config:${metroConfigVersion}`);
  console.warn("Consider running: npm run fix-metro");
}

console.log('Validation complete, configuration appears functional for builds.');
process.exit(0);
