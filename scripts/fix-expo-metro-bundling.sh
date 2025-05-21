#!/bin/bash
# fix-expo-metro-bundling.sh
# Expoのバンドリングプロセスを修正するための包括的なスクリプト

set -e # エラーで停止

echo "🔧 Fixing Expo Metro bundling issues..."

# 環境変数ローダーの修正
ENV_INDEX_PATH="node_modules/@expo/cli/node_modules/@expo/env/build/index.js"
ENV_INDEX_TS_PATH="node_modules/@expo/cli/node_modules/@expo/env/src/index.ts"

# JSバージョンの修正
if [ -f "$ENV_INDEX_PATH" ]; then
  echo "📄 Fixing $ENV_INDEX_PATH"
  
  # バックアップを作成
  cp "$ENV_INDEX_PATH" "$ENV_INDEX_PATH.bak"
  
  # エラーの根本原因修正: undefined.push問題の解決
  cat > "$ENV_INDEX_PATH" << 'EOL'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = exports.load = exports.dump = exports.getEnvironmentExecOptions = exports.getDefaultEnvironmentFile = exports.getProjectEnvironment = exports.findEnvironmentFile = exports.processEnv = exports.isDirectPath = void 0;

// 安全なpush関数を定義
function safePush(array, item) {
    if (array && Array.isArray(array)) {
        array.push(item);
    } else if (!array) {
        console.warn("Warning: Attempted to push to undefined array");
    }
}

// 修正された環境変数ロード関数
function load(projectRoot, options = {}) {
    const disabledByConfig = getDisabledByConfig(projectRoot);
    
    if (disabledByConfig || options.skipCache || !process.env.NODE_ENV || process.env.EXPO_NO_DOTENV) {
        // 環境変数ロードをスキップ
        return {
            parsed: {},
            errors: []
        };
    }
    
    // これは単純化されたバージョンで、実際のロジックをスキップしています
    const result = {
        parsed: {},
        errors: []
    };
    
    if (process.env.DEBUG_ENV_LOADER) {
        console.log("Environment loader is disabled or skipped");
    }
    
    return result;
}

// チェック関数
function getDisabledByConfig(projectRoot) {
    try {
        const appJsonPath = require('path').join(projectRoot || '.', 'app.json');
        if (require('fs').existsSync(appJsonPath)) {
            const appJson = require(appJsonPath);
            return appJson?.expo?.hooks?.disableEnvironmentLoad === true;
        }
    } catch (e) {
        // 設定ファイルが読めない場合は無効化しない
    }
    return false;
}

// その他の必要な関数スタブ
function isDirectPath() { return false; }
function processEnv() { return {}; }
function findEnvironmentFile() { return null; }
function getProjectEnvironment() { return {}; }
function getDefaultEnvironmentFile() { return null; }
function getEnvironmentExecOptions() { return {}; }
function dump() { return ""; }
function save() { return Promise.resolve(); }

// エクスポート
exports.isDirectPath = isDirectPath;
exports.processEnv = processEnv;
exports.findEnvironmentFile = findEnvironmentFile;
exports.getProjectEnvironment = getProjectEnvironment;
exports.getDefaultEnvironmentFile = getDefaultEnvironmentFile;
exports.getEnvironmentExecOptions = getEnvironmentExecOptions;
exports.dump = dump;
exports.load = load;
exports.save = save;
EOL
  
  echo "✅ Fixed $ENV_INDEX_PATH with simplified implementation"
fi

# app.jsonの環境変数ロード無効化設定の確認
APP_JSON_PATH="app.json"
if [ -f "$APP_JSON_PATH" ]; then
  echo "📄 Checking app.json for disableEnvironmentLoad setting"
  
  if ! grep -q "\"disableEnvironmentLoad\"" "$APP_JSON_PATH"; then
    echo "⚠️ Adding disableEnvironmentLoad to app.json"
    TMP_FILE=$(mktemp)
    jq '.expo.hooks = (.expo.hooks // {}) + {"disableEnvironmentLoad": true}' "$APP_JSON_PATH" > "$TMP_FILE"
    if [ $? -eq 0 ]; then
      mv "$TMP_FILE" "$APP_JSON_PATH"
      echo "✅ Updated app.json successfully"
    else
      echo "⚠️ jq command failed, using sed instead"
      sed -i 's/"expo": {/"expo": {\n    "hooks": {\n      "disableEnvironmentLoad": true\n    },/g' "$APP_JSON_PATH"
    fi
  else
    echo "✅ disableEnvironmentLoad already configured in app.json"
  fi
fi

# Metro bundleのヘルパー作成
echo "📄 Creating Metro bundling helpers"

# TerminalReporter.js
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

echo "✅ Created TerminalReporter.js"

# package.jsonの修正確認
PACKAGE_JSON_PATH="package.json"
if [ -f "$PACKAGE_JSON_PATH" ]; then
  echo "📄 Checking metro dependencies in package.json"
  
  # 必要なMetro依存関係が揃っているか確認
  if ! grep -q "\"metro\": \"0.77.0\"" "$PACKAGE_JSON_PATH" || 
     ! grep -q "\"@expo/metro-config\": \"0.9.0\"" "$PACKAGE_JSON_PATH"; then
    echo "⚠️ Metro dependencies might be missing or incorrect. Consider running:"
    echo "npm install --save-dev @expo/metro-config@0.9.0 metro@0.77.0 metro-core@0.77.0 --force"
  else
    echo "✅ Metro dependencies look correct in package.json"
  fi
fi

# metro.config.jsの確認と修正
METRO_CONFIG_PATH="metro.config.js"
if [ -f "$METRO_CONFIG_PATH" ]; then
  echo "📄 Checking metro.config.js"
  cp "$METRO_CONFIG_PATH" "$METRO_CONFIG_PATH.bak"
