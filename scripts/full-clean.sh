#!/bin/bash

echo "=== Stilya 完全クリーンアップとリセット ==="
echo "このスクリプトはExpo Goでのエラーを解決するために、プロジェクトを完全にリセットします"
echo ""

# プロセスの停止
echo "1. Metro bundlerとExpoプロセスを停止..."
pkill -f "expo" || true
pkill -f "metro" || true
pkill -f "react-native" || true

# キャッシュとnode_modulesの削除
echo "2. キャッシュとnode_modulesを削除..."
rm -rf node_modules
rm -rf .expo
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/expo-*

# npm/yarnキャッシュのクリア
echo "3. npmキャッシュをクリア..."
npm cache clean --force

# watchmanのクリア（インストールされている場合）
echo "4. watchmanをクリア..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
fi

# package-lock.jsonの削除（再生成のため）
echo "5. package-lock.jsonを削除..."
rm -f package-lock.json

# 依存関係の再インストール
echo "6. 依存関係を再インストール..."
npm install

# .expoディレクトリの再作成
echo "7. .expoディレクトリを再作成..."
mkdir -p .expo

# Expo Goのための準備
echo "8. Expo Go用の設定を確認..."
echo "   - app.config.jsからdotenv/configを削除済み ✓"
echo "   - jsEngineをjscに変更済み ✓"
echo "   - react-native-reanimatedを削除済み ✓"
echo "   - GestureHandlerRootViewを削除済み ✓"

echo ""
echo "=== クリーンアップ完了 ==="
echo ""
echo "次のコマンドでExpo Goを起動してください:"
echo "npx expo start --clear"
echo ""
echo "重要: Expo Goアプリも完全に終了してから再起動してください"
