#!/bin/bash

# Stilya アプリのスワイプ機能テストスクリプト
# 作成日: 2025年1月14日

echo "================================================"
echo "   Stilya スワイプ機能テストスクリプト"
echo "================================================"
echo ""

# 現在のディレクトリを確認
cd /Users/koki_air/Documents/GitHub/Stilya

echo "1. 環境を確認中..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️ node_modules が見つかりません。インストールします..."
    npm install
fi

echo ""
echo "2. TypeScriptの型チェック..."
npx tsc --noEmit --skipLibCheck 2>&1 | head -20

echo ""
echo "3. Metro キャッシュをクリア..."
npx expo start --clear

echo ""
echo "================================================"
echo "テスト手順:"
echo "================================================"
echo ""
echo "1. Expo Goアプリを開いてください"
echo "2. スワイプ画面に移動してください"
echo "3. 以下の項目を確認してください:"
echo ""
echo "✅ チェックリスト:"
echo "  [ ] 最初の商品が表示される"
echo "  [ ] 商品を左右にスワイプできる"
echo "  [ ] スワイプ後、次の商品が表示される"
echo "  [ ] 連続して複数回スワイプできる"
echo "  [ ] 商品詳細画面へ遷移できる"
echo "  [ ] お気に入り保存が機能する"
echo ""
echo "================================================"
echo ""
echo "問題が発生した場合は、以下のコマンドでログを確認してください:"
echo "  adb logcat | grep -E 'SwipeScreen|StyledSwipeContainer|useProducts'"
echo ""
echo "または、Expo Go内のデバッグコンソールを確認してください。"
echo ""
