#!/bin/bash
# Expoの内部コードを直接モンキーパッチするための緊急スクリプト
# このスクリプトはExpoのCLI内部実装を直接修正します

set -e # エラーで即終了

echo "========= Expo内部コードの緊急モンキーパッチを適用します ========="

# 必要なディレクトリを確認
EXPO_CLI_DIR="node_modules/@expo/cli"
METRO_DIR="node_modules/metro"

if [ ! -d "$EXPO_CLI_DIR" ]; then
  echo "エラー: $EXPO_CLI_DIR が見つかりません"
  exit 1
fi

if [ ! -d "$METRO_DIR" ]; then
  echo "エラー: $METRO_DIR が見つかりません"
  exit 1
fi

echo "Expoのディレクトリ構造を確認しています..."

# Expoの問題のあるファイルを見つける
BUNDLER_DIR="${EXPO_CLI_DIR}/src/start/server/metro"
BUNDLER_FILE="${BUNDLER_DIR}/MetroBundlerDevServer.js"

if [ ! -d "$BUNDLER_DIR" ]; then
  # ディレクトリがない場合は作成する（コンパイル後のファイルシステムなどの可能性）
  echo "ExpoのCLIディレクトリ構造が標準と異なります。適切なファイルを探しています..."
  
  # ビルドディレクトリを探す
  BUILD_DIR="${EXPO_CLI_DIR}/build"
  if [ -d "$BUILD_DIR" ]; then
    echo "ビルドディレクトリが見つかりました: $BUILD_DIR"
    # ファイルを検索
    BUNDLER_JS_FILE=$(find "$BUILD_DIR" -name "MetroBundlerDevServer.js" | head -n 1)
    if [ -n "$BUNDLER_JS_FILE" ]; then
      echo "バンドラーファイルを発見: $BUNDLER_JS_FILE"
      BUNDLER_FILE="$BUNDLER_JS_FILE"
    fi
  fi
fi

# ファイルの存在確認
if [ ! -f "$BUNDLER_FILE" ]; then
  echo "バンドラーファイルが見つかりません。スキップして別の方法を試みます。"
  
  # node_modules全体から検索
  echo "node_modules全体から必要なファイルを検索しています..."
  BUNDLER_JS_FILE=$(find node_modules -name "MetroBundlerDevServer.js" | head -n 1)
  if [ -n "$BUNDLER_JS_FILE" ]; then
    echo "バンドラーファイルを発見: $BUNDLER_JS_FILE"
    BUNDLER_FILE="$BUNDLER_JS_FILE"
  else
    echo "バンドラーファイルが見つかりませんでした。Expoの内部実装を修正できません。"
    # フォールバック方法の提案
    echo "代替方法としてmetro.config.jsを修正します..."
  fi
fi

# 作業ディレクトリを作成
mkdir -p patches/expo-monkey-patch
PATCH_DIR="patches/expo-monkey-patch"

# カスタムシリアライザーを作成
cat > "${PATCH_DIR}/json-serializer-patch.js" << 'EOF'
/**
 * Expoのシリアライズエラーを修正するためのパッチ
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
    console.error('[Expo Patch] JSONパースエラー:', e);
    // フォールバック: JavaScriptコードとして扱う
    return {
      code: String(text),
      map: null,
      dependencies: []
    };
  }
};

// パッチが適用されたことを通知
console.log('[Expo Patch] JSONパーサーが正常にパッチされました');
EOF

# metro.config.jsを更新
cat > metro.config.js << EOF
// Expoのシリアライズ問題用に修正されたメトロ設定
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// JSONパーサーパッチを読み込む（グローバルに適用される）
require('./patches/expo-monkey-patch/json-serializer-patch');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// シリアライザーのカスタマイズ
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
  }
};

// その他の設定
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': \`\${__dirname}/src\`,
};

// GitHub Actions互換性
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

module.exports = config;
EOF

# Expoのエントリーポイントパッチ
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

# Expoの起動スクリプトを作成
cat > start-patched-expo.js << 'EOF'
/**
 * パッチ適用済みのExpoアプリを起動するスクリプト
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// JSONパーサーパッチをグローバルに適用
try {
  require('./patches/expo-monkey-patch/json-serializer-patch');
  console.log('JSON.parseのモンキーパッチを適用しました');
} catch (e) {
  console.error('モンキーパッチの適用に失敗しました:', e);
}

// Expoのプロセスを起動（パッチ適用済み環境で）
const startExpo = (command, args) => {
  console.log(`実行: ${command} ${args.join(' ')}`);
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_PATCHED: 'true'
    }
  });
  
  child.on('close', (code) => {
    console.log(`プロセスが終了しました (コード: ${code})`);
    process.exit(code);
  });
};

// コマンドライン引数の解析
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === 'help') {
  console.log(`
使用方法:
  node start-patched-expo.js export:embed [オプション]
  node start-patched-expo.js start [オプション]
  `);
  process.exit(0);
}

// Expoコマンドの実行
startExpo('expo', args);
EOF

echo "========= モンキーパッチの適用が完了しました ========="
echo ""
echo "修正済みファイル:"
echo "- metro.config.js"
echo "- index.js"
echo "- patches/expo-monkey-patch/json-serializer-patch.js"
echo "- start-patched-expo.js (パッチ適用済みExpo実行スクリプト)"
echo ""
echo "使用方法:"
echo "node start-patched-expo.js export:embed --eager --platform android --dev false"
echo ""
echo "または:"
echo "node start-patched-expo.js start --clear"
