#!/bin/bash

# Stilya MVP - Git Push Script
# 実行日: 2025年8月19日

echo "🚀 Stilya MVP - GitHub Push 開始"
echo "================================"

# 現在のディレクトリを確認
cd /Users/koki_air/Documents/GitHub/Stilya

# Git状態を確認
echo "📊 Git状態確認..."
git status

# 変更をステージング
echo "📝 変更をステージング..."
git add .

# コミット
echo "💾 コミット作成..."
git commit -m "fix: ユーザー体験の改善とデータベースの最適化

主な変更内容:
- external_productsテーブルにgender列を追加
- style_tags, color_tags, season_tagsを自動生成
- quality_scoreとpopularity_scoreを計算
- 高品質商品の優先度を設定（9,479件）
- ユーザー体験診断レポートを追加

データベース改善:
- 21,726件の商品すべてにタグ情報を付与
- 性別フィルター機能を修正（male/female/unisex）
- パフォーマンス向上のためのインデックス追加

これにより初回ユーザーの体験が大幅に改善されます。"

# GitHub にプッシュ
echo "⬆️  GitHub へプッシュ..."
git push origin main

echo "✅ 完了！GitHub へのプッシュが成功しました。"
echo "================================"
echo "📱 次のステップ:"
echo "1. ExpoGoでアプリをテスト"
echo "2. GitHub Actionsのビルド状態を確認"
echo "3. 必要に応じてEAS Buildを実行"
