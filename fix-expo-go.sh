#!/bin/bash

echo "ExpoGo問題修正スクリプトを開始します..."

# 1. キャッシュをクリア
echo "1. キャッシュをクリアします..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ios/Pods
rm -rf ios/build

# 2. watchmanのキャッシュをクリア
echo "2. watchmanのキャッシュをクリアします..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
fi

# 3. Metro bundlerのキャッシュをクリア
echo "3. Metro bundlerのキャッシュをクリアします..."
npx expo start --clear &
EXPO_PID=$!

# 5秒待機してプロセスを終了
sleep 5
kill $EXPO_PID 2>/dev/null

# 4. Expo Goモードで起動
echo "4. Expo Goモードで起動します..."
echo ""
echo "================================"
echo "Expo Goアプリを開いてQRコードをスキャンしてください"
echo "================================"
echo ""

# デバッグモードで起動
EXPO_PUBLIC_DEBUG_MODE=true npx expo start

echo "スクリプトが完了しました。"
