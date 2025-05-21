#!/bin/bash
# Metro互換性を修正するスクリプト v2 (2025-05-21)

echo "🔍 Metro 互換性問題を修正します..."

# 必要なモジュールを特定バージョンで強制的にインストール
npm install --save-dev metro@0.77.0 metro-config@0.77.0 --legacy-peer-deps
npm install --save-dev @expo/metro-config@0.9.0 --legacy-peer-deps

# 必要なディレクトリを作成
mkdir -p node_modules/metro/src/lib

# TerminalReporter.js の存在チェックと作成
if [ ! -f node_modules/metro/src/lib/TerminalReporter.js ]; then
  echo "TerminalReporter.js が見つからないため、作成します"
  cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
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

  // GitHub Actions環境でのビルドに必要なメソッド
  update() {}
}

module.exports = TerminalReporter;
EOL
  echo "TerminalReporter.js を作成しました"
fi

# metro.config.js の確認と作成
if [ ! -f metro.config.js ]; then
  echo "metro.config.js が見つからないため、作成します"
  cat > metro.config.js << 'EOL'
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

// Metroのキャッシュ戦略を調整
config.cacheStores = [
  {
    type: 'file',
    origin: 'relative',
    rootPath: path.join(require('os').tmpdir(), 'metro-cache'),
  },
];

module.exports = config;
EOL
  echo "metro.config.js を作成しました"
fi

# package.jsonを更新してビルドスクリプトを追加
if [ -f package.json ]; then
  # バックアップを作成
  cp package.json package.json.bak
  
  # jqがインストールされている場合は利用する
  if command -v jq &> /dev/null; then
    echo "package.jsonをjqで更新しています..."
    jq '.scripts["bundle"] = "node --max_old_space_size=4096 node_modules/expo/AppEntry.js"' package.json > package.json.tmp
    mv package.json.tmp package.json
  else
    echo "jqが見つからないため、手動での確認をお願いします: package.jsonに以下のスクリプトを追加してください:"
    echo '"bundle": "node --max_old_space_size=4096 node_modules/expo/AppEntry.js"'
  fi
fi

# キャッシュクリア
echo "キャッシュをクリアしています..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# 依存関係を整理
npm dedupe

echo "✅ Metro 互換性の修正が完了しました"
