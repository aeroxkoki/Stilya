#!/bin/bash

# EAS プロジェクト初期化スクリプト
echo "🚀 Initializing EAS project for Stilya..."

# 必要なパッケージが入っているか確認
if ! command -v npx &> /dev/null; then
  echo "❌ npx not found. Please install Node.js and npm first."
  exit 1
fi

# Expo CLI のインストール
echo "📦 Installing/Updating Expo CLI..."
npm install -g expo-cli

# EAS CLI のインストール (指定バージョンに合わせる)
echo "📦 Installing EAS CLI version 16.6.1..."
npm install -g eas-cli@16.6.1

# 作業ディレクトリに移動
cd "$(dirname "$0")"

# 依存関係のインストール
echo "📦 Installing project dependencies..."
npm install

# EAS の設定を確認
echo "🔍 Checking EAS configuration..."
npx eas-cli config --check

# EAS にログイン（必要な場合）
echo "🔑 Logging in to EAS (if needed)..."
npx eas-cli login

# EAS プロジェクトのセットアップ
echo "🏗️ Setting up EAS project..."
npx eas-cli project:init

# 初期ビルドプロファイルの確認
echo "✅ EAS setup complete! You can now build your app using:"
echo "npx eas-cli build --platform android --profile ci"

echo ""
echo "💡 Make sure to add your EXPO_TOKEN to GitHub repository secrets"
echo "for GitHub Actions workflow to work properly."
