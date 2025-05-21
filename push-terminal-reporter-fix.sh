#!/bin/bash
# TerminalReporter.js修正をGitHubにプッシュするスクリプト

echo "📝 TerminalReporter.js修正をコミットします..."

# ブランチ確認
current_branch=$(git branch --show-current)
echo "🔍 現在のブランチ: $current_branch"

# 変更をステージングエリアに追加
git add .github/workflows/build.yml

# コミット
git commit -m "fix: TerminalReporter.js作成プロセスを改善・強化"

# GitHubにプッシュ
echo "🚀 GitHubにプッシュします..."
git push origin $current_branch

echo "✅ 完了しました！"
