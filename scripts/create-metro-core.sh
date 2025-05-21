#!/bin/bash

# ========================================
# metro-core 互換性スクリプト
# GitHub Actions 環境用 - Expo SDK 53
# ========================================

echo "📝 metro-core 互換モジュールを作成します..."

# ディレクトリの作成
mkdir -p node_modules/metro-core/src

# package.json を作成
cat > node_modules/metro-core/package.json << 'EOL'
{
  "name": "metro-core",
  "version": "0.77.0",
  "description": "🚇 Metro's core package compatibility layer for Expo SDK 53",
  "main": "src/index.js",
  "license": "MIT"
}
EOL

# index.js を作成
cat > node_modules/metro-core/src/index.js << 'EOL'
/**
 * Metro Core compatibility module for Expo SDK 53
 * Created for GitHub Actions build environment
 */

class Terminal {
  constructor(options) {
    this._options = options || {};
    this._stdio = options?.stdio || {
      stdout: process.stdout,
      stderr: process.stderr,
    };
    
    this._logEnabled = !this._options.quiet;
    this._isMinimal = !!this._options.minimal;
  }

  log(...args) {
    if (this._logEnabled) {
      console.log(...args);
    }
  }

  error(...args) {
    console.error(...args);
  }

  info(...args) {
    if (this._logEnabled && !this._isMinimal) {
      console.info(...args);
    }
  }

  warn(...args) {
    if (this._logEnabled) {
      console.warn(...args);
    }
  }

  debug(...args) {
    if (this._options.debug) {
      console.debug(...args);
    }
  }

  write(data) {
    if (this._logEnabled) {
      this._stdio.stdout?.write(data);
    }
  }

  writeError(data) {
    this._stdio.stderr?.write(data);
  }
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

echo "✅ metro-core 互換モジュールを作成しました"
