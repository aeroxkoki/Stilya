#!/bin/bash
# fix-metro-dependencies.sh
# Metro と Babel の依存関係を修正するスクリプト

echo "🔧 Metro/Babel 依存関係の修正を開始します..."

# パッケージの固定バージョンをインストール
echo "📦 Metro 関連パッケージのインストール..."
npm install --save-dev metro@0.76.8 metro-config@0.76.8 metro-minify-terser@0.76.8 @expo/metro-config@0.20.14

# Reactネイティブ環境のMetroパッケージをパッチ
echo "🩹 React Native環境のMetroパッチ適用..."
if [ -d "node_modules/@react-native" ]; then
  mkdir -p node_modules/@react-native/community-cli-plugin/node_modules
  cp -r node_modules/metro node_modules/@react-native/community-cli-plugin/node_modules/
  cp -r node_modules/metro-config node_modules/@react-native/community-cli-plugin/node_modules/
  echo "✅ React Native環境にMetroパッチを適用しました"
else
  echo "⚠️ @react-native ディレクトリが存在しないため、パッチをスキップします"
fi

# Babel ランタイムの設定
echo "📦 Babel ランタイムの設定..."
npm install --save @babel/runtime@7.27.1
npm install --save-dev @babel/core@^7.24.0 babel-preset-expo@~13.0.0

# 依存関係の重複を解消
echo "🧹 依存関係の重複を解消..."
npm dedupe

# キャッシュクリア
echo "🧹 キャッシュを削除..."
rm -rf node_modules/.cache
rm -rf .expo/cache
rm -rf .metro-cache

echo "✅ 修正完了！yarn start で動作確認してください。"
