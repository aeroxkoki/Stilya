#!/bin/bash

echo "🔧 Stilya環境設定を本番環境向けに修正します..."

# プロジェクトルートに移動
cd "$(dirname "$0")/.." || exit 1

# .env.localファイルの削除（ローカルSupabaseは使用しない）
if [ -f .env.local ]; then
    echo "📁 .env.localを削除します..."
    rm .env.local
    echo "✅ .env.localを削除しました"
else
    echo "ℹ️  .env.localは既に存在しません"
fi

# .env.local.backupがある場合も削除
if [ -f .env.local.backup ]; then
    echo "📁 .env.local.backupを削除します..."
    rm .env.local.backup
    echo "✅ .env.local.backupを削除しました"
fi

# .envファイルの存在確認
if [ -f .env ]; then
    echo "✅ .envファイルが存在します"
    # Supabase URLの確認
    if grep -q "EXPO_PUBLIC_SUPABASE_URL=https://ycsydubuirflfuyqfshg.supabase.co" .env; then
        echo "✅ 正しいSupabase URLが設定されています"
    else
        echo "⚠️  警告: Supabase URLが正しく設定されていない可能性があります"
    fi
else
    echo "❌ エラー: .envファイルが見つかりません"
    exit 1
fi

# node_modulesのキャッシュクリア
echo "🧹 node_modulesのキャッシュをクリアします..."
rm -rf node_modules/.cache/

# Expoのキャッシュクリア
echo "🧹 Expoのキャッシュをクリアします..."
npx expo start --clear &
EXPO_PID=$!
sleep 5
kill $EXPO_PID 2>/dev/null || true

echo "✅ 環境設定の修正が完了しました！"
echo ""
echo "📱 次のステップ："
echo "1. 実機で開発ビルドアプリを開く"
echo "2. 以下のコマンドを実行："
echo "   npx expo start --dev-client"
echo "3. アプリでログイン機能をテスト"
echo ""
echo "⚠️  重要: ローカルSupabase (localhost) は使用しません"
echo "📍 使用するSupabase URL: https://ycsydubuirflfuyqfshg.supabase.co"
