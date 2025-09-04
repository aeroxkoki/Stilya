#!/bin/bash

echo "====================================="
echo "商品初期化テストスクリプト"
echo "====================================="
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Metro Bundlerのキャッシュをクリア${NC}"
npx expo start -c &
EXPO_PID=$!

sleep 5

echo -e "${YELLOW}2. Expo Goアプリで確認する項目:${NC}"
echo ""
echo -e "${GREEN}✓ オンボーディング画面での初回表示${NC}"
echo "  - スタイル選択画面で商品が一瞬表示されないか"
echo "  - チュートリアルスワイプで別の商品が混じらないか"
echo ""
echo -e "${GREEN}✓ スワイプ画面での初回表示${NC}"
echo "  - 最初の商品が表示されるまでローディング表示が適切か"
echo "  - 別の商品が一瞬表示されないか"
echo ""
echo -e "${GREEN}✓ フィルター変更時の再読み込み${NC}"
echo "  - フィルター適用時にフリッカーが発生しないか"
echo "  - 商品の切り替わりがスムーズか"
echo ""

echo -e "${BLUE}テスト方法:${NC}"
echo "1. Expo Goアプリでプロジェクトを開く"
echo "2. アカウントを作成（または既存アカウントでログイン）"
echo "3. オンボーディング画面を進める"
echo "4. 各画面でフリッカーが発生しないことを確認"
echo ""

echo -e "${YELLOW}Metroバンドラーを停止するには Ctrl+C を押してください${NC}"

wait $EXPO_PID
