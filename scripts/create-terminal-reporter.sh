#!/bin/bash
# create-terminal-reporter.sh
# Metro TerminalReporter互換レイヤーを生成するスクリプト

set -e  # エラーで停止

echo "Creating TerminalReporter compatibility layer..."

# ディレクトリの準備
mkdir -p node_modules/metro/src/lib
mkdir -p node_modules/@expo/cli/node_modules/metro/src/lib

# TerminalReporterファイルの作成
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for Expo SDK 53 compatibility
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal || console;
    this._errors = [];
    this._warnings = [];
  }

  update() {}
  terminal() { return this._terminal; }
  
  handleError(error) {
    this._errors.push(error);
    console.error(error);
  }

  handleWarning(warning) {
    this._warnings.push(warning);
    console.warn(warning);
  }

  getErrors() { return this._errors; }
  getWarnings() { return this._warnings; }
}

module.exports = TerminalReporter;
EOL

# Expoの内部依存用にコピー
cp node_modules/metro/src/lib/TerminalReporter.js node_modules/@expo/cli/node_modules/metro/src/lib/TerminalReporter.js

echo "✅ TerminalReporter compatibility layer created successfully"
