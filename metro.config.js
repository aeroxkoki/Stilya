// Metro configuration for Expo/React Native
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Get default config from Expo
const config = getDefaultConfig(__dirname);

// Add support for paths
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Avoid package export issues (New Architecture opt-out)
if (config.resolver) {
  config.resolver.unstable_enablePackageExports = false;
}

// GitHub Actions and EAS Build optimizations
if (process.env.CI || process.env.EAS_BUILD) {
  // Use terser for minification in build environments
  config.transformer.minifierPath = require.resolve('metro-minify-terser');
  config.transformer.minifierConfig = {};
  
  // Stability improvements for CI/EAS
  config.maxWorkers = 2;
  config.resetCache = true;
}

// Make sure we include all necessary file extensions
config.resolver.sourceExts = [
  'js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'
];

// Add support for module resolution from src directory
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
};

// Enable Hermes for performance
config.transformer.hermesEnabled = true;

// Add fallback modules for compatibility
if (!config.resolver.extraNodeModules) {
  config.resolver.extraNodeModules = {};
}

// Terminal Reporter compatibility fix for TerminalReporter missing issue
const fs = require('fs');
const terminalReporterPath = path.join(__dirname, 'node_modules/metro/src/lib/TerminalReporter.js');
try {
  if (!fs.existsSync(terminalReporterPath)) {
    console.log('Creating TerminalReporter.js for compatibility');
    const dir = path.dirname(terminalReporterPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(terminalReporterPath, `
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall react_native
 */

'use strict';

/**
 * A Reporter that does nothing. Errors and warnings will be collected, though.
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal;
    this._errors = [];
    this._warnings = [];
  }

  /**
   * Handling exceptions, including worker creation and initialization errors.
   */
  handleError(error) {
    this._errors.push(error);
  }

  /**
   * Handling warnings, including those coming from the transformer.
   */
  handleWarning(warning) {
    this._warnings.push(warning);
  }

  getErrors() {
    return this._errors;
  }

  getWarnings() {
    return this._warnings;
  }
}

module.exports = TerminalReporter;
    `);
  }
} catch (error) {
  console.warn('Could not create TerminalReporter.js:', error);
}

module.exports = config;
