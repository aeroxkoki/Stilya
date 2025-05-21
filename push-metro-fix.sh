#!/bin/bash
# 更新した依存関係修正スクリプトをGitHubにプッシュ

echo "📝 変更をコミットします..."

# ブランチ確認
current_branch=$(git branch --show-current)
echo "🔍 現在のブランチ: $current_branch"

# 変更をステージングエリアに追加
git add fix-metro-config.js
git add .github/workflows/build.yml

# コミット
git commit -m "fix: metro-config修正スクリプトの追加"

# GitHubにプッシュ
echo "🚀 GitHubにプッシュします..."
git push origin $current_branch

echo "✅ 完了しました！"
