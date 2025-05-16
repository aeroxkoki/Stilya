/**
 * Direct patch for Expo's export:embed serialization issue
 * This script modifies the metro serializer to output the correct format
 */

const fs = require('fs');
const path = require('path');

// Paths to Metro modules that need patching
const findMetroPath = () => {
  try {
    // First try to find in node_modules
    return path.dirname(require.resolve('metro'));
  } catch (e) {
    // If not found, try to find in expo's node_modules
    try {
      return path.dirname(require.resolve('metro', { paths: [path.join(process.cwd(), 'node_modules', 'expo', 'node_modules')] }));
    } catch (e) {
      console.error('Could not find metro installation path');
      return null;
    }
  }
};

// Path to @expo/cli directory
const findExpoCliPath = () => {
  try {
    return path.dirname(require.resolve('@expo/cli/package.json'));
  } catch (e) {
    try {
      // Look for it in another location
      return path.dirname(require.resolve('@expo/cli/package.json', { 
        paths: [path.join(process.cwd(), 'node_modules')] 
      }));
    } catch (e) {
      console.error('Could not find @expo/cli installation path');
      return null;
    }
  }
};

const metroPath = findMetroPath();
const expoCliPath = findExpoCliPath();

if (!metroPath) {
  console.error('Error: Could not locate Metro bundler installation');
  process.exit(1);
}

if (!expoCliPath) {
  console.error('Error: Could not locate @expo/cli installation');
  process.exit(1);
}

console.log(`Found Metro at: ${metroPath}`);
console.log(`Found @expo/cli at: ${expoCliPath}`);

// Create a patched serializer wrapper
const createPatchedSerializer = () => {
  const patchDir = path.join(process.cwd(), 'patches');
  
  if (!fs.existsSync(patchDir)) {
    fs.mkdirSync(patchDir, { recursive: true });
  }
  
  const patchedSerializerPath = path.join(patchDir, 'patched-serializer.js');
  
  const serializerContent = `
/**
 * Patched Metro serializer for Expo export:embed
 * This fixed the "Serializer did not return expected format" error
 */
const metro = require('metro');
const metroSerializer = metro.createDefaultSerializers;

// Create a fixed serializer that ensures JSON output
function createFixedSerializer() {
  const originalSerializers = metroSerializer();
  
  // Create a patched JSON serializer
  const patchedJSONSerializer = {
    ...originalSerializers.json,
    stringify: (data) => {
      // Force JSON formatting
      try {
        if (typeof data === 'string' && data.startsWith('var __')) {
          // If it's already JavaScript code, convert it to JSON
          return JSON.stringify({ 
            code: data,
            map: null,
            dependencies: []
          });
        }
        return JSON.stringify(data);
      } catch (e) {
        console.error('Error in patched serializer:', e);
        // Fallback to original behavior
        return originalSerializers.json.stringify(data);
      }
    }
  };
  
  return {
    ...originalSerializers,
    json: patchedJSONSerializer
  };
}

module.exports = createFixedSerializer;
`;
  
  fs.writeFileSync(patchedSerializerPath, serializerContent);
  console.log(`Created patched serializer at: ${patchedSerializerPath}`);
  
  return patchedSerializerPath;
};

// Create a Metro config that uses our patched serializer
const updateMetroConfig = (patchedSerializerPath) => {
  const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
  
  // Read current metro.config.js
  let metroConfigContent = fs.existsSync(metroConfigPath) 
    ? fs.readFileSync(metroConfigPath, 'utf8')
    : `
// Default Metro configuration
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
`;
  
  // Check if our patch is already applied
  if (metroConfigContent.includes('patches/patched-serializer')) {
    console.log('Metro config already patched');
    return;
  }
  
  // Update the config to use our patched serializer
  const patchedMetroConfig = `
// Patched Metro configuration for export:embed compatibility
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Get the default metro config
const config = getDefaultConfig(__dirname);

// Fix for the serializer format issue
const createFixedSerializer = require('./patches/patched-serializer');
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => (path) => {
    const projectRootPath = __dirname;
    if (path.includes('node_modules')) {
      const moduleName = path.split('node_modules/').pop().split('/')[0];
      return \`node_modules/\${moduleName}\`;
    }
    return path.replace(projectRootPath, '');
  },
  // Make sure we use JSON format for serialization
  getSerializers: () => createFixedSerializer()
};

// Other important configurations
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': \`\${__dirname}/src\`,
};

// For GitHub Actions compatibility
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

module.exports = config;
`;
  
  fs.writeFileSync(metroConfigPath, patchedMetroConfig);
  console.log('Updated metro.config.js with patched serializer');
};

// Entry point
const main = () => {
  console.log('Applying direct patch for Expo export:embed serialization issue...');
  
  const patchedSerializerPath = createPatchedSerializer();
  updateMetroConfig(patchedSerializerPath);
  
  console.log('✅ Patched serializer installed successfully');
  console.log('Try running expo export:embed again');
};

// Run the script
main();
