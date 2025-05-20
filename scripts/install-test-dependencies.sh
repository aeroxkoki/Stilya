#\!/bin/bash
# テスト依存関係をインストールするスクリプト
# Expo SDK 53 / React Native 0.79用
# 最終更新: 2025-05-21

set -e
echo "📦 テスト依存関係のインストールを開始します..."

# 必須のBabel関連の依存関係
npm install --save-dev @babel/preset-env @babel/plugin-transform-modules-commonjs babel-plugin-module-resolver babel-plugin-transform-react-jsx

# Jest関連の依存関係
npm install --save-dev jest-environment-node @jest/globals jest-junit

# ESモジュール互換問題を修正
npm install --save @babel/runtime@7.27.1
npm dedupe @babel/runtime

echo "🎉 テスト依存関係のインストールが完了しました！"
