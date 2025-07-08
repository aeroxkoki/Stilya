#!/bin/bash

# Git push スクリプト
echo "📦 GitHubへのプッシュを準備しています..."

# 現在のディレクトリを確認
cd /Users/koki_air/Documents/GitHub/Stilya

# 変更状態を確認
echo "📋 変更ファイルを確認中..."
git status

# 変更をステージング
echo "➕ 変更をステージング..."
git add .

# コミット
echo "💾 コミット中..."
git commit -m "feat: 推薦システムv2の実装完了とUUID型対応

- データベースマイグレーションをUUID型に修正
- 推薦システムv2のテーブル作成（user_preference_analysis, session_learning等）
- パフォーマンス最適化のインデックス追加
- A/Bテスト機能の統合
- セッション学習機能の実装
- テストスクリプトの作成
- 実装レポートの作成"

# プッシュ
echo "🚀 GitHubへプッシュ..."
git push origin main

echo "✅ 完了しました！"
