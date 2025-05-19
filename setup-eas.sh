#!/bin/bash

# EAS プロジェクト初期化スクリプト
echo "🚀 初期化 / 更新: EAS プロジェクト (Stilya)"

# 必要なパッケージが入っているか確認
if ! command -v npx &> /dev/null; then
  echo "❌ npx が見つかりません。Node.js と npm をインストールしてください。"
  exit 1
fi

# Expo CLI のインストール
echo "📦 Expo CLI のインストール/更新..."
npm install -g expo-cli

# EAS CLI のインストール (プロジェクトの要件に合わせる)
echo "📦 EAS CLI のインストール (>=16.6.1)..."
npm install -g eas-cli@latest

# 作業ディレクトリに移動
cd "$(dirname "$0")"

# 依存関係のインストール
echo "📦 プロジェクト依存関係のインストール..."
npm install

# EAS の設定を確認
echo "🔍 EAS 設定を確認中..."
npx eas-cli config --check

# EAS にログイン（必要な場合）
echo "🔑 EAS にログイン (必要な場合)..."
npx eas-cli login

# EAS プロジェクトを確認
echo "🏗️ EAS プロジェクト確認中..."
npx eas-cli project:info || npx eas-cli project:init

# 既存のワークフローと調和させるための注意事項
echo ""
echo "✅ EAS セットアップ完了!"
echo ""
echo "注意:"
echo "1. プロジェクトには既にCI/CDが設定されています:"
echo "   - GitHub Actionsワークフロー: .github/workflows/build.yml"
echo ""
echo "2. EXPO_TOKENがGitHubリポジトリのSecretsに追加されていることを確認してください:"
echo "   - GitHub リポジトリの Settings > Secrets and Variables > Actions"
echo "   - 「EXPO_TOKEN」が存在することを確認するか追加"
echo "   - トークン取得: eas token:create --name github-actions --non-interactive"

