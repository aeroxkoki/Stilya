#!/bin/bash
# 最終修正（@expo/metro-config緊急対応）をGitHubにプッシュするスクリプト

echo "📝 metro-config緊急対応をコミットします..."

# ブランチ確認
current_branch=$(git branch --show-current)
echo "🔍 現在のブランチ: $current_branch"

# 変更をステージングエリアに追加
git add .github/workflows/build.yml

# コミット
git commit -m "fix: @expo/metro-configの緊急インストール対応を追加"

# GitHubにプッシュ
echo "🚀 GitHubにプッシュします..."
git push origin $current_branch

echo "✅ 完了しました！"
