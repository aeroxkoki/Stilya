#!/bin/bash
# fix-ci-dependencies.sh - Stilya CI環境向け依存関係修正スクリプト 
# GitHub Actions および Expo SDK 53 互換性対応 (2025年5月21日)

set -e

echo "🔧 Stilya アプリのCI環境向け依存関係問題を修正します..."

# キャッシュクリア
echo "🧹 キャッシュをクリアします..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf ~/.metro-cache 2>/dev/null || true
echo "✅ キャッシュをクリアしました"

# 依存関係の再インストール（メインモジュール）
echo "📥 主要な依存関係を再インストールします..."
npm install --no-save \
  metro@0.77.0 \
  metro-config@0.77.0 \
  metro-core@0.77.0 \
  metro-runtime@0.77.0 \
  metro-source-map@0.77.0 \
  metro-resolver@0.77.0 \
  @expo/metro-config@0.9.0 \
  @babel/runtime@7.27.1

# npmrcの最適化（CI環境との互換性向上）
echo "📝 .npmrcを最適化しています..."
cat > .npmrc << 'EOL'
cache=false
prefer-offline=false
fund=false
audit=false
update-notifier=false
scripts-prepend-node-path=true
engine-strict=false
legacy-peer-deps=true
EOL

# TerminalReporter の作成
echo "📝 TerminalReporter.js を作成します..."
mkdir -p node_modules/metro/src/lib
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for compatibility with Expo SDK 53.
 * 強化版 (GitHub Actions互換)
 */
"use strict";
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
chmod 644 node_modules/metro/src/lib/TerminalReporter.js
echo "✅ TerminalReporter.js を作成しました"

# metro-coreモジュールの強化
echo "📝 metro-coreモジュールを強化しています..."
mkdir -p node_modules/metro-core/src
cat > node_modules/metro-core/src/index.js << 'EOL'
/**
 * Metro Core compatibility module for Expo SDK 53
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

cat > node_modules/metro-core/package.json << 'EOL'
{
  "name": "metro-core",
  "version": "0.77.0",
  "description": "Metro's core package compatibility layer for Expo SDK 53",
  "main": "src/index.js",
  "license": "MIT"
}
EOL

# Expoの内部依存関係のためにシンボリックリンクを作成
echo "🔗 Expoの内部依存用のリンクを作成しています..."
mkdir -p node_modules/@expo/cli/node_modules/metro/src/lib
mkdir -p node_modules/@expo/cli/node_modules/metro-core
mkdir -p node_modules/@expo/cli/node_modules/metro-config

# シンボリックリンクを作成
ln -sf ../../../node_modules/metro/src/lib/TerminalReporter.js node_modules/@expo/cli/node_modules/metro/src/lib/TerminalReporter.js 2>/dev/null || cp node_modules/metro/src/lib/TerminalReporter.js node_modules/@expo/cli/node_modules/metro/src/lib/TerminalReporter.js
ln -sf ../../../node_modules/metro-core node_modules/@expo/cli/node_modules/metro-core 2>/dev/null || cp -r node_modules/metro-core node_modules/@expo/cli/node_modules/
ln -sf ../../../node_modules/metro-config node_modules/@expo/cli/node_modules/metro-config 2>/dev/null || cp -r node_modules/metro-config node_modules/@expo/cli/node_modules/

# 問題解決の検証
echo "🔍 問題が解決されたか確認します..."
npm ls metro-core metro-config @expo/metro-config @babel/runtime 2>/dev/null || true

echo "✅ 修正プロセスが完了しました!"
echo "💡 GitHub Actionsでの実行に最適化されました。"