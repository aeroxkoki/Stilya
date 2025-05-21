#!/bin/bash
# fix-github-actions-metro.sh
# GitHub Actions専用のMetro互換性修正スクリプト

set -e  # エラーで停止

echo "🔧 GitHub Actions用のMetro互換性問題を修正します..."

# 必要なディレクトリ構造を確保
mkdir -p node_modules/metro/src/lib
mkdir -p node_modules/metro-core/src
mkdir -p node_modules/@expo/cli/node_modules/metro-config

# Metro-configをリンク（CLI内のモジュール解決パスのため）
if [ ! -d "node_modules/@expo/cli/node_modules/metro-config" ]; then
  ln -sf ../../../node_modules/metro-config node_modules/@expo/cli/node_modules/metro-config
  echo "✅ metro-configモジュールをリンクしました"
fi

# TerminalReporter.jsの作成（CI環境での必須ファイル）
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for Expo SDK 53 compatibility
 * GitHub Actions専用互換レイヤー
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
  terminal() { return this._terminal; }
  
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
echo "✅ TerminalReporter.jsを作成しました"

# metro-coreモジュールの作成（互換レイヤー）
cat > node_modules/metro-core/package.json << 'EOL'
{
  "name": "metro-core",
  "version": "0.77.0",
  "description": "🚇 Metro's core package compatibility layer for Expo SDK 53",
  "main": "src/index.js",
  "license": "MIT"
}
EOL

cat > node_modules/metro-core/src/index.js << 'EOL'
/**
 * Metro Core compatibility module for Expo SDK 53
 * GitHub Actions用互換レイヤー
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
echo "✅ metro-coreモジュールを作成しました"

# 依存関係の再インストール
echo "📦 Metroパッケージの再インストール..."
npm install --no-save \
  metro@0.77.0 \
  metro-config@0.77.0 \
  metro-core@0.77.0 \
  metro-runtime@0.77.0 \
  metro-source-map@0.77.0 \
  metro-resolver@0.77.0 \
  @expo/metro-config@0.9.0 \
  @babel/runtime@7.27.1

# メトロ設定を最適化
echo "📝 metro.config.jsを最適化..."
cat > metro.config.js << 'EOL'
/**
 * Metro configuration for Stilya (GitHub Actions互換)
 * ビルド環境向けに最適化
 */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// リゾルバー設定の最適化
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    "metro/src/lib/TerminalReporter": path.resolve(__dirname, "node_modules/metro/src/lib/TerminalReporter.js"),
    "metro-config": path.resolve(__dirname, "node_modules/metro-config"),
    "metro-core": path.resolve(__dirname, "node_modules/metro-core"),
    "@expo/metro-config": path.resolve(__dirname, "node_modules/@expo/metro-config")
  },
  disableHierarchicalLookup: true,
  unstable_enablePackageExports: false,
};

// トランスフォーマー設定
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// シリアライザー設定
config.serializer = config.serializer || {};
config.serializer.getModulesRunBeforeMainModule = () => [
  require.resolve('expo/AppEntry'),
];

module.exports = config;
EOL
echo "✅ metro.config.jsを更新しました"

# キャッシュをクリーンアップ
echo "🧹 キャッシュをクリーンアップ..."
rm -rf node_modules/.cache
rm -rf .expo/cache || true
rm -rf ~/.expo/cache || true
rm -rf .metro-cache || true

echo "✅ GitHub Actions用のMetro互換性修正が完了しました！"
