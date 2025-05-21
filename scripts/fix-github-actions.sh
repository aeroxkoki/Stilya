#!/bin/bash
# fix-github-actions.sh
# GitHub Actions環境でのExpoビルド問題を解決するスクリプト

set -e # エラーで停止

echo "🔧 Fixing GitHub Actions build environment..."

# 環境変数ローダーの修正
ENV_INDEX_PATH="node_modules/@expo/cli/node_modules/@expo/env/build/index.js"
ENV_DIR_PATH="node_modules/@expo/cli/node_modules/@expo/env/build"

# ディレクトリがなければ作成
mkdir -p "$ENV_DIR_PATH"

# 環境変数ローダーの代替実装
cat > "$ENV_INDEX_PATH" << 'EOL'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = exports.load = exports.dump = exports.getEnvironmentExecOptions = exports.getDefaultEnvironmentFile = exports.getProjectEnvironment = exports.findEnvironmentFile = exports.processEnv = exports.isDirectPath = void 0;

// 安全な実装を提供
function load() {
  return {
    parsed: {},
    errors: []
  };
}

// スタブ実装
function isDirectPath() { return false; }
function processEnv() { return {}; }
function findEnvironmentFile() { return null; }
function getProjectEnvironment() { return {}; }
function getDefaultEnvironmentFile() { return null; }
function getEnvironmentExecOptions() { return {}; }
function dump() { return ""; }
function save() { return Promise.resolve(); }

// エクスポート
exports.isDirectPath = isDirectPath;
exports.processEnv = processEnv;
exports.findEnvironmentFile = findEnvironmentFile;
exports.getProjectEnvironment = getProjectEnvironment;
exports.getDefaultEnvironmentFile = getDefaultEnvironmentFile;
exports.getEnvironmentExecOptions = getEnvironmentExecOptions;
exports.dump = dump;
exports.load = load;
exports.save = save;
EOL

echo "✅ Created environment loader stub at $ENV_INDEX_PATH"

# TerminalReporter.js
mkdir -p node_modules/metro/src/lib
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for Expo SDK 53 compatibility
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal || {
      log: console.log.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console)
    };
    this._errors = [];
    this._warnings = [];
  }

  handleError(error) {
    this._errors.push(error);
    if (this._terminal && this._terminal.error) {
      this._terminal.error(error);
    }
  }

  handleWarning(warning) {
    this._warnings.push(warning);
    if (this._terminal && this._terminal.warn) {
      this._terminal.warn(warning);
    }
  }

  getErrors() { return this._errors; }
  getWarnings() { return this._warnings; }
  update() {}
  terminal() { return this._terminal; }
}

module.exports = TerminalReporter;
EOL

echo "✅ Created TerminalReporter.js"

# メトロ設定の最適化
echo "🔧 Optimizing metro.config.js..."

cat > metro.config.js << 'EOL'
/**
 * Metro configuration for Stilya
 * Optimized for Expo SDK 53 with bundling fixes
 */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure correct serializer for Expo SDK 53
config.serializer = config.serializer || {};
config.serializer.getModulesRunBeforeMainModule = () => [
  require.resolve('expo/AppEntry'),
];

// Resolver configuration to avoid circular dependencies
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    "metro/src/lib/TerminalReporter": path.resolve(__dirname, "node_modules/metro/src/lib/TerminalReporter.js")
  },
  disableHierarchicalLookup: true,
  unstable_enablePackageExports: false,
};

// バンドルの最適化設定
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

module.exports = config;
EOL

echo "✅ Created optimized metro.config.js"

# 必要なパッケージの再インストール
echo "📦 Installing critical dependencies..."

npm install --no-save @babel/runtime@7.27.1 @expo/metro-config@0.9.0 metro@0.77.0 metro-core@0.77.0

echo "🎉 GitHub Actions build environment preparation complete!"
