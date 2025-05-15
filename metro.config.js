// metro.config.js - simplified for CI compatibility
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here if needed
// For now keeping it simple to avoid Metro bundler issues

// Add TypeScript and other extensions support
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

module.exports = config;
