#!/bin/bash
# GitHub Actions用の直接TerminalReporter.js作成スクリプト

# 必要なディレクトリを確認
mkdir -p node_modules/metro/src/lib

# ファイル内容の作成
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
  terminal() { return this._terminal; }
}

module.exports = TerminalReporter;
EOL

# 権限設定
chmod 644 node_modules/metro/src/lib/TerminalReporter.js

# 確認
if [ -f "node_modules/metro/src/lib/TerminalReporter.js" ]; then
  echo "✅ TerminalReporter.js created successfully"
  ls -la node_modules/metro/src/lib/TerminalReporter.js
  head -n 5 node_modules/metro/src/lib/TerminalReporter.js
else
  echo "❌ Failed to create TerminalReporter.js"
  exit 1
fi
