#!/bin/bash

# Create the directory structure if it doesn't exist
mkdir -p node_modules/metro/src/lib

# Create the Terminal Reporter file
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

  update() {}
  
  terminal() { 
    return this._terminal; 
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
}

module.exports = TerminalReporter;
EOL

echo "✅ TerminalReporter.js created successfully"

# 実行権限を確保
chmod +x node_modules/metro/src/lib/TerminalReporter.js
