/**
 * Patched Metro serializer for Expo export:embed
 * This fixed the "Serializer did not return expected format" error
 */
const metro = require('metro');

// Create a fixed serializer that ensures JSON output
function createFixedSerializer() {
  // Get the original serializers or create new ones
  let originalSerializers;
  try {
    // Try to use metro's createDefaultSerializers if available
    if (typeof metro.createDefaultSerializers === 'function') {
      originalSerializers = metro.createDefaultSerializers();
    } else {
      // Fallback: create basic serializers
      originalSerializers = {
        json: {
          stringify: JSON.stringify
        },
        bundle: {
          stringify: (x) => x
        }
      };
    }
  } catch (e) {
    console.error('Error creating default serializers:', e);
    // Emergency fallback
    originalSerializers = {
      json: {
        stringify: JSON.stringify
      },
      bundle: {
        stringify: (x) => x
      }
    };
  }
  
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
        // Fallback to original behavior or simple stringification
        try {
          return originalSerializers.json.stringify(data);
        } catch (e2) {
          return JSON.stringify(data);
        }
      }
    }
  };
  
  return {
    ...originalSerializers,
    json: patchedJSONSerializer
  };
}

module.exports = createFixedSerializer;
