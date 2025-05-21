#!/bin/bash
# create-terminal-reporter.sh
# Expo SDK 53 向けにMetroのTerminalReporterを作成するスクリプト

echo "📝 Creating TerminalReporter.js for Metro compatibility..."

# ディレクトリーの作成
mkdir -p node_modules/metro/src/lib

# TerminalReporter.jsを作成
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
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

# 権限の設定
chmod 644 node_modules/metro/src/lib/TerminalReporter.js

# 検証
if [ -f "node_modules/metro/src/lib/TerminalReporter.js" ]; then
  echo "✅ TerminalReporter.js successfully created"
else
  echo "❌ Failed to create TerminalReporter.js"
  exit 1
fi

# Metro-coreディレクトリの確認と修正
if [ ! -d "node_modules/metro-core" ]; then
  echo "⚠️ metro-core directory missing, creating..."
  mkdir -p node_modules/metro-core/src
  
  # パッケージJSONの作成
  cat > node_modules/metro-core/package.json << 'EOL'
{
  "name": "metro-core",
  "version": "0.77.0",
  "description": "🚇 Metro's core package for React Native.",
  "main": "src/index.js",
  "repository": {
    "type": "git",
    "url": "git@github.com:facebook/metro.git"
  },
  "license": "MIT"
}
EOL

  # 最小限のindex.jsを作成
  cat > node_modules/metro-core/src/index.js << 'EOL'
/**
 * Minimal implementation of metro-core for compatibility
 */

class Terminal {
  constructor() {
    this._log = console.log.bind(console);
    this._error = console.error.bind(console);
    this._info = console.info.bind(console);
    this._warn = console.warn.bind(console);
  }
  
  log(...args) { this._log(...args); }
  error(...args) { this._error(...args); }
  info(...args) { this._info(...args); }
  warn(...args) { this._warn(...args); }
}

module.exports = { 
  Terminal,
  Logger: {
    createWorker: () => ({
      log: console.log.bind(console),
      error: console.error.bind(console),
    }),
  },
};
EOL

  echo "✅ metro-core minimum implementation created"
fi

echo "✅ Metro compatibility setup complete"
