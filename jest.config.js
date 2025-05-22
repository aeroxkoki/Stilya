module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@unimodules|unimodules)',
  ],
  collectCoverage: false,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/__tests__/basic.test.tsx',
  ],
};