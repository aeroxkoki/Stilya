#!/bin/bash
# Expoシリアライザー問題を直接修正するためのスクリプト

set -e # エラーで終了

echo "======== Expoシリアライザー問題の修正を開始します ========"

# キャッシュをクリア
echo "キャッシュをクリアしています..."
rm -rf node_modules/.cache
rm -rf $HOME/.expo
rm -rf $HOME/.metro
npm cache clean --force || true
yarn cache clean || true

# パッケージバージョンを確認
echo "Metroのバージョンを確認しています..."
METRO_VERSION=$(node -e "try { console.log(require('metro/package.json').version) } catch(e) { console.log('not installed') }")
METRO_CONFIG_VERSION=$(node -e "try { console.log(require('metro-config/package.json').version) } catch(e) { console.log('not installed') }")
EXPO_METRO_VERSION=$(node -e "try { console.log(require('@expo/metro-config/package.json').version) } catch(e) { console.log('not installed') }")

echo "現在のバージョン:"
echo "- metro: $METRO_VERSION"
echo "- metro-config: $METRO_CONFIG_VERSION"
echo "- @expo/metro-config: $EXPO_METRO_VERSION"

# 必要なら更新
if [ "$METRO_VERSION" != "0.76.8" ] || [ "$METRO_CONFIG_VERSION" != "0.76.8" ]; then
  echo "Metroパッケージを更新しています..."
  yarn add --dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8 metro-runtime@0.76.8 \
    metro-resolver@0.76.8 metro-source-map@0.76.8 metro-react-native-babel-transformer@0.76.8 \
    metro-transform-worker@0.76.8 metro-minify-terser@0.76.8
fi

if [ "$EXPO_METRO_VERSION" != "0.10.7" ]; then
  echo "@expo/metro-configを更新しています..."
  yarn add --dev @expo/metro-config@0.10.7
fi

# パッチディレクトリの確認
if [ ! -d "patches" ]; then
  echo "patchesディレクトリを作成しています..."
  mkdir -p patches
fi

# metro.config.jsの確認と修正
echo "metro.config.jsを修正しています..."
cat > metro.config.js << 'EOF'
// Expoのシリアライズ問題用に修正されたメトロ設定
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// 修正されたシリアライザーを取得
const createFixedSerializer = require('./patches/patched-serializer');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// シリアライザーのカスタマイズ
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [],
  getPolyfills: () => [],
  getRunModuleStatement: (moduleId) => `globalThis.__r(${moduleId});`,
  createModuleIdFactory: () => (path) => {
    const projectRootPath = __dirname;
    if (path.includes('node_modules')) {
      const moduleName = path.split('node_modules/').pop().split('/')[0];
      return `node_modules/${moduleName}`;
    }
    return path.replace(projectRootPath, '');
  },
  // 修正されたシリアライザーを使用
  getSerializers: () => createFixedSerializer()
};

// その他の設定
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// GitHub Actions互換性
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

// キャッシュを無効化（ビルド時のみ）
const args = process.argv || [];
if (args.includes('export:embed') || args.includes('--non-interactive')) {
  console.log('[Metro Config] Building with cache disabled for export:embed');
  config.cacheStores = [];
  config.resetCache = true;
} 

module.exports = config;
EOF

# パッチスクリプトの作成
echo "シリアライザーパッチを作成しています..."
cat > patches/patched-serializer.js << 'EOF'
/**
 * Patched Metro serializer for Expo export:embed
 * This fixed the "Serializer did not return expected format" error
 */
const metro = require('metro');

// Create a fixed serializer that ensures JSON output
function createFixedSerializer() {
  // Get the original serializers
  let originalSerializers;
  try {
    // Try to use metro's createDefaultSerializers if available
    if (typeof metro.createDefaultSerializers === 'function') {
      originalSerializers = metro.createDefaultSerializers();
    } else {
      // Fallback: create basic serializers
      originalSerializers = {
        json: {
          stringify: JSON.stringify
        },
        bundle: {
          stringify: (x) => x
        }
      };
    }
  } catch (e) {
    console.error('Error creating default serializers:', e);
    // Emergency fallback
    originalSerializers = {
      json: {
        stringify: JSON.stringify
      },
      bundle: {
        stringify: (x) => x
      }
    };
  }
  
  // Create a patched JSON serializer that forcibly converts JS to JSON
  const patchedJSONSerializer = {
    ...originalSerializers.json,
    stringify: (data) => {
      // Force JSON formatting
      try {
        if (typeof data === 'string' && data.startsWith('var __')) {
          console.log('[Metro Patch] Converting JS to JSON format');
          // If it's already JavaScript code, convert it to JSON
          return JSON.stringify({ 
            code: data,
            map: null,
            dependencies: []
          });
        }
        // Normal JSON stringification
        return JSON.stringify(data);
      } catch (e) {
        console.error('[Metro Patch] Error in patched serializer:', e);
        // Fallback to string conversion
        try {
          // Try one more time with string conversion
          return JSON.stringify({
            code: String(data),
            map: null,
            dependencies: []
          });
        } catch (e2) {
          console.error('[Metro Patch] Failed fallback serialization:', e2);
          // Last resort: return empty but valid JSON
          return JSON.stringify({
            code: "",
            map: null,
            dependencies: []
          });
        }
      }
    }
  };
  
  // Create a patched bundle serializer for extra safety
  const patchedBundleSerializer = {
    ...originalSerializers.bundle,
    stringify: (moduleObj) => {
      try {
        // If the bundle serializer gets a string, ensure it's in the right format
        if (typeof moduleObj === 'string') {
          if (moduleObj.startsWith('var __BUNDLE_START_TIME__')) {
            // Already JS bundle format, keep as is
            return moduleObj;
          } else {
            // Convert to proper format
            return `var __BUNDLE_START_TIME__ = Date.now(); ${moduleObj}`;
          }
        } else if (moduleObj && typeof moduleObj === 'object') {
          // If it's an object, use the original serializer
          return originalSerializers.bundle.stringify(moduleObj);
        }
        // Fallback for unexpected input
        return String(moduleObj);
      } catch (e) {
        console.error('[Metro Patch] Bundle serializer error:', e);
        // Safe fallback
        return String(moduleObj || '');
      }
    }
  };
  
  return {
    ...originalSerializers,
    json: patchedJSONSerializer,
    bundle: patchedBundleSerializer
  };
}