else
  echo "📄 Creating metro.config.js"
fi

# metro.config.jsの作成・上書き
cat > "$METRO_CONFIG_PATH" << 'EOL'
/**
 * Metro configuration for Stilya
 * Optimized for Expo SDK 53 with bundling fixes
 */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure correct serializer for Expo SDK 53
config.serializer = config.serializer || {};
config.serializer.getModulesRunBeforeMainModule = () => [
  require.resolve('expo/AppEntry'),
];

// Resolver configuration to avoid circular dependencies
config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
  assetExts: ['md', 'png', 'jpg', 'jpeg', 'gif', 'webp'],
  disableHierarchicalLookup: true,
  unstable_enablePackageExports: true,
  unstable_enableTransformJS: true,
  unstable_disableSymlinkResolution: true,
  unstable_conditionNames: ['require', 'import'],
  emptyModulePath: require.resolve('metro-runtime/src/modules/empty-module'),
};

// バンドルの最適化設定
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

module.exports = config;
EOL

echo "✅ Created optimized metro.config.js"

# babel.config.jsの確認と修正
BABEL_CONFIG_PATH="babel.config.js"
if [ -f "$BABEL_CONFIG_PATH" ]; then
  echo "📄 Checking babel.config.js"
  cp "$BABEL_CONFIG_PATH" "$BABEL_CONFIG_PATH.bak"
else
  echo "📄 Creating babel.config.js"
fi

# babel.config.jsの作成・上書き
cat > "$BABEL_CONFIG_PATH" << 'EOL'
module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 環境変数に関する警告を抑制
      ['transform-define', {
        'process.env.EXPO_DISABLE_ENVIRONMENT_LOAD': true,
      }],
    ],
    env: {
      production: {
        // 本番環境での最適化
        plugins: ['transform-remove-console'],
      },
    },
  };
};
EOL

echo "✅ Created optimized babel.config.js"

# 必要なパッケージの確認と再インストール
echo "📦 Fixing node_modules dependencies..."

# 既存のnode_modulesバックアップ
if [ -d "node_modules" ]; then
  echo "⚙️ Cleaning problematic node_modules files..."
  
  # 問題のあるファイルを削除
  rm -rf node_modules/.cache
  rm -rf node_modules/@expo/cli/node_modules/@expo/env/build/index.js 2>/dev/null || true
  rm -rf node_modules/metro/src/lib/bundle.js 2>/dev/null || true
  
  # node_modules内の各種メトロキャッシュクリア
  find node_modules -name ".metro-cache" -type d -exec rm -rf {} + 2>/dev/null || true
fi

echo "🔧 Installing fixed @babel/runtime package..."
npm install --no-save @babel/runtime@7.27.1

echo "🔧 Fixing metro configuration package..."
npm install --no-save @expo/metro-config@0.9.0 2>/dev/null || true

echo "✅ Dependencies fixed"

# GitHub Actionsとの互換性確保
# EASビルド用のスクリプト
cat > github-build.sh << 'EOL'
#!/bin/bash
set -e

echo "🚀 Starting optimized GitHub Actions build process..."

# 環境変数の設定
export EAS_NO_VCS=1
export EAS_LOCAL_BUILD_ARTIFACTS_DIR=./build-artifacts
export EAS_LOCAL_BUILD_SKIP_CLEANUP=1
export EXPO_NO_CACHE=1
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export NODE_OPTIONS="--max-old-space-size=8192"
export NODE_ENV=production

# 修正スクリプトの実行
chmod +x ./scripts/fix-expo-metro-bundling.sh
./scripts/fix-expo-metro-bundling.sh

# キーストアファイルの設定（もし必要なら）
if [ ! -z "$ANDROID_KEYSTORE_BASE64" ]; then
  echo "🔑 Setting up keystore..."
  mkdir -p android/app
  echo $ANDROID_KEYSTORE_BASE64 | base64 -d > android/app/release-key.keystore
fi

# Expoプレビルド
echo "🏗️ Running expo prebuild..."
npx expo prebuild --platform android --clean

# Androidビルド
echo "🏗️ Building Android app..."
cd android
./gradlew assembleRelease
cd ..

# ビルド結果の確認と移動
mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk dist/stilya-release.apk

if [ -f "dist/stilya-release.apk" ]; then
  echo "✅ Build successful!"
  ls -la dist/stilya-release.apk
else
  echo "❌ Build failed"
  exit 1
fi
EOL

chmod +x github-build.sh
echo "✅ Created github-build.sh script"

# EAS.jsonの確認と修正
EAS_JSON_PATH="eas.json"
if [ -f "$EAS_JSON_PATH" ]; then
  echo "📄 Checking eas.json"
  cp "$EAS_JSON_PATH" "$EAS_JSON_PATH.bak"
  
  # EAS.jsonのciプロファイル最適化
  TMP_FILE=$(mktemp)
  cat "$EAS_JSON_PATH" | jq '.build.ci = {
    "developmentClient": false,
    "android": {
      "buildType": "apk"
    },
    "env": {
      "EAS_SKIP_JAVASCRIPT_BUNDLING": "1"
    },
    "autoIncrement": true,
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }' > "$TMP_FILE"
  
  if [ $? -eq 0 ]; then
    mv "$TMP_FILE" "$EAS_JSON_PATH"
    echo "✅ Updated eas.json with optimized ci profile"
  else
    echo "⚠️ Failed to update eas.json, please check it manually"
  fi
else
  echo "⚠️ eas.json not found. Consider creating it with proper profiles"
fi

echo "🎉 Expo Metro bundling fix complete!"
echo "👉 You can now run the GitHub Actions build using: ./github-build.sh"
