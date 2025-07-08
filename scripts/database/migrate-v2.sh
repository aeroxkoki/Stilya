#!/bin/bash

# Supabase推薦システムv2 マイグレーション実行スクリプト

echo "================================"
echo "Supabase 推薦システムv2 Migration"
echo "================================"

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# プロジェクトディレクトリ
PROJECT_DIR="/Users/koki_air/Documents/GitHub/Stilya"
MIGRATIONS_DIR="$PROJECT_DIR/supabase/migrations"

# プロジェクトIDとURL
PROJECT_REF="ddypgpljprljqrblpuli"
SUPABASE_URL="https://ddypgpljprljqrblpuli.supabase.co"

# ディレクトリ移動
cd "$PROJECT_DIR" || exit 1

echo -e "${YELLOW}プロジェクトディレクトリ: $PROJECT_DIR${NC}"
echo ""

# Supabase CLIの確認
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}エラー: Supabase CLIがインストールされていません${NC}"
    echo "インストール方法: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLIが見つかりました${NC}"

# Supabaseプロジェクトの初期化確認
if [ ! -f "$PROJECT_DIR/supabase/config.toml" ]; then
    echo -e "${YELLOW}Supabaseプロジェクトを初期化します...${NC}"
    supabase init
fi

# プロジェクトリンク
echo ""
echo -e "${YELLOW}Supabaseプロジェクトにリンクします...${NC}"
echo "プロジェクトID: $PROJECT_REF"

# リンク状態の確認
if supabase status 2>/dev/null | grep -q "$PROJECT_REF"; then
    echo -e "${GREEN}✓ プロジェクトは既にリンクされています${NC}"
else
    echo "プロジェクトをリンクしています..."
    supabase link --project-ref "$PROJECT_REF"
fi

# マイグレーションファイルの確認
echo ""
echo -e "${YELLOW}マイグレーションファイルの確認:${NC}"
echo "1. 20250708_recommendation_system_v2.sql"
echo "2. 20250709_performance_indexes.sql"

# 実行確認
echo ""
read -p "マイグレーションを実行しますか？ (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "キャンセルしました"
    exit 0
fi

# マイグレーションの実行
echo ""
echo -e "${YELLOW}マイグレーションを実行しています...${NC}"

# db pushを実行
if supabase db push; then
    echo -e "${GREEN}✓ マイグレーションが正常に実行されました${NC}"
else
    echo -e "${RED}✗ マイグレーションの実行に失敗しました${NC}"
    exit 1
fi

# RLSポリシーのチェック
echo ""
echo -e "${YELLOW}RLSポリシーをチェックしています...${NC}"
supabase db lint

# 結果の確認
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}マイグレーション完了！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "次のステップ:"
echo "1. Supabaseダッシュボードで新しいテーブルを確認"
echo "2. アプリケーションから新機能をテスト"
echo "3. A/Bテストの設定を確認"
echo ""
echo "ダッシュボードURL: https://supabase.com/dashboard/project/$PROJECT_REF"
