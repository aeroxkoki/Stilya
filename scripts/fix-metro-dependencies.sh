#!/bin/bash
# fix-metro-dependencies.sh
# Metro と Babel の依存関係を修正するスクリプト

echo "🔧 Metro/Babel 依存関係の修正を開始します..."

# パッケージの固定バージョンをインストール
echo "📦 Metro 関連パッケージのインストール..."
npm install --save-dev metro@0.76.8 metro-config@0.76.8 @expo/metro-config@0.20.14

# Babel ランタイムの設定
echo "📦 Babel ランタイムの設定..."
npm install --save @babel/runtime@7.27.1
npm install --save-dev babel-preset-expo@13.0.0

# パッケージエクスポートフィールド対応
echo "📦 Metro resolver 設定の追加..."
if [ -f metro.config.js ]; then
  # 既存のmetro.config.jsにpackageExportsの設定を追加
  if ! grep -q "unstable_enablePackageExports" metro.config.js; then
    echo "Metro config に packageExports 設定を追加します"
    sed -i'' -e '/const config = getDefaultConfig/a\\n// パッケージエクスポートフィールド対応（問題が発生する場合のオプトアウト用）\nif (config.resolver) {\n  config.resolver.unstable_enablePackageExports = false;\n}' metro.config.js
  fi
fi

# 依存関係の重複を解消
echo "🧹 依存関係の重複を解消..."
npm dedupe

# 既存のMetroキャッシュをクリア
echo "🧹 キャッシュを削除..."
rm -rf node_modules/.cache
rm -rf .expo/cache
rm -rf .metro-cache

# CI環境のヒープメモリ増加 (GitHub Actionsで役立つ)
if [ -n "$CI" ]; then
  echo "🔄 CI環境用の設定を適用..."
  export NODE_OPTIONS="--max-old-space-size=4096"
fi

echo "✅ 修正完了！expo start で動作確認してください。"
