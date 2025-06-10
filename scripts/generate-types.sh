#!/bin/bash

# Supabase型生成スクリプト
# このスクリプトはオンラインSupabaseから型定義を生成します

PROJECT_REF="ddypgpljprljqrblpuli"
OUTPUT_FILE="src/types/database.types.ts"

echo "🔄 Supabase型を生成中..."

# npxを使用してSupabase CLIを実行（インストール不要）
npx supabase@latest gen types typescript --project-ref $PROJECT_REF > $OUTPUT_FILE

if [ $? -eq 0 ]; then
    echo "✅ 型生成が完了しました: $OUTPUT_FILE"
    echo ""
    echo "📝 生成された型の概要:"
    grep -E "Tables:|Enums:|Functions:|Views:" $OUTPUT_FILE | head -10
else
    echo "❌ 型生成に失敗しました"
    echo ""
    echo "トラブルシューティング:"
    echo "1. インターネット接続を確認してください"
    echo "2. プロジェクトIDが正しいか確認してください: $PROJECT_REF"
    echo "3. Supabaseプロジェクトがアクティブか確認してください"
    exit 1
fi
