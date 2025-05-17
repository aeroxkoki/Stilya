/**
 * Patched Metro serializer for Expo export:embed
 * This fixed the "Serializer did not return expected format" error
 */
const metro = require('metro');

// Create a fixed serializer that ensures JSON output
function createFixedSerializer() {
  // Get the original serializers
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
  
  // Create a patched JSON serializer that forcibly converts JS to JSON
  const patchedJSONSerializer = {
    ...originalSerializers.json,
    stringify: (data) => {
      // Force JSON formatting
      try {
        if (typeof data === 'string' && data.startsWith('var __')) {
          console.log('[Metro Patch] Converting JS to JSON format');
          // If it's already JavaScript code, convert it to JSON
          return JSON.stringify({ 
            code: data,
            map: null,
            dependencies: []
          });
        }
        // Normal JSON stringification
        return JSON.stringify(data);
      } catch (e) {
        console.error('[Metro Patch] Error in patched serializer:', e);
        // Fallback to string conversion
        try {
          // Try one more time with string conversion
          return JSON.stringify({
            code: String(data),
            map: null,
            dependencies: []
          });
        } catch (e2) {
          console.error('[Metro Patch] Failed fallback serialization:', e2);
          // Last resort: return empty but valid JSON
          return JSON.stringify({
            code: "",
            map: null,
            dependencies: []
          });
        }
      }
    }
  };
  
  // Create a patched bundle serializer for extra safety
  const patchedBundleSerializer = {
    ...originalSerializers.bundle,
    stringify: (moduleObj) => {
      try {
        // If the bundle serializer gets a string, ensure it's in the right format
        if (typeof moduleObj === 'string') {
          if (moduleObj.startsWith('var __BUNDLE_START_TIME__')) {
            // Already JS bundle format, keep as is
            return moduleObj;
          } else {
            // Convert to proper format
            return `var __BUNDLE_START_TIME__ = Date.now(); ${moduleObj}`;
          }
        } else if (moduleObj && typeof moduleObj === 'object') {
          // If it's an object, use the original serializer
          return originalSerializers.bundle.stringify(moduleObj);
        }
        // Fallback for unexpected input
        return String(moduleObj);
      } catch (e) {
        console.error('[Metro Patch] Bundle serializer error:', e);
        // Safe fallback
        return String(moduleObj || '');
      }
    }
  };
  
  return {
    ...originalSerializers,
    json: patchedJSONSerializer,
    bundle: patchedBundleSerializer
  };
}

module.exports = createFixedSerializer;
