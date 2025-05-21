#!/bin/bash
# create-bundle-helpers.sh
# Stilya向けのバンドルヘルパースクリプト

echo "🛠️ Creating helper files for Expo bundle process..."

# Expoがバンドルプロセスで使用するディレクトリを確保
mkdir -p node_modules/metro/src/lib
mkdir -p node_modules/@expo/cli/node_modules/metro/src/lib

# TerminalReporter.jsを作成 - 両方の場所に配置
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for Expo SDK 53 compatibility
 * This is essential for the build process
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

  getErrors() { return this._errors; }
  getWarnings() { return this._warnings; }
  update() {}
  terminal() { return this._terminal; }
}

module.exports = TerminalReporter;
EOL

# 同じファイルをExpo CLIのnode_modulesにも配置
cp node_modules/metro/src/lib/TerminalReporter.js node_modules/@expo/cli/node_modules/metro/src/lib/TerminalReporter.js 2>/dev/null || :

# metro-core のスタブも作成
mkdir -p node_modules/metro-core/src
mkdir -p node_modules/@expo/cli/node_modules/metro-core/src

# metro-core/package.json
cat > node_modules/metro-core/package.json << 'EOL'
{
  "name": "metro-core",
  "version": "0.77.0",
  "description": "Metro Core functionality",
  "main": "src/index.js",
  "license": "MIT"
}
EOL

# metro-core/src/index.js
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

# Expo CLIのnode_modulesにも同じファイルをコピー
cp -f node_modules/metro-core/package.json node_modules/@expo/cli/node_modules/metro-core/package.json 2>/dev/null || :
cp -f node_modules/metro-core/src/index.js node_modules/@expo/cli/node_modules/metro-core/src/index.js 2>/dev/null || :

# 権限設定
chmod 644 node_modules/metro/src/lib/TerminalReporter.js
chmod 644 node_modules/metro-core/src/index.js
chmod 644 node_modules/metro-core/package.json

# 存在確認
if [ -f "node_modules/metro/src/lib/TerminalReporter.js" ] && \
   [ -f "node_modules/metro-core/src/index.js" ]; then
  echo "✅ Metro compatibility files created successfully"
else
  echo "❌ Failed to create metro compatibility files"
  exit 1
fi

echo "✅ Bundle process helpers are ready!"
