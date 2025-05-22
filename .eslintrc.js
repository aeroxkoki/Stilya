module.exports = {
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'build/',
    'coverage/',
    '**/*.test.ts',
    '**/*.test.tsx',
    'src/__tests__/**/*',
  ],
};
