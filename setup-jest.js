/**
 * Jest setup file - loaded before all tests
 * This file ensures the jest global is available before any mocks are defined
 */

// Make sure jest is globally available
if (typeof global.jest === 'undefined') {
  try {
    const { jest: jestGlobal } = require('@jest/globals');
    global.jest = jestGlobal;
  } catch (error) {
    console.error('Failed to import jest from @jest/globals', error);
    
    // Provide fallback mock implementation
    global.jest = {
      fn: (impl) => impl || (() => {}),
      mock: (path) => {},
      requireActual: (path) => require(path),
      requireMock: (path) => require(path),
      clearAllMocks: () => {},
      resetAllMocks: () => {},
      restoreAllMocks: () => {},
      spyOn: () => ({ mockImplementation: () => ({}) })
    };
  }
}

// Set other important globals
global.__reanimatedWorkletInit = function() {};
global._WORKLET = false;
global.__DEV__ = true;
