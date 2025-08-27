#!/bin/bash

echo "===================="
echo "オンボーディング修正テストスクリプト"
echo "===================="
echo ""

# キャッシュをクリア
echo "✅ キャッシュをクリア中..."
npx expo start --clear

echo ""
echo "===================="
echo "テスト手順："
echo "===================="
echo "1. Expo Goアプリで接続"
echo "2. オンボーディング画面を進める"
echo "3. 「始める」ボタンをタップ"
echo "4. スワイプ画面が表示されることを確認"
echo ""
echo "===================="
echo "デバッグログに注目："
echo "===================="
echo "[CompleteScreen] 自動ナビゲーション開始"
echo "[CompleteScreen] オンボーディング完了処理成功"
echo "[CompleteScreen] Navigation reset to Main"
echo "[SwipeScreen] Component mounted"
echo "===================="
