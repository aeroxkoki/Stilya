/**
 * Jest configuration for Stilya
 */

module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/__tests__/simple.test.js'],
  setupFiles: ['./setup-jest.js'],
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  testEnvironment: 'jsdom'
};
