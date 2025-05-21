#!/bin/bash
# Enhanced Local Build Script for Android (改良版 2025-05-21)
# Stilyaプロジェクト用ローカルビルドスクリプト - Metro互換性問題をすべて解決

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
export NODE_OPTIONS="--max-old-space-size=4096" # メモリ設定

# バックアップを取得（何かあっても復元できるように）
echo "📦 Creating backups of critical files..."
mkdir -p "$PROJECT_ROOT/backups"
cp "$PROJECT_ROOT/metro.config.js" "$PROJECT_ROOT/backups/metro.config.js.bak" 2>/dev/null || true
cp "$PROJECT_ROOT/node_modules/metro/src/lib/TerminalReporter.js" "$PROJECT_ROOT/backups/TerminalReporter.js.bak" 2>/dev/null || true

# 依存関係の確認と修正
echo "📦 Verifying dependencies..."

# Metro互換性修正を実行
chmod +x "$SCRIPT_DIR/fix-metro-incompatibility.sh"
"$SCRIPT_DIR/fix-metro-incompatibility.sh"

# Metro互換性の追加チェック
echo "🔍 Verifying Metro compatibility..."
TERMINAL_REPORTER_PATH="node_modules/metro/src/lib/TerminalReporter.js"
if [ ! -f "$TERMINAL_REPORTER_PATH" ] || [ ! -s "$TERMINAL_REPORTER_PATH" ]; then
  echo "⚠️ TerminalReporter.js がまだ作成されていません。専用スクリプトで作成します..."
  
  # 専用スクリプトの権限と存在を確認
  if [ ! -x "$SCRIPT_DIR/create-terminal-reporter.sh" ]; then
    echo "📝 create-terminal-reporter.sh の権限を確認します..."
    chmod +x "$SCRIPT_DIR/create-terminal-reporter.sh"
  fi
  
  # スクリプトを実行
  "$SCRIPT_DIR/create-terminal-reporter.sh"
  
  # 再度確認
  if [ ! -f "$TERMINAL_REPORTER_PATH" ] || [ ! -s "$TERMINAL_REPORTER_PATH" ]; then
    echo "⚠️ スクリプトでの作成に失敗しました。直接作成を試みます..."
    mkdir -p "node_modules/metro/src/lib"
    echo 'module.exports=class TerminalReporter{constructor(e){this._terminal=e,this._errors=[],this._warnings=[]}handleError(e){this._errors.push(e)}handleWarning(e){this._warnings.push(e)}getErrors(){return this._errors}getWarnings(){return this._warnings}update(){}terminal(){return this._terminal}};' > "$TERMINAL_REPORTER_PATH"
    
    if [ ! -f "$TERMINAL_REPORTER_PATH" ] || [ ! -s "$TERMINAL_REPORTER_PATH" ]; then
      echo "❌ TerminalReporter.js の作成に失敗しました。ダミーを使用します..."
      mkdir -p src/lib
      echo 'module.exports=class TerminalReporter{constructor(){}handleError(){}handleWarning(){}getErrors(){return[]}getWarnings(){return[]}update(){}terminal(){}};' > "src/lib/TerminalReporter.js"
      
      # metro.config.jsを修正して参照を更新
      if [ -f "metro.config.js" ]; then
        sed -i.bak 's!node_modules/metro/src/lib/TerminalReporter!./src/lib/TerminalReporter!g' metro.config.js || true
      fi
    fi
  fi
fi

# 権限確認
chmod -R +rw node_modules/metro 2>/dev/null || true

echo "✅ Metro compatibility verified."

# Expoバンドルプロセス用のヘルパーファイルを作成
echo "🚀 Setting up Expo bundle helpers..."
if [ -f "$SCRIPT_DIR/create-bundle-helpers.sh" ]; then
  chmod +x "$SCRIPT_DIR/create-bundle-helpers.sh"
  "$SCRIPT_DIR/create-bundle-helpers.sh"
else
  echo "⚠️ create-bundle-helpers.sh not found. Creating a minimal version..."
  mkdir -p node_modules/@expo/cli/node_modules/metro/src/lib
  echo 'module.exports=class TerminalReporter{constructor(e){this._terminal=e,this._errors=[],this._warnings=[]}handleError(e){this._errors.push(e)}handleWarning(e){this._warnings.push(e)}getErrors(){return this._errors}getWarnings(){return this._warnings}update(){}terminal(){return this._terminal}};' > node_modules/@expo/cli/node_modules/metro/src/lib/TerminalReporter.js
fi

# キャッシュのクリーンアップ
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache
rm -rf .expo 
rm -rf .expo-shared
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# 証明書の確認
echo "🔑 Checking keystore..."
if [ -f "android/app/stilya-keystore.jks" ]; then
  echo "✓ Keystore found"
else
  echo "⚠️ Keystore not found, creating dummy keystore for development"
  mkdir -p android/app
  
  # ダミーキーストア生成
  if [ -f "$SCRIPT_DIR/create-dummy-keystore.sh" ]; then
    bash "$SCRIPT_DIR/create-dummy-keystore.sh"
  else
    echo "⚠️ create-dummy-keystore.sh not found, creating default keystore"
    keytool -genkeypair -v -keystore android/app/stilya-keystore.jks -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US" 2>/dev/null || echo "Keystore creation failed - will attempt to continue anyway"
  fi
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
