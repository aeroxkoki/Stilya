#!/bin/bash

# ========================================
# Stilya - バンドルスキップ式デバッグビルドスクリプト
# Expo SDK 53用 - 最終版 / 2025年5月
# ========================================

echo "🚀 Stilya Android Debug Build Script - バンドルスキップ式"
echo "------------------------------------------------"

# 環境変数設定
export NODE_ENV=production
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export EXPO_NO_CACHE=1
export CI=true  # CI環境を模倣
export EXPO_NO_DOTENV=1  # .envファイルの読み込みをスキップ
export EXPO_NO_BUNDLE=1  # 追加のバンドルスキップフラグ
export EXPO_DEBUG=1      # デバッグモード有効化 

# 全環境変数をエクスポート
export SUPABASE_URL=""
export SUPABASE_ANON_KEY=""
export LINKSHARE_API_TOKEN=""
export LINKSHARE_MERCHANT_ID=""
export RAKUTEN_APP_ID=""
export RAKUTEN_AFFILIATE_ID=""

# 依存関係の修正
echo "📦 Metro依存関係を修正中..."
npm install --no-save @babel/runtime@7.27.1 @expo/metro-config@0.9.0 metro@0.77.0 metro-config@0.77.0 metro-core@0.77.0 metro-runtime@0.77.0 metro-react-native-babel-transformer@0.77.0 metro-resolver@0.77.0 metro-source-map@0.77.0 metro-cache@0.77.0 babel-preset-expo@13.1.11

# キャッシュクリア
echo "🧹 キャッシュをクリーンアップ中..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# 互換性環境セットアップ
echo "🔧 互換性環境をセットアップ中..."

# TerminalReporter モジュール作成
chmod +x ./scripts/create-terminal-reporter.sh
./scripts/create-terminal-reporter.sh

# Metro Core モジュール作成
chmod +x ./scripts/create-metro-core.sh
./scripts/create-metro-core.sh

# Metro Config モジュール作成
chmod +x ./scripts/create-metro-config.sh
./scripts/create-metro-config.sh

# 環境変数処理パッチ適用
chmod +x ./scripts/patch-env-module.sh
./scripts/patch-env-module.sh

# モジュール参照の確認
echo "🔎 モジュール参照を確認中..."
mkdir -p node_modules/@expo/cli/node_modules
ln -sf ../../../node_modules/metro-config node_modules/@expo/cli/node_modules/metro-config
ln -sf ../../../node_modules/metro-core node_modules/@expo/cli/node_modules/metro-core

# Androidビルドの準備
echo "🔨 プレビルド実行中 (--no-install)..."
npx expo prebuild --platform android --clean --no-install

# 空のバンドルを作成（Javascriptバンドリングを完全スキップするため）
echo "📱 空のバンドルを作成中..."
mkdir -p android/app/src/main/assets
touch android/app/src/main/assets/index.android.bundle
echo "// Empty bundle for debug build - Skip JavaScript bundling" > android/app/src/main/assets/index.android.bundle

# debugモードでAndroidビルドを実行（より高速でテスト用）
echo "📲 デバッグモードでAndroidビルド実行中..."
cd android
./gradlew --no-daemon assembleDebug
cd ..

# ビルド結果の確認
mkdir -p dist
find android/app/build/outputs -name "*.apk" -type f -exec cp {} dist/stilya-debug.apk \;

if [ -f "dist/stilya-debug.apk" ]; then
  echo "✅ ビルド成功!"
  ls -la dist/stilya-debug.apk
  echo "📱 APKファイル: dist/stilya-debug.apk"
else
  echo "❌ ビルド失敗"
  exit 1
fi

echo "🎉 デバッグビルドプロセス完了"