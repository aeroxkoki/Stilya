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
npm install --save-dev metro@0.76.8 metro-config@0.76.8 @expo/metro-config@0.20.14

# Babel ランタイムの設定
echo "📦 Babel ランタイムの設定..."
npm install --save @babel/runtime@7.27.1
npm install --save-dev babel-preset-expo@13.0.0

# React Native Paper と関連パッケージの最新版をインストール
echo "📦 UI関連パッケージの更新..."
npm install --save react-native-paper@5.12.3 react-native-safe-area-context@4.8.2 react-native-vector-icons@10.0.3

# パッケージエクスポートフィールド対応
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
      sed -i '/const config = getDefaultConfig/a\\\n// パッケージエクスポートフィールド対応（問題が発生する場合のオプトアウト用）\\\nif (config.resolver) {\\\n  config.resolver.unstable_enablePackageExports = false;\\\n}' metro.config.js
    fi
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

# 依存関係の重複を解消
echo "🧹 依存関係の重複を解消..."
npm dedupe

# 既存のMetroキャッシュをクリア
echo "🧹 キャッシュを削除..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache || true
rm -rf .expo/cache || true
rm -rf .metro-cache || true

# CI環境のヒープメモリ増加 (GitHub Actionsで役立つ)
if [ -n "$CI" ]; then
  echo "🔄 CI環境用の設定を適用..."
  export NODE_OPTIONS="--max-old-space-size=4096"
  # GitHub Actionsでキャッシュ削除を確実に
  npm cache clean --force || true
fi

# インストール結果の確認
echo "📋 インストールされたパッケージのバージョン確認:"
npm list metro metro-config @expo/metro-config @babel/runtime babel-preset-expo | grep -E 'metro|babel'

echo "✅ 修正完了！expo start で動作確認してください。"