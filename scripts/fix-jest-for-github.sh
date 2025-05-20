#!/bin/bash

# Expo/React Native テスト環境修正スクリプト
# GitHub Actions 環境で Jest が正常に動作するようにするためのスクリプト
# 作成日: 2025-05-20

echo "Stilya テスト環境修正スクリプトを実行します"

# @babel/runtime の正しいバージョンを確保
echo "1. @babel/runtime の依存関係を確認・修正"
npm install --no-save @babel/runtime@7.27.1
npm install --no-save @babel/plugin-transform-runtime@7.27.1
npm dedupe @babel/runtime

# 必要なディレクトリが存在するか確認
if [ ! -d "src/__mocks__" ]; then
  echo "モックディレクトリが見つかりません。作成します..."
  mkdir -p src/__mocks__
fi

# テスト結果保存用ディレクトリ
if [ ! -d "test-results" ]; then
  echo "テスト結果ディレクトリを作成します..."
  mkdir -p test-results
fi

# Nodeのバージョン確認
echo "2. Node.jsのバージョンを確認"
node -v

# ディスクキャッシュのクリア
echo "3. メトロキャッシュとノードモジュールキャッシュをクリア"
rm -rf node_modules/.cache
rm -rf .expo/cache
rm -rf .metro-cache

# 環境変数設定
echo "4. テスト用環境変数を設定"
export NODE_OPTIONS="--no-warnings --experimental-vm-modules"
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export METRO_CONFIG_FIX=true
export EXPO_USE_NATIVE_MODULES=false
export RCT_NEW_ARCH_ENABLED=false

echo "環境変数が設定されました: NODE_OPTIONS=$NODE_OPTIONS"

echo "テスト環境修正完了。Jestテストを実行できます。"
exit 0
