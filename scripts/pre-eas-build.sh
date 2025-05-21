#!/bin/bash
# Expo/EASビルド前の準備スクリプト

echo "📋 Running pre-build preparation for EAS/Expo..."

# 作業ディレクトリの確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 環境変数の設定
export NODE_ENV=production
export EAS_NO_VCS=1
export EXPO_NO_CACHE=true

# キャッシュクリア
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache || true
rm -rf .expo/cache || true
rm -rf .metro-cache || true

# Metroの依存関係を修正
echo "🔧 Fixing Metro dependencies..."
bash "$SCRIPT_DIR/fix-metro-dependencies.sh"

# app.json を確認
echo "📝 Checking app.json..."
if [ -f app.json ]; then
  # jsEngine を確認
  if ! grep -q "jsEngine.*hermes" app.json; then
    echo "⚠️ Adding jsEngine: 'hermes' to app.json..."
    # jsEngineを追加するためのバックアップ作成と更新
    cp app.json app.json.bak
    node -e '
    const fs = require("fs");
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    if (!appJson.expo.jsEngine) {
      appJson.expo.jsEngine = "hermes";
      fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
      console.log("✅ Added jsEngine: \"hermes\" to app.json");
    }
    '
  else
    echo "✅ jsEngine: 'hermes' is already set in app.json"
  fi
fi

# npm scriptの確認
echo "📝 Check for required npm scripts..."
if ! grep -q "\"fix-metro\"" package.json; then
  echo "⚠️ Adding fix-metro script to package.json..."
  cp package.json package.json.bak
  node -e '
  const fs = require("fs");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (!pkg.scripts["fix-metro"]) {
    pkg.scripts["fix-metro"] = "bash ./scripts/fix-metro-dependencies.sh";
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    console.log("✅ Added fix-metro script to package.json");
  }
  '
else
  echo "✅ fix-metro script exists in package.json"
fi

# credentials.json の確認
if [ ! -f credentials.json ]; then
  echo "⚠️ credentials.json not found, running create-dummy-keystore.sh..."
  bash "$SCRIPT_DIR/create-dummy-keystore.sh"
else
  echo "✅ credentials.json exists"
fi

# Android ディレクトリが存在するか確認
if [ ! -d android ]; then
  echo "📱 Generating Android native code..."
  npx expo prebuild --platform android --clean
else
  echo "✅ Android directory exists"
fi

# gradlew の実行権限確認
if [ -f android/gradlew ]; then
  echo "🔧 Setting gradlew executable..."
  chmod +x android/gradlew
  echo "✅ gradlew set as executable"
else
  echo "⚠️ android/gradlew not found"
fi

echo "🔄 Pre-build preparation completed"
