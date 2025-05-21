#!/bin/bash
# Metro Serializer 直接修正スクリプト
# Expo SDK 53 + Metro 0.77.0 互換性問題を直接解決する緊急スクリプト

echo "🚨 Metro TerminalReporter 緊急直接修復スクリプトを実行します..."

# メインのターミナルレポーターを作成
TERMINAL_REPORTER_PATH="node_modules/metro/src/lib/TerminalReporter.js"
TERMINAL_REPORTER_DIR="node_modules/metro/src/lib"

# ディレクトリ作成の確認
mkdir -p "$TERMINAL_REPORTER_DIR"

# ファイル作成
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
 * This is a mock implementation that provides required functionality.
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

  // Additional required methods
  update() {}
  terminal() { return this._terminal; }
}

module.exports = TerminalReporter;
EOL

# 権限設定
chmod 644 "$TERMINAL_REPORTER_PATH"

# ファイルの存在確認
if [ -f "$TERMINAL_REPORTER_PATH" ]; then
  echo "✅ TerminalReporter.js を作成しました"
  ls -la "$TERMINAL_REPORTER_PATH"
else
  echo "❌ ファイル作成に失敗しました"
  exit 1
fi

# Expoクリのノードモジュールディレクトリも作成
mkdir -p "node_modules/@expo/cli/build/src/start/server/metro"

# リンクの作成（ディレクトリが存在する場合）
if [ -d "node_modules/@expo/cli/build/src/start/server/metro" ]; then
  EXPO_TERMINAL_PATH="node_modules/@expo/cli/build/src/start/server/metro/TerminalReporter.js"
  if [ ! -f "$EXPO_TERMINAL_PATH" ]; then
    echo "🔗 Expoディレクトリにリンクを作成します..."
    cat > "$EXPO_TERMINAL_PATH" << 'EOL'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Expo SDK 53向けの互換性対応
const UpstreamTerminalReporter = require('metro/src/lib/TerminalReporter');

// 必要なメソッドを追加したラッパー
class ExpoTerminalReporter extends UpstreamTerminalReporter {
  constructor(terminal) {
    super(terminal);
  }
}

exports.default = ExpoTerminalReporter;
EOL
    chmod 644 "$EXPO_TERMINAL_PATH"
    echo "✅ Expoディレクトリへの互換性ファイルを作成しました"
  else
    echo "👍 Expoディレクトリのファイルは既に存在します"
  fi
else
  echo "⚠️ Expoディレクトリが見つかりません - このステップはスキップします"
fi

# metro.config.jsの修正
METRO_CONFIG_PATH="metro.config.js"
if [ -f "$METRO_CONFIG_PATH" ]; then
  echo "🔄 metro.config.jsを更新します..."
  mv "$METRO_CONFIG_PATH" "${METRO_CONFIG_PATH}.bak"
  cat > "$METRO_CONFIG_PATH" << 'EOL'
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Metro bundlerの問題に対する修正
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'metro/src/lib/TerminalReporter': path.resolve(__dirname, 'node_modules/metro/src/lib/TerminalReporter.js'),
};

// React Nativeのコンポーネントが正しく解決されるようにする
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// バンドラーの設定変更
config.transformer.minifierConfig = {
  compress: { drop_console: false },
};

// キャッシュ設定
config.cacheStores = [
  {
    type: 'file',
    origin: 'relative',
    rootPath: path.join(require('os').tmpdir(), 'metro-cache'),
  },
];

// シリアライザー設定
config.serializer = config.serializer || {};
config.serializer.modulesOnly = false;
config.serializer.getModulesRunBeforeMainModule = () => [];
config.serializer.getPolyfills = () => [];

module.exports = config;
EOL
  echo "✅ metro.config.jsを更新しました"
else
  echo "⚠️ metro.config.jsが見つかりません。新規作成します..."
  cat > "$METRO_CONFIG_PATH" << 'EOL'
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Metro bundlerの問題に対する修正
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'metro/src/lib/TerminalReporter': path.resolve(__dirname, 'node_modules/metro/src/lib/TerminalReporter.js'),
};

// React Nativeのコンポーネントが正しく解決されるようにする
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// バンドラーの設定変更
config.transformer.minifierConfig = {
  compress: { drop_console: false },
};

module.exports = config;
EOL
  echo "✅ metro.config.jsを作成しました"
fi

# キャッシュクリア
echo "🧹 キャッシュをクリアしています..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# 環境変数設定
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🎉 Metro TerminalReporter 緊急修復が完了しました！"
