#!/bin/bash
# push-eas-fixes.sh - EAS設定修正内容をGitHubにプッシュ

echo "📋 変更されたファイルを確認しています..."
git status

echo "📦 変更をステージングします..."
git add .

echo "💾 変更をコミットします..."
git commit -m "Fix: EAS GitHub Actions設定を修正"

echo "🚀 GitHubにプッシュします..."
git push

echo "✅ 完了しました。GitHub Actionsダッシュボードでビルドの実行を確認してください。"
echo "   https://github.com/aeroxkoki/Stilya/actions"
