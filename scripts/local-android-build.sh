#!/bin/bash
# Local Build Script for Android (EAS回避策)
# Stilyaプロジェクト用ローカルビルドスクリプト - 最適化版

echo "🚀 Starting enhanced local Android build process for Stilya..."

# 作業ディレクトリの確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 環境変数の設定
export EXPO_NO_CACHE=true
export EAS_NO_VCS=1
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export CI=false # ローカルビルドなのでCIフラグはオフに
export NODE_ENV=production

# 依存関係の確認と修正
echo "📦 Verifying dependencies..."
npm run fix-metro

# キャッシュのクリーンアップ
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache
rm -rf .expo 
rm -rf .expo-shared

# 証明書の確認
echo "🔑 Checking keystore..."
if [ -f "android/app/stilya-keystore.jks" ]; then
  echo "✓ Keystore found"
else
  echo "⚠️ Keystore not found, creating dummy keystore for development"
  mkdir -p android/app
  bash "$SCRIPT_DIR/create-dummy-keystore.sh"
fi

# credentials.jsonの確認
if [ ! -f "credentials.json" ]; then
  echo "⚠️ credentials.json not found, creating..."
  echo '{
    "android": {
      "keystore": {
        "keystorePath": "android/app/stilya-keystore.jks",
        "keystorePassword": "android",
        "keyAlias": "androiddebugkey",
        "keyPassword": "android"
      }
    }
  }' > credentials.json
  echo "✓ Created credentials.json with default dev values"
fi

# Expoプロジェクトの準備
echo "🔧 Preparing Expo project..."
npx expo prebuild --clean --platform android

# ビルドディレクトリに移動
cd android

# Gradleビルドの実行
echo "🏗️ Running Gradle build..."
# gradlewの存在確認
if [ ! -f "./gradlew" ]; then
  echo "⚠️ gradlew が見つかりません。権限を確認します..."
  chmod +x "./gradlew" 2>/dev/null || echo "gradlewファイルが存在しません"
  
  if [ ! -f "./gradlew" ]; then
    echo "🔄 gradlew が見つからないため、作成します..."
    touch ./gradlew
    chmod +x ./gradlew
    echo '#!/bin/bash
exec ./gradlew.bat "$@"' > ./gradlew
  fi
fi

# Gradleビルドの実行
echo "🏗️ gradlew で APK をビルドします..."
chmod +x ./gradlew
./gradlew assembleRelease

# ビルド結果の確認
if [ $? -eq 0 ]; then
  APK_PATH="$PROJECT_ROOT/android/app/build/outputs/apk/release/app-release.apk"
  
  if [ -f "$APK_PATH" ]; then
    echo "✅ Build successful! APK generated at:"
    echo "$APK_PATH"
    
    # ファイルサイズの表示
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 APK size: $APK_SIZE"
    
    # プロジェクトルートにコピー
    cp "$APK_PATH" "$PROJECT_ROOT/stilya-release.apk"
    echo "📱 APK copied to project root as stilya-release.apk"
  else
    echo "❌ Build seemed to succeed, but APK not found at expected location."
  fi
else
  echo "❌ Build failed. Check the logs above for errors."
  exit 1
fi

echo "🎉 Local build process completed!"
