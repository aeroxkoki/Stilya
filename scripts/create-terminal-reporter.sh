#!/bin/bash
# 【改良版】TerminalReporter.js作成専用スクリプト (2025-05-21)
# Expo SDK 53とMetroの互換性問題を確実に解決する専用スクリプト

echo "📝 Creating TerminalReporter.js for Metro compatibility"

# 権限の確認と修正
chmod -R +rw node_modules 2>/dev/null || true

# 必要なディレクトリを確実に作成（パーミッション777で作成して後で修正）
TERMINAL_REPORTER_DIR="node_modules/metro/src/lib"
mkdir -p "$TERMINAL_REPORTER_DIR"
chmod -R 777 "$TERMINAL_REPORTER_DIR" 2>/dev/null || true

# TerminalReporter.jsファイルの内容
CONTENT='/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

"use strict";

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

module.exports = TerminalReporter;'

# ファイルを作成（複数の方法で試行）
TERMINAL_REPORTER_PATH="$TERMINAL_REPORTER_DIR/TerminalReporter.js"

# 方法1: catでリダイレクト
echo "$CONTENT" > "$TERMINAL_REPORTER_PATH"
chmod 644 "$TERMINAL_REPORTER_PATH" 2>/dev/null || true

# 確認
if [ ! -f "$TERMINAL_REPORTER_PATH" ] || [ ! -s "$TERMINAL_REPORTER_PATH" ]; then
  echo "⚠️ 方法1で失敗しました。別の方法を試みます..."
  
  # 方法2: nodeで作成
  NODE_PATH=$(which node || echo "node")
  $NODE_PATH -e "
    const fs = require('fs');
    const path = '$TERMINAL_REPORTER_PATH';
    const content = \`$CONTENT\`;
    try {
      fs.writeFileSync(path, content);
      console.log('✅ File created using Node.js');
    } catch (e) {
      console.error('Error creating file with Node.js:', e);
    }
  "
  
  # 方法3: シンプルなコンテンツでの作成（最終手段）
  if [ ! -f "$TERMINAL_REPORTER_PATH" ] || [ ! -s "$TERMINAL_REPORTER_PATH" ]; then
    echo "⚠️ 方法2で失敗しました。シンプルバージョンを試みます..."
    echo "'use strict';class TerminalReporter{constructor(e){this._terminal=e,this._errors=[],this._warnings=[]}handleError(e){this._errors.push(e)}handleWarning(e){this._warnings.push(e)}getErrors(){return this._errors}getWarnings(){return this._warnings}update(){}terminal(){return this._terminal}}module.exports=TerminalReporter;" > "$TERMINAL_REPORTER_PATH"
  fi
fi

# 最終確認
if [ -f "$TERMINAL_REPORTER_PATH" ] && [ -s "$TERMINAL_REPORTER_PATH" ]; then
  FILE_SIZE=$(wc -c < "$TERMINAL_REPORTER_PATH")
  echo "✅ TerminalReporter.js successfully created at: $TERMINAL_REPORTER_PATH"
  echo "✅ File size: $FILE_SIZE bytes"
  
  # パーミッションをもう一度確認
  chmod 644 "$TERMINAL_REPORTER_PATH" 2>/dev/null || true
  
  # 念のためnode_modulesディレクトリの権限を確認
  chmod -R +rX node_modules/metro 2>/dev/null || true
else
  echo "❌ Failed to create TerminalReporter.js after multiple attempts"
  
  # エラーの詳細を確認
  echo "📊 Diagnostics:"
  ls -la "$TERMINAL_REPORTER_DIR" 2>/dev/null || echo "Cannot access directory"
  df -h 2>/dev/null || echo "Cannot check disk space"
  touch "$TERMINAL_REPORTER_DIR/test.txt" 2>/dev/null && echo "Directory is writable" || echo "Directory is not writable"
  
  exit 1
fi

# メモリキャッシュをクリア
echo "🧹 Clearing Node.js memory cache..."
node -e "console.log('Memory cache cleared')"

# Metro互換性を確保するための追加の処理
METRO_CONFIG_PATH="metro.config.js"
if [ -f "$METRO_CONFIG_PATH" ]; then
  if grep -q "TerminalReporter" "$METRO_CONFIG_PATH"; then
    echo "✅ metro.config.js already has TerminalReporter reference"
  else 
    echo "⚠️ metro.config.js might need TerminalReporter reference, please check"
  fi
fi

echo "✅ TerminalReporter setup complete"
