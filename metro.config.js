/**
 * Simplified Metro Config for EAS Build
 * Designed to work reliably with GitHub Actions
 */
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('@expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Use default config with minimal modifications
module.exports = defaultConfig;
