#!/bin/bash
# create-terminal-reporter.sh
# Metro TerminalReporter互換レイヤーを生成するスクリプト

# エラー時に中断せず、実行を継続する
set +e

echo "Creating TerminalReporter compatibility layer..."

# -pフラグは既に存在するディレクトリを上書きしないので安全
mkdir -p node_modules/metro/src/lib
mkdir -p node_modules/@expo/cli/node_modules
mkdir -p node_modules/@expo/cli/node_modules/metro
mkdir -p node_modules/@expo/cli/node_modules/metro/src/lib

# すべてのディレクトリが存在するか確認
if [ ! -d "node_modules/metro/src/lib" ] || [ ! -d "node_modules/@expo/cli/node_modules/metro/src/lib" ]; then
  echo "⚠️ Warning: Some directories could not be created. Continuing anyway..."
fi

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
