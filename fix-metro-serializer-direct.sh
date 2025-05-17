#!/bin/bash
# メトロシリアライザーのJSONフォーマット問題を直接修正するスクリプト

set -e # エラーで停止

echo "===== メトロシリアライザーの直接修正を開始します ====="

# Expoのシリアライザー関連ファイルを見つける
EXPO_CLI_DIR="node_modules/@expo/cli"
METRO_CONFIG_DIR="node_modules/@expo/metro-config"
METRO_DIR="node_modules/metro"

if [ ! -d "$EXPO_CLI_DIR" ]; then
  echo "エラー: $EXPO_CLI_DIR が見つかりません"
  exit 1
fi

if [ ! -d "$METRO_CONFIG_DIR" ]; then
  echo "エラー: $METRO_CONFIG_DIR が見つかりません"
  exit 1
fi

if [ ! -d "$METRO_DIR" ]; then
  echo "エラー: $METRO_DIR が見つかりません"
  exit 1
fi

echo "すべての必要なパッケージが見つかりました。修正を適用します..."

# メトロシリアライザー修正を準備
mkdir -p patches
DIRECT_PATCH_DIR="patches/metro-direct-fix"
mkdir -p $DIRECT_PATCH_DIR

# 修正されたシリアライザーファイルを作成
cat > $DIRECT_PATCH_DIR/serializer-fix.js << 'EOF'
/**
 * Metroシリアライザーの直接修正
 * expo export:embedでJSONフォーマットエラーを修正
 */

// オリジナルのシリアライザーをロード
const metro = require('metro');
const path = require('path');

// 修正したシリアライザーを作成
function createFixedSerializer() {
  // デフォルトシリアライザーの取得を試みる
  const originalSerializers = (() => {
    try {
      if (typeof metro.createDefaultSerializers === 'function') {
        return metro.createDefaultSerializers();
      }
    } catch (e) {}
    
    // フォールバック: 基本的なシリアライザーを作成
    return {
      json: {
        stringify: JSON.stringify
      },
      bundle: {
        stringify: (x) => x
      }
    };
  })();
  
  // JSONシリアライザーを修正
  const fixedJsonSerializer = {
    ...originalSerializers.json,
    stringify: (data) => {
      try {
        // JavaScript変数宣言文字列をJSONに変換
        if (typeof data === 'string' && data.startsWith('var __')) {
          return JSON.stringify({
            code: data,
            map: null,
            dependencies: []
          });
        }
        
        // 通常のJSON文字列化
        if (typeof data === 'object') {
          return JSON.stringify(data);
        }
        
        // その他のケース
        return JSON.stringify({
          code: String(data),
          map: null,
          dependencies: []
        });
      } catch (e) {
        console.error('シリアライザーエラー:', e);
        return JSON.stringify({
          code: String(data),
          error: String(e),
          dependencies: []
        });
      }
    }
  };
  
  return {
    ...originalSerializers,
    json: fixedJsonSerializer
  };
}

module.exports = createFixedSerializer;
EOF

# シリアライザーを使用するmetro.config.jsを作成
cat > metro.config.js << EOF
// Expo export:embed用に修正したMetro設定
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// 直接修正したシリアライザーを使用
const createFixedSerializer = require('./patches/metro-direct-fix/serializer-fix');

// シリアライザー設定を修正
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [],
  getPolyfills: () => [],
  getRunModuleStatement: (moduleId) => \`globalThis.__r(\${moduleId});\`,
  createModuleIdFactory: () => (path) => {
    const projectRootPath = __dirname;
    if (path.includes('node_modules')) {
      const moduleName = path.split('node_modules/').pop().split('/')[0];
      return \`node_modules/\${moduleName}\`;
    }
    return path.replace(projectRootPath, '');
  },
  // 修正したシリアライザーを使用
  getSerializers: () => createFixedSerializer()
};

// その他の設定
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': \`\${__dirname}/src\`,
};

// GitHub Actions互換性のため
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

module.exports = config;
EOF

# Expoエントリーポイントを修正
cat > index.js << 'EOF'
// 修正されたExpoエントリポイント
import { registerRootComponent } from 'expo';
import App from './App';

// シリアライザー問題のワークアラウンド
if (global.__BUNDLE_START_TIME__ === undefined) {
  global.__BUNDLE_START_TIME__ = Date.now();
}

// メインコンポーネントを登録
registerRootComponent(App);
EOF

# キャッシュクリア
echo "メトロキャッシュをクリアしています..."
rm -rf node_modules/.cache/metro
rm -rf node_modules/.cache/metro-babel-register
rm -rf node_modules/.cache/metro-transform-worker

echo "===== シリアライザー修正が完了しました ====="
echo "修正済みファイル:"
echo "- metro.config.js (メトロ設定)"
echo "- patches/metro-direct-fix/serializer-fix.js (修正済みシリアライザー)"
echo "- index.js (Expoエントリポイント)"
echo ""
echo "試すコマンド:"
echo "yarn expo export:embed --eager --platform android --dev false"
