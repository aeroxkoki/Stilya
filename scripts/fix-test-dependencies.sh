#!/bin/bash
# テスト実行環境の依存関係を確認・修正するスクリプト
# GitHub Actions用に最適化

echo "🧪 テスト環境のセットアップを開始します..."

# NPMのキャッシュクリア
echo "📦 NPMキャッシュをクリアします..."
npm cache clean --force

# 必要なBabel関連の依存関係をインストール
echo "🔍 Babel依存関係を確認しています..."
npm list @babel/preset-env || npm install --save-dev @babel/preset-env
npm list @babel/plugin-transform-modules-commonjs || npm install --save-dev @babel/plugin-transform-modules-commonjs
npm list @babel/plugin-transform-runtime || npm install --save-dev @babel/plugin-transform-runtime
npm list babel-plugin-module-resolver || npm install --save-dev babel-plugin-module-resolver

# 必要なテスト関連依存関係をインストール
echo "🔍 Jest依存関係を確認しています..."
npm list jest-expo || npm install --save-dev jest-expo
npm list @jest/globals || npm install --save-dev @jest/globals
npm list jest-environment-node || npm install --save-dev jest-environment-node

# Expoテスト環境セットアップ
echo "🔄 Expoテスト設定を更新しています..."
if [ -f "./jest.setup.js" ]; then
  echo "✅ jest.setup.js が既に存在します"
else
  echo "⚠️ jest.setup.js が見つかりません。新規作成します。"
  cp -f ./src/__tests__/setup.js ./jest.setup.js
fi

# モック関連ディレクトリの確認
if [ ! -d "./src/__mocks__" ]; then
  echo "⚠️ モックディレクトリが見つかりません。作成します。"
  mkdir -p ./src/__mocks__
fi

echo "🎉 セットアップが完了しました！"
echo "npm test を実行してテストを開始できます。"
