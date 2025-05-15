/**
 * Jest setup file - loaded before all tests
 * This file ensures the jest global is available before any mocks are defined
 */

// Make sure jest is globally available
if (typeof global.jest === 'undefined') {
  try {
    // Try direct import first
    const jestPackage = require('@jest/globals');
    global.jest = jestPackage.jest;
    
    // Add additional jest globals if needed
    global.expect = jestPackage.expect;
    global.test = jestPackage.test;
    global.describe = jestPackage.describe;
    global.beforeEach = jestPackage.beforeEach;
    global.afterEach = jestPackage.afterEach;
    global.beforeAll = jestPackage.beforeAll;
    global.afterAll = jestPackage.afterAll;
    
    console.log('Jest globals successfully initialized in setup-jest.js');
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
      spyOn: () => ({ mockImplementation: () => ({}) }),
      doMock: () => {},
      dontMock: () => {},
      setMock: () => {},
      setTimeout: () => {},
      useFakeTimers: () => {},
      useRealTimers: () => {},
      runAllTimers: () => {},
      advanceTimersByTime: () => {},
      runOnlyPendingTimers: () => {},
      getTimerCount: () => 0
    };
  }
}

// Mock reanimated worklet init function
global.__reanimatedWorkletInit = function() {};
global._WORKLET = false;
global.__DEV__ = true;

// Add window object (for jsdom environment)
if (typeof global.window === 'undefined') {
  global.window = {};
}

// Verify jest is available
if (typeof global.jest !== 'undefined') {
  console.log('Jest is available globally');
} else {
  console.error('Jest is still not available globally after setup');
}
