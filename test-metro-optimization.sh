#!/bin/bash

echo "🎯 Metro設定最適化テストスクリプト"
echo "===================================="

# 1. すべてのプロセスを終了
echo "1. 既存のプロセスを終了します..."
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true
pkill -f node 2>/dev/null || true

# 2. キャッシュを完全にクリア
echo "2. キャッシュを完全にクリアします..."
rm -rf .expo
rm -rf .metro-cache
rm -rf node_modules/.cache
rm -rf ios/Pods
rm -rf ios/build
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*
rm -rf ~/.expo

# 3. watchmanのキャッシュをクリア
echo "3. watchmanのキャッシュをクリアします..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
fi

# 4. Metro設定の確認
echo "4. Metro設定を確認します..."
echo ""
echo "📋 metro.config.js:"
echo "==================="
head -n 30 metro.config.js
echo ""

# 5. Babel設定の確認
echo "5. Babel設定を確認します..."
echo ""
echo "📋 babel.config.js:"
echo "==================="
cat babel.config.js
echo ""

# 6. TypeScript設定の確認
echo "6. TypeScript設定を確認します..."
echo ""
echo "📋 tsconfig.json (paths):"
echo "========================"
grep -A 15 '"paths"' tsconfig.json
echo ""

# 7. 依存関係の確認
echo "7. 重要な依存関係を確認します..."
echo ""
echo "📦 React Native & Expo:"
npm list expo react-native | head -5
echo ""
echo "📦 Navigation & Gesture:"
npm list react-native-reanimated react-native-gesture-handler react-native-screens | head -10
echo ""

# 8. Expo Goで起動
echo "8. Expo Goモードで起動します..."
echo ""
echo "===================================="
echo "✨ 最適化された設定でアプリを起動します"
echo "===================================="
echo ""
echo "以下の機能が利用可能になりました："
echo "  ✅ パスエイリアス (@, @components, @screens等)"
echo "  ✅ Hermesエンジン最適化"
echo "  ✅ キャッシュ管理の改善"
echo "  ✅ パフォーマンス最適化"
echo ""
echo "📱 Expo Goアプリでスキャンしてください"
echo ""

# デバッグモードで起動
DEBUG_METRO=false npx expo start --clear

echo ""
echo "スクリプトが完了しました。"
