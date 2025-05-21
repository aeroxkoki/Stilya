#!/bin/bash
# Stilyaアプリの最終修正をGitHubにプッシュするスクリプト

echo "📝 最終的な修正をコミットします..."

# ブランチ確認
current_branch=$(git branch --show-current)
echo "🔍 現在のブランチ: $current_branch"

# 変更をステージングエリアに追加
git add .github/workflows/build.yml

# コミット
git commit -m "fix: GitHub Actions環境でのmetro-config依存関係問題を最終修正"

# GitHubにプッシュ
echo "🚀 GitHubにプッシュします..."
git push origin $current_branch

echo "✅ 完了しました！"
