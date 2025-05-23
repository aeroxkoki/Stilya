#!/bin/bash

# Stilya MVP 開発環境セットアップスクリプト

echo "🚀 Stilya MVP セットアップを開始します..."

# 1. 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# 2. 環境変数のチェック
echo "🔧 環境変数をチェック中..."
if [ ! -f .env ]; then
    echo "⚠️  .envファイルが見つかりません。.env.exampleからコピーします..."
    cp .env.example .env
    echo "✅ .envファイルを作成しました。Supabaseの認証情報を設定してください。"
else
    echo "✅ .envファイルが存在します。"
fi

# 3. キャッシュのクリア
echo "🧹 キャッシュをクリア中..."
npm run clean

# 4. TypeScriptの型チェック
echo "📝 TypeScriptの型チェック中..."
npm run type-check || echo "⚠️  型エラーがあります。開発中に修正してください。"

# 5. iOS固有の設定（macOSの場合のみ）
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 iOS設定をチェック中..."
    if [ -d "ios" ]; then
        echo "📱 Podsをインストール中..."
        cd ios && pod install && cd ..
    fi
fi

# 6. 開発サーバー起動の準備
echo "✨ セットアップ完了！"
echo ""
echo "次のステップ:"
echo "1. .envファイルにSupabaseの認証情報を設定"
echo "2. Supabaseダッシュボードでsupabase/setup.sqlを実行"
echo "3. npm start でExpo開発サーバーを起動"
echo ""
echo "開発ドキュメント:"
echo "- Supabaseセットアップ: ./supabase/README.md"
echo "- アプリ開発ガイド: ./docs/README.md"
echo ""
echo "Happy coding! 🎉"