#!/bin/bash
# 最終的な問題対応をGitHubにプッシュするスクリプト

echo "📝 全ての修正をコミットします..."

# ブランチ確認
current_branch=$(git branch --show-current)
echo "🔍 現在のブランチ: $current_branch"

# 変更をステージングエリアに追加
git add .github/workflows/build.yml

# コミット
git commit -m "fix: GitHub Actionsのビルドプロセスを最適化し安定性を向上"

# GitHubにプッシュ
echo "🚀 GitHubにプッシュします..."
git push origin $current_branch

echo "✅ 完了しました！"
