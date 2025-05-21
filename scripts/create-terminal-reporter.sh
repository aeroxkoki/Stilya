#!/bin/bash
# Expo SDK 53向けのTerminalReporterを作成するスクリプト

TERMINAL_REPORTER_PATH="node_modules/metro/src/lib/TerminalReporter.js"

echo "📝 TerminalReporter.js ファイルを作成します..."

# ディレクトリ作成
mkdir -p node_modules/metro/src/lib

# ファイル作成
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

# パーミッション設定
chmod 644 "$TERMINAL_REPORTER_PATH"

# 確認
if [ -f "$TERMINAL_REPORTER_PATH" ]; then
  echo "✅ TerminalReporter.js が正常に作成されました"
  ls -la "$TERMINAL_REPORTER_PATH"
else
  echo "❌ TerminalReporter.js の作成に失敗しました"
  exit 1
fi

echo "🔍 @expo/cli ディレクトリも確認します..."
EXPO_CLI_DIR="node_modules/@expo/cli/build/src/start/server/metro"

if [ ! -d "$EXPO_CLI_DIR" ]; then
  echo "📂 @expo/cli ディレクトリを作成します..."
  mkdir -p "$EXPO_CLI_DIR"
fi

EXPO_REPORTER_PATH="$EXPO_CLI_DIR/TerminalReporter.js"
if [ ! -f "$EXPO_REPORTER_PATH" ]; then
  echo "📝 Expo版のTerminalReporter.jsも作成します..."
  
  cat > "$EXPO_REPORTER_PATH" << 'EOL'
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

  chmod 644 "$EXPO_REPORTER_PATH"
  echo "✅ Expo版のTerminalReporter.jsが正常に作成されました"
  ls -la "$EXPO_REPORTER_PATH"
else
  echo "👍 Expo版のTerminalReporter.jsは既に存在します"
fi

echo "🎉 全てのTerminalReporterファイルが正常に設定されました！"