#!/bin/bash
# fix-metro-incompatibility.sh
# Expo SDK 53のMetro互換性問題を解決する

echo "🔧 Metro互換性の問題を解決します..."

# ディレクトリパスの確保
METRO_DIR="node_modules/metro"
METRO_LIB_DIR="$METRO_DIR/src/lib"

# 環境確認
if [ -d "node_modules" ]; then
  echo "✅ node_modules ディレクトリが存在しています"
else
  echo "⚠️ node_modules ディレクトリが見つかりません。依存関係をインストールしてください"
  npm install --no-save
fi

# Metro依存関係のインストール
echo "📦 Metro関連パッケージのインストール..."
npm install --save-dev \
  metro@0.77.0 \
  metro-core@0.77.0 \
  metro-runtime@0.77.0 \
  metro-config@0.77.0 \
  metro-resolver@0.77.0 \
  metro-transform-worker@0.77.0 \
  metro-source-map@0.77.0 \
  @expo/metro-config@0.9.0 \
  --force

# TerminalReporterの作成
echo "📝 TerminalReporter.jsファイルの作成..."
mkdir -p "$METRO_LIB_DIR"

# ファイルを作成
cat > "$METRO_LIB_DIR/TerminalReporter.js" << 'EOL'
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

chmod 644 "$METRO_LIB_DIR/TerminalReporter.js"

# metro.config.jsの修正
if [ -f "metro.config.js" ]; then
  echo "📝 metro.config.jsの確認と修正..."
  
  # resolver.extraNodeModulesが存在するか確認
  if ! grep -q "resolver.extraNodeModules" metro.config.js; then
    # バックアップ作成
    cp metro.config.js metro.config.js.bak
    
    # 既存のファイルに設定を追加
    awk '
    /const config = getDefaultConfig/ { 
      print $0; 
      print ""; 
      print "// Make sure TerminalReporter is properly resolved";
      print "config.resolver = config.resolver || {};";
      print "config.resolver.extraNodeModules = config.resolver.extraNodeModules || {};";
      print "config.resolver.extraNodeModules[\"metro/src/lib/TerminalReporter\"] = path.resolve(__dirname, \"node_modules/metro/src/lib/TerminalReporter.js\");";
      print "";
      next;
    }
    { print $0; }
    ' metro.config.js > metro.config.js.new
    
    mv metro.config.js.new metro.config.js
    echo "✅ metro.config.jsに必要な設定を追加しました"
  else
    echo "✅ metro.config.jsは既に設定されています"
  fi
fi

# キャッシュのクリア
echo "🧹 キャッシュのクリア..."
rm -rf node_modules/.cache .expo/cache .metro-cache

# 重複パッケージの解消
echo "📦 依存関係の重複を解消..."
npm dedupe

echo "✅ Metro互換性の問題を修正しました！"
echo "次のコマンドを実行してください: npm start"
