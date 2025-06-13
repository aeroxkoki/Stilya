#!/bin/bash

# Stilya 開発環境セットアップスクリプト
# このスクリプトは開発環境の初期セットアップを自動化します

echo "🚀 Stilya 開発環境セットアップを開始します..."

# 1. 環境変数の確認
echo "📋 環境変数を確認中..."
if [ ! -f .env ]; then
    echo "❌ .envファイルが見つかりません"
    echo "📝 .env.exampleから.envファイルを作成してください："
    echo "   cp .env.example .env"
    echo "   その後、Supabaseの認証情報を設定してください"
    exit 1
fi

# 環境変数が設定されているか確認
source .env
if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ] || [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase環境変数が設定されていません"
    echo "📝 .envファイルに以下を設定してください："
    echo "   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url"
    echo "   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    exit 1
fi

echo "✅ 環境変数の設定を確認しました"

# 2. 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# 3. キャッシュのクリア
echo "🧹 キャッシュをクリア中..."
npx expo start --clear

# 4. Supabase接続テスト
echo "🔌 Supabase接続をテスト中..."
node -e "
const checkConnection = async () => {
  try {
    const response = await fetch('$EXPO_PUBLIC_SUPABASE_URL/rest/v1/', {
      headers: {
        'apikey': '$EXPO_PUBLIC_SUPABASE_ANON_KEY'
      }
    });
    if (response.ok) {
      console.log('✅ Supabase接続成功');
    } else {
      console.log('❌ Supabase接続失敗:', response.status);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Supabase接続エラー:', error.message);
    process.exit(1);
  }
};
checkConnection();
"

# 5. データベース初期化の案内
echo ""
echo "📊 データベースの初期化"
echo "以下の手順でデータベースを初期化してください："
echo ""
echo "1. Supabaseダッシュボード (https://supabase.com/dashboard) にアクセス"
echo "2. SQL Editorで以下のファイルを実行："
echo "   - scripts/create-schema.sql (スキーマ作成)"
echo "   - scripts/initial-products.sql (初期データ)"
echo ""
echo "詳細な手順は docs/DATABASE_INITIALIZATION_GUIDE.md を参照してください"
echo ""

# 6. 開発サーバーの起動
echo "🎯 セットアップが完了しました！"
echo ""
echo "開発サーバーを起動するには："
echo "  npm start"
echo ""
echo "実機でテストするには："
echo "  npm run ios     # iOS"
echo "  npm run android # Android"
echo ""
echo "Happy coding! 🎉"
