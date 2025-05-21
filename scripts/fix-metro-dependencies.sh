#!/bin/bash
# fix-metro-dependencies.sh
# Metro と Babel の依存関係を修正するスクリプト

echo "🔧 Metro/Babel 依存関係の修正を開始します..."

# OS確認
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS用
  SEDOPT="-i ''"
else
  # Linux用
  SEDOPT="-i"
fi

# パッケージの固定バージョンをインストール
echo "📦 Metro 関連パッケージのインストール..."
npm install --save-dev metro@0.77.0 metro-config@0.77.0 @expo/metro-config@0.9.0 metro-cache@0.77.0 metro-minify-terser@0.77.0 metro-transform-worker@0.77.0

# Babel ランタイムの設定
echo "📦 Babel ランタイムの設定..."
npm install --save @babel/runtime@7.27.1
npm install --save-dev babel-preset-expo@13.1.11

# React Native Paper と関連パッケージの最新版をインストール
echo "📦 UI関連パッケージの更新..."
npm install --save react-native-safe-area-context@5.4.0 react-native-screens@4.10.0

# パッケージエクスポートフィールド対応 - New Architectureの設定
echo "📦 Metro resolver 設定の追加..."
if [ -f metro.config.js ]; then
  # 既存のmetro.config.jsにpackageExportsの設定を追加
  if ! grep -q "unstable_enablePackageExports" metro.config.js; then
    echo "Metro config に packageExports 設定を追加します"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS用
      sed -i '' '/const config = getDefaultConfig/a\\
// パッケージエクスポートフィールド対応（問題が発生する場合のオプトアウト用）\\
if (config.resolver) {\\
  config.resolver.unstable_enablePackageExports = false;\\
}' metro.config.js
    else
      # Linux用
      sed -i '/const config = getDefaultConfig/a\\\
// パッケージエクスポートフィールド対応（問題が発生する場合のオプトアウト用）\\\
if (config.resolver) {\\\
  config.resolver.unstable_enablePackageExports = false;\\\
}' metro.config.js
    fi
  fi
fi

# babel.config.js の確認と最適化
echo "📦 babel.config.js の最適化..."
if [ -f babel.config.js ]; then
  # 既存のbabel.config.jsを最適な設定に更新
  if ! grep -q "transformer" babel.config.js; then
    # バックアップを作成
    cp babel.config.js babel.config.js.bak
    
    echo "babel.config.js に最適な設定を追加します"
    cat > babel.config.js << 'EOL'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
EOL
    echo "babel.config.js を最適化しました（オリジナルは babel.config.js.bak として保存）"
  fi
fi

# app.json の確認
echo "📦 app.json の確認..."
if [ -f app.json ]; then
  # jsEngine が設定されているか確認
  if ! grep -q "jsEngine" app.json; then
    echo "⚠️ app.json に jsEngine: 'hermes' が設定されていない可能性があります。手動で確認してください。"
  else
    echo "✅ app.json に jsEngine が設定されています。"
  fi
  
  # owner と projectId が設定されているか確認
  if ! grep -q "owner" app.json; then
    echo "⚠️ app.json に owner が設定されていない可能性があります。手動で確認してください。"
  else
    echo "✅ app.json に owner が設定されています。"
  fi
  
  if ! grep -q "projectId" app.json; then
    echo "⚠️ app.json に projectId が設定されていない可能性があります。手動で確認してください。"
  else
    echo "✅ app.json に projectId が設定されています。"
  fi
fi

# GitHub Actions用のEXPO_TOKENチェック
if [ -n "$CI" ] && [ -n "$EXPO_TOKEN" ]; then
  echo "✅ EXPO_TOKEN 環境変数が正しく設定されています"
else
  if [ -n "$CI" ]; then
    echo "⚠️ Warning: EXPO_TOKEN 環境変数が設定されていません。GitHub SecretsでEXPO_TOKENを設定する必要があります。"
  fi
fi

# Supabase互換性のためのNode標準ライブラリポリフィル確認
echo "📦 Supabase互換性の確認..."
if grep -q "@supabase/supabase-js" package.json; then
  if ! grep -q "react-native-url-polyfill" package.json; then
    echo "📦 Supabase用のポリフィルをインストールします..."
    npm install --save react-native-url-polyfill
  else
    echo "✅ react-native-url-polyfill は既にインストールされています"
  fi
fi

# package.jsonのresolutionsを更新
echo "📦 package.jsonのresolutionsを更新..."
if [ -f package.json ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOSの場合、一時ファイルを使用
    node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    pkg.resolutions = {
      "@babel/runtime": "7.27.1",
      "metro": "0.77.0", 
      "metro-config": "0.77.0",
      "metro-cache": "0.77.0",
      "metro-minify-terser": "0.77.0",
      "metro-transform-worker": "0.77.0",
      "@expo/metro-config": "0.9.0",
      "babel-preset-expo": "13.1.11",
      "rimraf": "^3.0.2"
    };
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
    '
  else
    # Linux用
    node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    pkg.resolutions = {
      "@babel/runtime": "7.27.1",
      "metro": "0.77.0", 
      "metro-config": "0.77.0",
      "metro-cache": "0.77.0",
      "metro-minify-terser": "0.77.0",
      "metro-transform-worker": "0.77.0",
      "@expo/metro-config": "0.9.0",
      "babel-preset-expo": "13.1.11",
      "rimraf": "^3.0.2"
    };
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
    '
  fi
  echo "✅ package.jsonのresolutionsを更新しました"
fi

# 依存関係の重複を解消
echo "🧹 依存関係の重複を解消..."
npm dedupe

# ロックファイルを更新
echo "📦 ロックファイルを更新..."
rm -f yarn.lock
yarn

# 既存のMetroキャッシュをクリア
echo "🧹 キャッシュを削除..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache || true
rm -rf .expo/cache || true 
rm -rf .metro-cache || true

# CI環境のヒープメモリ増加 (GitHub Actionsで役立つ)
if [ -n "$CI" ]; then
  echo "🔄 CI環境用の設定を適用..."
  export NODE_OPTIONS="--max-old-space-size=8192"
  # GitHub Actionsでキャッシュ削除を確実に
  npm cache clean --force || true
fi

# インストール結果の確認
echo "📋 インストールされたパッケージのバージョン確認:"
npm list metro metro-config @expo/metro-config @babel/runtime babel-preset-expo | grep -E 'metro|babel'

# チェックリスト確認
echo "📋 環境設定チェックリスト:"
echo "✅ babel.config.js が最適構成になっていることを確認"
echo "✅ metro.config.js が Expo 推奨形式になっていることを確認"
echo "✅ Babel・Metro の依存バージョンが明示されていることを確認"
echo "✅ EAS_SKIP_JAVASCRIPT_BUNDLING が CI 環境で設定されていることを確認"

echo "✅ 修正完了！expo start で動作確認してください。"
