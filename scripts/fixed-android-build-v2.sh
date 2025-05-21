#!/bin/bash

# ========================================
# Stilya - MetroとReact Native互換性解決スクリプト (強化版)
# Expo SDK 53用 / 2025年5月
# ========================================

echo "🚀 Stilya Android Build Script - GitHub Actions互換 v2"
echo "------------------------------------------------"

# 環境変数設定
export NODE_ENV=production
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export EXPO_NO_CACHE=1

# 依存関係の修正
echo "📦 Metro依存関係を修正中..."
npm install --no-save @babel/runtime@7.27.1 @expo/metro-config@0.9.0 metro@0.77.0 metro-core@0.77.0 metro-runtime@0.77.0 metro-react-native-babel-transformer@0.77.0 metro-resolver@0.77.0 metro-source-map@0.77.0 metro-cache@0.77.0 babel-preset-expo@13.1.11

# メトロ環境の準備
echo "🔧 Metro互換性環境を準備中..."
chmod +x ./scripts/create-terminal-reporter.sh
./scripts/create-terminal-reporter.sh

# Metro Core モジュール作成
echo "🔧 Metro Core モジュールを作成中..."
chmod +x ./scripts/create-metro-core.sh
./scripts/create-metro-core.sh

echo "🧹 キャッシュをクリーンアップ中..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# モジュール互換性の確認
echo "🔎 モジュール互換性を確認中..."
if [ ! -f "node_modules/metro/src/lib/TerminalReporter.js" ]; then
  echo "⚠️ TerminalReporter.js が見つかりません。再作成します..."
  mkdir -p node_modules/metro/src/lib
  chmod +x ./scripts/create-terminal-reporter.sh
  ./scripts/create-terminal-reporter.sh
fi

if [ ! -f "node_modules/metro-core/src/index.js" ]; then
  echo "⚠️ metro-core モジュールが見つかりません。再作成します..."
  chmod +x ./scripts/create-metro-core.sh
  ./scripts/create-metro-core.sh
fi

# リンクの確認と修正
if [ ! -d "node_modules/@expo/cli/node_modules/metro-core" ]; then
  echo "⚠️ @expo/cli からの metro-core リンクを修正中..."
  mkdir -p node_modules/@expo/cli/node_modules
  ln -sf ../../../node_modules/metro-core node_modules/@expo/cli/node_modules/metro-core
fi

# Androidビルドの準備
echo "🔨 プレビルド実行中..."
npx expo prebuild --platform android --clean

# バンドル環境の準備
echo "📱 バンドル環境準備中..."
mkdir -p android/app/src/main/assets
touch android/app/src/main/assets/index.android.bundle
echo "// Empty bundle for CI build - Skip JavaScript bundling mode" > android/app/src/main/assets/index.android.bundle

# Androidビルド実行
echo "📲 Androidビルド実行中..."
cd android
./gradlew --no-daemon assembleRelease
cd ..

# ビルド結果の確認
mkdir -p dist
find android/app/build/outputs -name "*.apk" -type f -exec cp {} dist/stilya-release.apk \;

if [ -f "dist/stilya-release.apk" ]; then
  echo "✅ ビルド成功!"
  ls -la dist/stilya-release.apk
  echo "📱 APKファイル: dist/stilya-release.apk"
else
  echo "❌ ビルド失敗"
  exit 1
fi

echo "🎉 ビルドプロセス完了"
