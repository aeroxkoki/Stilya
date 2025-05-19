#!/bin/bash
# Local Build Script for Android (EAS回避策)
# Stilyaプロジェクト用ローカルビルドスクリプト

echo "🚀 Starting local Android build process for Stilya..."

# 作業ディレクトリの確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 環境変数の設定
export EXPO_NO_CACHE=true
export EAS_NO_VCS=1
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export CI=false # ローカルビルドなのでCIフラグはオフに

# 依存関係の確認と修正
echo "📦 Verifying dependencies..."
npm run fix-metro

# キャッシュのクリーンアップ
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# Expoプロジェクトの準備
echo "🔧 Preparing Expo project..."
npx expo prebuild --clean --platform android

# ビルドディレクトリに移動
cd android

# Gradleビルドの実行
echo "🏗️ Running Gradle build..."
if [ "$(uname)" == "Darwin" ]; then
  # macOS
  ./gradlew assembleDebug
else
  # Linux/Windows
  gradlew assembleDebug
fi

# ビルド結果の確認
if [ $? -eq 0 ]; then
  APK_PATH="$PROJECT_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
  
  if [ -f "$APK_PATH" ]; then
    echo "✅ Build successful! APK generated at:"
    echo "$APK_PATH"
    
    # ファイルサイズの表示
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 APK size: $APK_SIZE"
    
    # プロジェクトルートにコピー
    cp "$APK_PATH" "$PROJECT_ROOT/stilya-debug.apk"
    echo "📱 APK copied to project root as stilya-debug.apk"
  else
    echo "❌ Build seemed to succeed, but APK not found at expected location."
  fi
else
  echo "❌ Build failed. Check the logs above for errors."
  exit 1
fi

echo "🎉 Local build process completed!"
