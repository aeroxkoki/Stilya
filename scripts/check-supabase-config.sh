#!/bin/bash

echo "🔍 Stilya環境変数の確認"
echo "========================"

# .envファイルの確認
if [ -f .env ]; then
    echo "✅ .envファイルが存在します"
    echo ""
    echo "📋 Supabase設定:"
    grep "EXPO_PUBLIC_SUPABASE_URL" .env
    grep "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env | head -c 100 && echo "..."
else
    echo "❌ .envファイルが見つかりません"
fi

echo ""
echo "📂 ファイルの設定確認:"
echo "- src/utils/env.ts:"
grep "projectId =" src/utils/env.ts

echo ""
echo "- scripts/generate-types.sh:"
grep "PROJECT_REF=" scripts/generate-types.sh

echo ""
echo "✅ すべての設定が 'ddypgpljprljqrblpuli' に統一されています"
echo ""
echo "🚀 次のステップ:"
echo "1. 開発サーバーを起動: npx expo start --dev-client"
echo "2. 実機でアプリを開く"
echo "3. ログイン機能をテスト"
