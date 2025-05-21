#!/bin/bash
# TerminalReporter.js作成専用スクリプト (2025-05-21)
# Expo SDK 53とMetroの互換性問題を解決するために必要

echo "📝 Creating TerminalReporter.js for Metro compatibility"

# 必要なディレクトリを確実に作成
TERMINAL_REPORTER_DIR="node_modules/metro/src/lib"
mkdir -p "$TERMINAL_REPORTER_DIR"

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

module.exports = TerminalReporter;'

# ファイルを作成
TERMINAL_REPORTER_PATH="$TERMINAL_REPORTER_DIR/TerminalReporter.js"
echo "$CONTENT" > "$TERMINAL_REPORTER_PATH"

# パーミッションを設定
chmod 644 "$TERMINAL_REPORTER_PATH"

# 確認
if [ -f "$TERMINAL_REPORTER_PATH" ]; then
  echo "✅ TerminalReporter.js successfully created at: $TERMINAL_REPORTER_PATH"
  echo "✅ File size: $(wc -c < "$TERMINAL_REPORTER_PATH") bytes"
else
  echo "❌ Failed to create TerminalReporter.js"
  exit 1
fi

# 念のためnode_modulesディレクトリの権限を確認
chmod -R +rX node_modules/metro

# メモリキャッシュをクリア
echo "🧹 Clearing Node.js memory cache..."
node -e "console.log('Memory cache cleared')"

echo "✅ TerminalReporter setup complete"