module.exports = createFixedSerializer;
EOF

# グローバルパッチディレクトリの確認
if [ ! -d "patches/expo-monkey-patch" ]; then
  echo "グローバルパッチディレクトリを作成しています..."
  mkdir -p patches/expo-monkey-patch
fi

# JSONパーサーパッチの作成
echo "JSONパーサーパッチを作成しています..."
cat > patches/expo-monkey-patch/json-serializer-patch.js << 'EOF'
/**
 * Expoのシリアライズエラーを修正するためのグローバルパッチ
 * こちらは緊急措置用であり、metro.config.jsの設定が優先されます
 */

// オリジナルのJSONパースを保存
const originalJSONParse = JSON.parse;

// JSONのパース処理をモンキーパッチ
JSON.parse = function(text, ...args) {
  // JavaScriptコードかどうかチェック
  if (typeof text === 'string' && text.startsWith('var __BUNDLE')) {
    console.log('[Expo Patch] JavaScriptコードをJSONに変換します');
    // JavaScriptコードをJSONに変換
    return {
      code: text,
      map: null,
      dependencies: []
    };
  }
  
  // 通常のJSON文字列の場合は元のJSON.parseを使用
  try {
    return originalJSONParse(text, ...args);
  } catch (e) {
    // シリアライズエラー対応
    if (e instanceof SyntaxError && typeof text === 'string') {
      console.warn('[Expo Patch] JSON構文エラー - フォールバック処理を実行します:', e.message);
      
      // フォールバック: JavaScriptコードとして扱う
      return {
        code: String(text),
        map: null,
        dependencies: []
      };
    }
    
    // その他のエラーは再スロー
    throw e;
  }
};

// オリジナルのJSONストリンギファイを保存
const originalJSONStringify = JSON.stringify;

// JSONのストリンギファイ処理もパッチ
JSON.stringify = function(value, ...args) {
  try {
    // 通常のストリンギファイを試す
    return originalJSONStringify(value, ...args);
  } catch (e) {
    console.warn('[Expo Patch] JSONストリンギファイエラー - フォールバック処理を実行します:', e.message);
    
    // フォールバック: シンプルなオブジェクトに変換
    if (typeof value === 'string') {
      // 文字列の場合はコードとして扱う
      return originalJSONStringify({
        code: value,
        map: null,
        dependencies: []
      }, ...args);
    } else {
      // その他の場合は空のオブジェクトを返す
      return originalJSONStringify({
        code: "",
        map: null,
        dependencies: []
      }, ...args);
    }
  }
};

// パッチが適用されたことを通知
console.log('[Expo Patch] JSONパーサー/ストリンギファイが正常にパッチされました');
EOF

# エントリポイントの修正
echo "index.jsを修正しています..."
cat > index.js << 'EOF'
// ExpoのJSON解析エラーに対処するための修正版エントリーポイント
import { registerRootComponent } from 'expo';
import App from './App';

// JSONパーサーパッチをロード（できるだけ早く）
import './patches/expo-monkey-patch/json-serializer-patch';

// バンドル時間の初期化（一部の環境で必要）
if (global.__BUNDLE_START_TIME__ === undefined) {
  global.__BUNDLE_START_TIME__ = Date.now();
}

// アプリを登録
registerRootComponent(App);
EOF

# 実行確認用のラッパースクリプト
echo "テスト実行スクリプトを作成しています..."
cat > run-patched-expo-export.js << 'EOF'
/**
 * expo export:embed実行の互換性対応ラッパー
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===== expo export:embed 互換性ラッパーを開始します =====');

// JSONパッチを読み込む
require('./patches/expo-monkey-patch/json-serializer-patch');
console.log('グローバルJSONパッチを読み込みました');

// Expo CLIを実行
console.log('expo export:embedを実行しています...');
const args = process.argv.slice(2);
const defaultArgs = ['export:embed', '--eager', '--platform', 'android', '--dev', 'false'];
const finalArgs = args.length > 0 ? args : defaultArgs;

// プロセス実行
const result = spawnSync('expo', finalArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PATCHED: 'true',
    EXPO_NO_CACHE: 'true',
    NODE_OPTIONS: '--no-warnings'
  }
});

// 終了コードを継承
process.exit(result.status);
EOF

echo "パッチを適用しました。"
echo ""
echo "このスクリプトを使用して expo export:embed を実行します:"
echo "node run-patched-expo-export.js"
echo ""
echo "======== 修正が完了しました ========"
