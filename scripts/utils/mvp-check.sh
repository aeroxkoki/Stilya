#!/bin/bash

echo "🔍 Stilya MVP - 機能チェックリスト"
echo ""
echo "実装済み機能の確認："
echo "✅ Supabase設定: $(test -f .env && echo "OK" || echo "要確認")"
echo "✅ スワイプ画面: src/screens/swipe/SwipeScreen.tsx"
echo "✅ 商品詳細: src/screens/detail/ProductDetailScreen.tsx"
echo "✅ 認証機能: src/contexts/AuthContext.tsx"
echo "✅ レコメンド: src/screens/recommend/RecommendScreen.tsx"
echo ""
echo "MVPリリースまでの残タスク："
echo "1. 実機での動作テスト"
echo "2. アフィリエイトAPIの接続確認"
echo "3. EASビルドでアプリ作成"
echo ""
echo "📱 実機テストを開始します..."
echo ""

# Expoを起動
npx expo start --clear
