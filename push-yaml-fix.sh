#!/bin/bash
# YAML構文エラー修正をGitHubにプッシュするスクリプト

echo "📝 YAML構文エラー修正をコミットします..."

# ブランチ確認
current_branch=$(git branch --show-current)
echo "🔍 現在のブランチ: $current_branch"

# 変更をステージングエリアに追加
git add .github/workflows/build.yml

# コミット
git commit -m "fix: GitHub Actionsワークフローのヒアドキュメント構文エラーを修正"

# GitHubにプッシュ
echo "🚀 GitHubにプッシュします..."
git push origin $current_branch

echo "✅ 完了しました！"
