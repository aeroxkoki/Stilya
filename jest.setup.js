// Jest setup for React Native Testing Library

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Silence console.warn and console.error during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock global fetch
global.fetch = jest.fn();

// Set test timeout
jest.setTimeout(10000);
