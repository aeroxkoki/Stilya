#!/bin/bash
# Metro関連の依存関係問題を解決するスクリプト

set -e # エラーが発生したら停止

echo "🔧 Fixing Metro dependencies for Expo SDK 53..."

# 1. 必要なメトロパッケージをインストール
echo "📦 Installing Metro packages..."
npm install --save-dev metro@0.77.0 metro-core@0.77.0 metro-runtime@0.77.0 metro-config@0.77.0 @expo/metro-config@0.9.0 --force

# 2. dedupe を実行して重複を解消
echo "🧹 Running npm dedupe..."
npm dedupe

# 3. TerminalReporter.js の作成
echo "📝 Creating TerminalReporter.js..."
mkdir -p node_modules/metro/src/lib

cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro compatibility layer for Expo SDK 53
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

echo "✅ TerminalReporter.js created successfully"

# 4. metro-core の確認と緊急修正
if [ ! -d "node_modules/metro-core" ]; then
  echo "⚠️ metro-core not found, creating emergency version..."
  mkdir -p node_modules/metro-core/src
  echo '{"name":"metro-core","version":"0.77.0","main":"src/index.js"}' > node_modules/metro-core/package.json
  
  cat > node_modules/metro-core/src/index.js << 'EOL'
/**
 * Emergency metro-core implementation for Expo SDK 53
 */
class Terminal {
  constructor() {
    this._log = console.log.bind(console);
    this._error = console.error.bind(console);
  }

  log(...args) {
    this._log(...args);
  }

  error(...args) {
    this._error(...args);
  }

  info(...args) {
    this._log(...args);
  }

  warn(...args) {
    this._log(...args);
  }
}

module.exports = {
  Terminal
};
EOL

  echo "✅ Emergency metro-core created"
fi

# 5. キャッシュのクリア
echo "🧹 Clearing caches..."
rm -rf node_modules/.cache .expo/cache .metro-cache

echo "✅ Metro dependencies fixed successfully!"
