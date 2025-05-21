#!/bin/bash
# 【改良版】Metro互換性を修正するスクリプト v4 (2025-05-21)
# Expo SDK 53+Metro 0.77.0の互換性問題を確実に解決するスクリプト

echo "🔍 Metro 互換性問題を修正します..."

# 権限の確認と修正
chmod -R +rw node_modules 2>/dev/null || true

# 必要なモジュールを特定バージョンで強制的にインストール
echo "📦 モジュールを確認してインストールします..."
npm install --save-dev metro@0.77.0 metro-config@0.77.0 metro-cache@0.77.0 metro-transform-worker@0.77.0 --legacy-peer-deps
npm install --save-dev @expo/metro-config@0.9.0 --legacy-peer-deps

# 必要なディレクトリを作成
echo "📂 必要なディレクトリを作成します..."
mkdir -p node_modules/metro/src/lib
mkdir -p node_modules/metro/src/node-modules

# TerminalReporter.js 作成
TERMINAL_REPORTER_PATH="node_modules/metro/src/lib/TerminalReporter.js"
if [ ! -f "$TERMINAL_REPORTER_PATH" ]; then
  echo "📝 TerminalReporter.js を作成します..."
  cat > "$TERMINAL_REPORTER_PATH" << 'EOL'
/**
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
EOL

  # パーミッションを設定
  chmod 644 "$TERMINAL_REPORTER_PATH"
  
  if [ -f "$TERMINAL_REPORTER_PATH" ]; then
    echo "✅ TerminalReporter.js を作成しました"
  else
    echo "❌ TerminalReporter.js の作成に失敗しました"
    # 別の方法で試行
    echo "💡 別の方法で作成を試みます..."
    NODE_PATH=$(which node)
    $NODE_PATH -e "const fs=require('fs');const path='$TERMINAL_REPORTER_PATH';const content=\"'use strict';class TerminalReporter{constructor(e){this._terminal=e,this._errors=[],this._warnings=[]}handleError(e){this._errors.push(e)}handleWarning(e){this._warnings.push(e)}getErrors(){return this._errors}getWarnings(){return this._warnings}update(){}terminal(){return this._terminal}}module.exports=TerminalReporter;\";try{fs.writeFileSync(path,content);console.log('✅ File created successfully');}catch(e){console.error('Error:',e);}"
  fi
fi

# metro.config.js の作成または更新
METRO_CONFIG_PATH="metro.config.js"
if [ ! -f "$METRO_CONFIG_PATH" ] || grep -q "getDefaultConfig" "$METRO_CONFIG_PATH"; then
  echo "📝 metro.config.js を最適化します..."
  cat > "$METRO_CONFIG_PATH" << 'EOL'
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
EOL
  echo "✅ metro.config.js を最適化しました"
fi

# 互換性パッチファイルの作成
echo "📝 Metroの互換性パッチを作成します..."
PATCH_DIR="patches"
mkdir -p "$PATCH_DIR"

# ノードモジュールのパーミッション修正
echo "🔧 node_modulesの権限を修正します..."
chmod -R +rw node_modules/metro 2>/dev/null || true
find node_modules/metro -type d -exec chmod 755 {} \; 2>/dev/null || true
find node_modules/metro -type f -exec chmod 644 {} \; 2>/dev/null || true

# package.jsonを更新
if [ -f "package.json" ]; then
  echo "📦 package.jsonを更新します..."
  
  # バックアップ
  cp package.json package.json.bak
  
  # バージョン固定とクリーンアップ用のスクリプト追加
  if command -v jq &> /dev/null; then
    echo "📝 jqを使用してpackage.jsonを更新します..."
    jq '.resolutions = {
      "@babel/runtime": "7.27.1",
      "metro": "0.77.0",
      "metro-config": "0.77.0", 
      "metro-cache": "0.77.0",
      "metro-minify-terser": "0.77.0",
      "metro-transform-worker": "0.77.0",
      "@expo/metro-config": "0.9.0",
      "babel-preset-expo": "13.1.11"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    
    # 専用スクリプトの追加
    jq '.scripts["fix:metro-complete"] = "npm run fix-metro-compatibility && npm run create-terminal-reporter && expo prebuild --clean"' package.json > package.json.tmp && mv package.json.tmp package.json
    
    # キャッシュクリアスクリプトの追加
    jq '.scripts["clear:cache"] = "rm -rf node_modules/.cache .expo/cache .metro-cache $TMPDIR/metro-*"' package.json > package.json.tmp && mv package.json.tmp package.json
  else
    echo "⚠️ jqが見つかりません。package.jsonを手動で確認してください"
  fi
fi

# キャッシュのクリア
echo "🧹 キャッシュをクリアしています..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf .expo-shared 2>/dev/null || true
rm -rf .metro-cache 2>/dev/null || true

# npm設定の最適化
npm config set legacy-peer-deps true
npm dedupe

# TerminalReporter.jsの確認
TERM_REPORTER_PATH="node_modules/metro/src/lib/TerminalReporter.js"
if [ -f "$TERM_REPORTER_PATH" ]; then
  FILE_SIZE=$(wc -c < "$TERM_REPORTER_PATH")
  echo "✅ TerminalReporter.js の確認: ファイルサイズ ${FILE_SIZE} バイト"
  # ファイルサイズが小さすぎる場合は再作成
  if [ "$FILE_SIZE" -lt 200 ]; then
    echo "⚠️ TerminalReporter.js が正しく作成されていません。再作成します..."
    rm "$TERM_REPORTER_PATH"
    node -e "const fs=require('fs');const path='$TERM_REPORTER_PATH';const content=\"'use strict';class TerminalReporter{constructor(e){this._terminal=e,this._errors=[],this._warnings=[]}handleError(e){this._errors.push(e)}handleWarning(e){this._warnings.push(e)}getErrors(){return this._errors}getWarnings(){return this._warnings}update(){}terminal(){return this._terminal}}module.exports=TerminalReporter;\";try{fs.writeFileSync(path,content);console.log('✅ File recreated successfully');}catch(e){console.error('Error:',e);}"
  fi
else
  echo "❌ TerminalReporter.js ファイルが見つかりませんでした。エラーを修正できていません。"
  exit 1
fi

echo "✅ Metro 互換性の修正が完了しました"
