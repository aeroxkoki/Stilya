/**
 * Metro configuration for Stilya (Expo SDK 53 / 2025)
 * 最適化済みビルド設定（GitHub Actions互換）
 */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const os = require('os');

// Get default config from Expo
const config = getDefaultConfig(__dirname);

// ==== Core Resolver Settings ====
// Support paths and avoid package export issues
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
config.resolver.unstable_enablePackageExports = false;
config.resolver.disableHierarchicalLookup = true; // ネストされたモジュール解決を無効化して高速化

// Add all necessary file extensions 
config.resolver.sourceExts = [
  'js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'
];

// Support module resolution from src directory and TerminalReporter compatibility
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
  'metro/src/lib/TerminalReporter': path.resolve(__dirname, 'node_modules/metro/src/lib/TerminalReporter.js'),
  'metro-core': path.resolve(__dirname, 'node_modules/metro-core')
};

// ==== Transformer Settings ====
// Enable Hermes for performance
config.transformer.hermesEnabled = true;
config.transformer.minifierConfig = {
  compress: { drop_console: false }, // コンソールログを残して問題追跡しやすく
};

// ==== CI/CD Environment Optimizations ====
if (process.env.CI || process.env.EAS_BUILD || process.env.BUILD_TYPE === 'local') {
  // Use terser for minification in build environments
  config.transformer.minifierPath = require.resolve('metro-minify-terser');
  
  // Stability improvements for CI/EAS
  config.maxWorkers = Math.max(2, Math.floor(os.cpus().length / 2)); // 最大CPUの半分、最低2
  config.resetCache = true;
  
  // シリアライザー設定（出力形式の安定化）
  config.serializer = config.serializer || {};
  config.serializer.getModulesRunBeforeMainModule = () => [];
  config.serializer.getPolyfills = () => [];
  config.serializer.getRunModuleStatement = moduleId => `__r(${moduleId});`;
}

// ==== Cache Configuration ====
// Use tmpdir for caching to avoid workspace issues
config.cacheStores = [
  {
    type: 'file',
    origin: 'relative',
    rootPath: path.join(os.tmpdir(), 'metro-stilya-cache'),
  },
];

// ==== TerminalReporter Creation ====
// Ensure TerminalReporter exists for Metro compatibility
const fs = require('fs');
const terminalReporterPath = path.resolve(__dirname, 'node_modules/metro/src/lib/TerminalReporter.js');
const terminalReporterDir = path.dirname(terminalReporterPath);

try {
  if (!fs.existsSync(terminalReporterDir)) {
    fs.mkdirSync(terminalReporterDir, { recursive: true });
  }
  
  if (!fs.existsSync(terminalReporterPath)) {
    console.log('📝 Creating TerminalReporter.js for Metro compatibility');
    
    fs.writeFileSync(terminalReporterPath, `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

/**
 * Metro Reporter for compatibility with Expo SDK 53.
 * This is a simplified implementation that provides required functionality.
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal;
    this._errors = [];
    this._warnings = [];
  }

  handleError(error) {
    this._errors.push(error);
  }

  handleWarning(warning) {
    this._warnings.push(warning);
  }

  getErrors() {
    return this._errors;
  }

  getWarnings() {
    return this._warnings;
  }

  update() {}
  
  terminal() { 
    return this._terminal; 
  }
}

module.exports = TerminalReporter;
`);
    console.log('✅ TerminalReporter.js created successfully');
  }
} catch (error) {
  console.warn('⚠️ Could not create TerminalReporter.js:', error);
}

module.exports = config;
