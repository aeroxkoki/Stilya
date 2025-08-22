#!/bin/bash

# Stilya アプリの再起動スクリプト

echo "🔄 Stilyaアプリを再起動します..."

# Expoプロセスを終了
echo "📍 既存のExpoプロセスを終了..."
pkill -f "expo start"

# キャッシュクリア
echo "🧹 キャッシュをクリア..."
npx expo start --clear &

echo "✅ Expoサーバーが起動しました"
echo "📱 Expo Goアプリでスキャンしてテストしてください"

# 修正内容の確認
echo ""
echo "🎯 修正内容:"
echo "  - オンボーディング画面の2回スワイプ後の遷移問題を修正"
echo "  - React Native Reanimatedの適切な使用"
echo "  - requestAnimationFrameによるスムーズな遷移"
echo ""
echo "📝 テスト手順:"
echo "  1. アプリを起動"
echo "  2. オンボーディング画面で2回スワイプ"
echo "  3. 3枚目のカードが表示されることを確認"
echo "  4. 8枚すべてスワイプ後、StyleReveal画面に遷移することを確認"
