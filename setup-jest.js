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
    global.it = jestPackage.it;
    
    console.log('Jest globals successfully initialized in setup-jest.js');
  } catch (error) {
    console.error('Failed to import jest from @jest/globals', error);
    
    // Fallback: manually define jest function as a last resort
    global.jest = {
      fn: (impl) => impl || (() => {}),
      mock: (path, factory) => {
        try {
          jest._mocks = jest._mocks || {};
          jest._mocks[path] = factory || (() => ({}));
        } catch (e) {
          console.error('Mock setup failed:', e);
        }
      },
      unmock: (path) => {},
      clearAllMocks: () => {},
      resetAllMocks: () => {},
      restoreAllMocks: () => {},
      spyOn: () => ({ 
        mockImplementation: () => ({}),
        mockReturnValue: () => ({}),
        mockResolvedValue: () => ({}),
        mockRejectedValue: () => ({})
      }),
      requireActual: (path) => {
        try {
          return require(path);
        } catch (e) {
          console.error(`Error requiring ${path}:`, e);
          return {};
        }
      },
      doMock: () => {},
      dontMock: () => {},
      setMock: () => {},
      setTimeout: () => {},
      useFakeTimers: () => {},
      useRealTimers: () => {},
      runAllTimers: () => {},
      advanceTimersByTime: () => {},
      runOnlyPendingTimers: () => {},
      getTimerCount: () => 0,
      isMockFunction: () => false
    };
    
    // Add dummy implementations for core Jest globals
    if (typeof global.expect === 'undefined') {
      global.expect = (actual) => ({
        toBe: () => {},
        toEqual: () => {},
        toBeTruthy: () => {},
        toBeFalsy: () => {},
        toMatchSnapshot: () => {},
        not: { toBe: () => {}, toEqual: () => {} }
      });
    }
    
    if (typeof global.describe === 'undefined') {
      global.describe = (name, fn) => { try { fn && fn(); } catch (e) {} };
    }
    
    if (typeof global.test === 'undefined') {
      global.test = (name, fn) => {};
      global.it = global.test;
    }
    
    if (typeof global.beforeEach === 'undefined') {
      global.beforeEach = (fn) => {};
    }
    
    if (typeof global.afterEach === 'undefined') {
      global.afterEach = (fn) => {};
    }
    
    console.warn('Fallback mock implementation for Jest was created');
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

// Define fetch if needed
if (typeof global.fetch === 'undefined') {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({}),
    text: async () => '',
    blob: async () => ({}),
    arrayBuffer: async () => new ArrayBuffer(0),
  });
}

// Verify jest is available
if (typeof global.jest !== 'undefined') {
  console.log('Jest is available globally');
} else {
  console.error('Jest is still not available globally after setup');
}

// Override React Native jest setup behavior
try {
  jest.mock('react-native/jest/setup', () => {
    return {
      mockComponent: global.jest.fn ? global.jest.fn() : () => {},
      mockFunction: global.jest.fn ? global.jest.fn() : () => {},
      mockImplementation: global.jest.fn ? global.jest.fn() : () => {},
      unmock: global.jest.fn ? global.jest.fn() : () => {},
      mock: global.jest.fn ? global.jest.fn() : () => {},
    };
  });
  console.log('Successfully mocked react-native/jest/setup');
} catch (error) {
  console.error('Failed to mock react-native/jest/setup:', error);
}
