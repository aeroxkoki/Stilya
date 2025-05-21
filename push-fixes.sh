#!/bin/bash
# Stilyaアプリの修正をGitHubにプッシュするスクリプト

echo "📝 変更をコミットします..."

# ブランチ確認
current_branch=$(git branch --show-current)
echo "🔍 現在のブランチ: $current_branch"

# 変更をステージングエリアに追加
git add fix-dependencies.sh
git add package.json
git add .github/workflows/build.yml

# コミット
git commit -m "fix: 依存関係エラー修正とビルドプロセスの最適化"

# GitHubにプッシュ
echo "🚀 GitHubにプッシュします..."
git push origin $current_branch

echo "✅ 完了しました！"
