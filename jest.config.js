module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-reanimated)',
  ],
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/mocks/**',
    '!src/constants/**',
    '!src/assets/**',
  ],
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/node_modules/react-native',
    'react-native/Libraries/Animated/NativeAnimatedHelper': '<rootDir>/src/__mocks__/react-native/Libraries/Animated/NativeAnimatedHelper.js',
    '@react-native/virtualized-lists/(.*)': '<rootDir>/src/__mocks__/@react-native/virtualized-lists/$1',
    'react-native/Libraries/Lists/(.*)': '<rootDir>/src/__mocks__/react-native/Libraries/Lists/$1'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  testEnvironment: 'jest-environment-jsdom',
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  },
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: true
  }
};