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
    '@react-native/virtualized-lists': '<rootDir>/src/__mocks__/@react-native/virtualized-lists',
    '@react-native/virtualized-lists/Lists/VirtualizedList': '<rootDir>/src/__mocks__/@react-native/virtualized-lists/Lists/VirtualizedList.js',
    'react-native/Libraries/Lists/FlatList': '<rootDir>/src/__mocks__/react-native/Libraries/Lists/FlatList.js',
    'react-native/Libraries/Lists/SectionList': '<rootDir>/src/__mocks__/react-native/Libraries/Lists/SectionList.js'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  testEnvironment: 'node',
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  },
  // Reanimated関連の問題を修正
  injectGlobals: false
};
