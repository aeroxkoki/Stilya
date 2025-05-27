#!/bin/bash

# Stilya - MVP開発コミットスクリプト

echo "📦 Stilya MVP - Gitコミット準備"
echo "================================"

# 現在のブランチを確認
current_branch=$(git branch --show-current)
echo "🌿 現在のブランチ: $current_branch"

# 変更状態を確認
echo ""
echo "📝 変更されたファイル:"
git status --short

# コミットメッセージを入力
echo ""
echo "💬 コミットメッセージを入力してください:"
echo "  例: feat: iOS開発環境の整備"
echo "  例: fix: 環境変数の修正"
echo "  例: docs: README更新"
read -p "> " commit_message

if [ -z "$commit_message" ]; then
    echo "❌ コミットメッセージが入力されていません"
    exit 1
fi

# 変更をステージング
echo ""
echo "📤 変更をステージング中..."
git add .

# コミット
echo "💾 コミット中..."
git commit -m "$commit_message"

# プッシュするか確認
echo ""
read -p "🚀 GitHubにプッシュしますか？ (y/n): " push_confirm

if [ "$push_confirm" = "y" ] || [ "$push_confirm" = "Y" ]; then
    echo "🌐 GitHubにプッシュ中..."
    git push origin "$current_branch"
    echo "✅ プッシュ完了！"
    echo ""
    echo "🔗 GitHub: https://github.com/aeroxkoki/Stilya"
else
    echo "⏸️  プッシュをスキップしました"
    echo "💡 後でプッシュする場合: git push origin $current_branch"
fi

echo ""
echo "================================"
echo "✨ 完了しました！"
