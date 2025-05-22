// Jest setup for React Native Testing Library
/* eslint-env jest */

// Mock React Native modules
global.jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Expo modules  
global.jest.mock('expo-secure-store', () => ({
  getItemAsync: global.jest.fn(),
  setItemAsync: global.jest.fn(),
  deleteItemAsync: global.jest.fn(),
}));

// Mock React Navigation
global.jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: global.jest.fn(),
    goBack: global.jest.fn(),
  }),
}));

// Silence console.warn and console.error during tests
global.console = {
  ...console,
  warn: global.jest.fn(),
  error: global.jest.fn(),
};

// Mock global fetch
global.fetch = global.jest.fn();

// Set test timeout
global.jest.setTimeout(10000);
