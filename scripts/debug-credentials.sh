#!/bin/bash
# Stilya向け環境デバッグスクリプト

echo "🔍 Credentials & environment debug for Stilya"

# 作業ディレクトリの確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📂 Project root: $PROJECT_ROOT"

# 環境変数の確認
echo "🔧 Environment variables:"
echo "  NODE_ENV: ${NODE_ENV:-'not set'}"
echo "  CI: ${CI:-'not set'}"
echo "  EXPO_TOKEN: ${EXPO_TOKEN:+'set'}"
echo "  ANDROID_KEYSTORE_BASE64: ${ANDROID_KEYSTORE_BASE64:+'set'}"
echo "  EAS_SKIP_JAVASCRIPT_BUNDLING: ${EAS_SKIP_JAVASCRIPT_BUNDLING:-'not set'}"

# app.json の確認
if [ -f app.json ]; then
  echo "📃 app.json configuration:"
  echo "  jsEngine: $(grep -o 'jsEngine.*' app.json || echo 'not set')"
  echo "  owner: $(grep -o 'owner.*' app.json || echo 'not set')"
  echo "  projectId: $(grep -o 'projectId.*' app.json || echo 'not set')"
else
  echo "❌ app.json not found!"
fi

# credentials.json の確認
if [ -f credentials.json ]; then
  echo "📃 credentials.json exists:"
  # パスワードを表示せずにファイルの内容を確認
  grep -v "Password" credentials.json | grep -v "password" || echo "  (Cannot display sensitive content)"
else
  echo "❌ credentials.json not found!"
fi

# Android キーストアの確認
KEYSTORE_PATH="android/app/stilya-keystore.jks"
if [ -f "$KEYSTORE_PATH" ]; then
  echo "🔐 Keystore exists at $KEYSTORE_PATH"
  ls -la "$KEYSTORE_PATH"
  
  # ファイルサイズを確認
  KEYSTORE_SIZE=$(du -h "$KEYSTORE_PATH" | cut -f1)
  echo "  Keystore size: $KEYSTORE_SIZE"
  
  # ファイルタイプの確認
  echo "  File type: $(file "$KEYSTORE_PATH" 2>/dev/null || echo "Cannot determine file type")"
else
  echo "❌ Keystore file not found at $KEYSTORE_PATH"
fi

# Android ディレクトリの確認
if [ -d android ]; then
  echo "📱 Android directory exists"
  
  # gradlew の確認
  if [ -f android/gradlew ]; then
    echo "  gradlew exists, permissions: $(ls -la android/gradlew | awk '{print $1}')"
    
    # 実行権限の確認と設定
    if [ ! -x android/gradlew ]; then
      echo "  Setting gradlew as executable..."
      chmod +x android/gradlew
    fi
  else
    echo "❌ android/gradlew not found"
  fi
  
  # build.gradle の確認
  if [ -f android/app/build.gradle ]; then
    echo "  build.gradle exists"
    echo "  Android config:"
    grep -E 'applicationId|versionCode|versionName|compileSdk|minSdk|targetSdk' android/app/build.gradle | sed 's/^/    /'
  else
    echo "❌ android/app/build.gradle not found"
  fi
else
  echo "❌ Android directory not found! Run 'npx expo prebuild' to generate native code."
fi

# eas.json の確認
if [ -f eas.json ]; then
  echo "📃 eas.json exists:"
  grep -E 'buildType|autoIncrement|runtimeVersion' eas.json | sed 's/^/  /'
else
  echo "❌ eas.json not found!"
fi

# Node.js と依存関係の確認
echo "🔧 Runtime versions:"
echo "  Node: $(node -v)"
echo "  npm: $(npm -v 2>/dev/null || echo 'not found')"
echo "  yarn: $(yarn -v 2>/dev/null || echo 'not found')"
echo "  eas-cli: $(npx eas-cli --version 2>/dev/null || echo 'not installed')"
echo "  expo-cli: $(npx expo --version 2>/dev/null || echo 'not installed')"

# 重要なパッケージバージョンの確認
echo "📦 Package versions:"
npm list expo react-native metro metro-config @expo/metro-config @babel/runtime babel-preset-expo 2>/dev/null | grep -E 'expo|react-native|metro|@babel/runtime|babel-preset-expo' | head -n 7 | sed 's/^/  /'

echo "✅ Debug check completed"
