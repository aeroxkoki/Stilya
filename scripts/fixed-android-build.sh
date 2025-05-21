#!/bin/bash

# ========================================
# Stilya - MetroとReact Native互換性解決スクリプト
# Expo SDK 53用 / 2025年5月
# ========================================

echo "🚀 Stilya Android Build Script - GitHub Actions互換"
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

echo "🧹 キャッシュをクリーンアップ中..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# Androidビルドの準備
echo "🔨 プレビルド実行中..."
npx expo prebuild --platform android --clean

# バンドル環境の準備
echo "📱 バンドル環境準備中..."
mkdir -p android/app/src/main/assets
touch android/app/src/main/assets/index.android.bundle
echo "// Empty bundle for CI build" > android/app/src/main/assets/index.android.bundle

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
