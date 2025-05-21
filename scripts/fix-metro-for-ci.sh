#!/bin/bash
# fix-metro-for-ci.sh
# CI環境でMetroのバンドリング問題を解決するスクリプト

set -e # エラーで停止

echo "🔧 Fixing Metro compatibility issues for CI..."

# TerminalReporter.jsがないことが主要な問題
echo "📝 Creating missing TerminalReporter.js..."
mkdir -p node_modules/metro/src/lib
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for Expo SDK 53 compatibility
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

# メトロ設定の修正
echo "📝 Updating metro.config.js with resolver fixes..."
cat > metro.config.js << 'EOL'
/**
 * Metro configuration for Stilya
 * Optimized for GitHub Actions and Expo SDK 53
 */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// バンドルの最適化設定
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    // 最適化レベルを下げて安定性を確保
    ecma: 8,
    keep_classnames: true,
    keep_fnames: true,
    module: true,
  },
};

// Resolver設定を最適化
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    "metro/src/lib/TerminalReporter": path.resolve(__dirname, "node_modules/metro/src/lib/TerminalReporter.js")
  },
  resolverMainFields: ['react-native', 'browser', 'main'],
  disableHierarchicalLookup: true,
  unstable_enablePackageExports: false,
};

// Ensure correct serializer for Expo SDK 53
config.serializer = config.serializer || {};
config.serializer.getModulesRunBeforeMainModule = () => [
  require.resolve('expo/AppEntry'),
];

// キャッシュ設定の最適化
config.cacheStores = [
  {
    type: 'file',
  },
];

module.exports = config;
EOL

# EAS ビルド設定を最適化
echo "📝 Optimizing eas.json for CI builds..."
cat > eas.json << 'EOL'
{
  "cli": {
    "version": ">=7.3.0",
    "requireCommit": false,
    "promptToConfigurePushNotifications": false
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    },
    "local": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "ci": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "withoutCredentials": true
      },
      "env": {
        "EAS_SKIP_JAVASCRIPT_BUNDLING": "1",
        "EXPO_NO_CACHE": "1"
      },
      "autoIncrement": false,
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
EOL

# バージョンを強制上書き
echo "📝 Ensuring correct dependencies..."
npm install --no-save @babel/runtime@7.27.1 \
  @expo/metro-config@0.9.0 \
  metro@0.77.0 \
  metro-core@0.77.0 \
  metro-runtime@0.77.0 \
  babel-preset-expo@13.1.11

echo "✅ Metro fixes applied successfully!"
echo "🎉 CI compatibility fixes completed!"
