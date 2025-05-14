#!/bin/bash

# Stilya セットアップスクリプト
echo "🚀 Stilya アプリのセットアップを開始します..."

# 作業ディレクトリをプロジェクトルートに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 依存関係のインストール確認
echo "📦 依存関係をチェックしています..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules が存在します。スキップします。"
else
  echo "📦 npm install を実行します..."
  npm install
fi

# .env ファイルの確認
if [ -f ".env" ]; then
  echo "✅ .env ファイルが存在します。"
  # Supabase URL と APIキーが設定されているか確認
  if grep -q "SUPABASE_URL=https://ddypgpljprljqrblpuli.supabase.co" .env; then
    echo "✅ Supabase URL が設定されています。"
  else
    echo "⚠️ Supabase URL が設定されていないか異なります。"
    echo "  .env ファイルを確認してください。"
  fi
else
  echo "❌ .env ファイルが見つかりません。"
  echo "  .env.example をコピーして設定してください。"
fi

# Supabase セットアップ手順の表示
echo ""
echo "📋 Supabase セットアップ手順:"
echo "  1. https://app.supabase.com にログインします"
echo "  2. 'Stilya' プロジェクトを選択します"
echo "  3. 左側メニューから「SQL Editor」をクリックします"
echo "  4. 「New Query」ボタンをクリックします"
echo "  5. 以下のファイルの内容を順番にコピーして実行してください:"
echo "    - /Users/koki_air/Documents/GitHub/Stilya/supabase/migrations/20250512201534_create_product_tables.sql"
echo "    - /Users/koki_air/Documents/GitHub/Stilya/supabase/migrations/sample_products.sql"
echo ""

# アプリの起動
echo "🔍 テストモードで起動しますか？ (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "🧪 テストモードでアプリを起動します..."
  npm run start
else
  echo "🚀 通常モードでアプリを起動します..."
  npm run start
fi
