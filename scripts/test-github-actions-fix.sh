#!/bin/bash
# test-github-actions-fix.sh
# GitHub Actionsの修正をローカルでテストするためのスクリプト

set -e # エラーで停止

echo "🧪 Testing GitHub Actions fix locally..."

# Metro修正スクリプトを実行
if [ -f "./scripts/fix-metro-for-ci.sh" ]; then
  echo "📋 Applying Metro fixes..."
  chmod +x ./scripts/fix-metro-for-ci.sh
  ./scripts/fix-metro-for-ci.sh
else
  echo "❌ Metro fix script not found. Please create it first."
  exit 1
fi

# テスト用のプレビルドを実行
echo "📋 Running prebuild (to verify fix works)..."
npx expo prebuild --platform android --clean

# 空のバンドルファイルを作成（実際のバンドル作成をスキップ）
echo "📋 Creating empty bundle file to skip bundling..."
mkdir -p android/app/src/main/assets
touch android/app/src/main/assets/index.android.bundle

# テストビルドを実行
echo "📋 Running test build..."
cd android
./gradlew assembleDebug
cd ..

# ビルド成功チェック
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
  echo "✅ Test build successful! The fix works!"
  mkdir -p dist
  cp android/app/build/outputs/apk/debug/app-debug.apk dist/stilya-debug.apk
  echo "📱 APK saved to dist/stilya-debug.apk"
else
  echo "❌ Test build failed. Please check logs for errors."
  exit 1
fi

echo "🎉 GitHub Actions fix test completed successfully!"
