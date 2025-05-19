#!/bin/bash
# clear-eas-cache.sh - EASビルド前のキャッシュクリア

echo "🧹 EASビルド前のキャッシュをクリアします..."

# Node.jsキャッシュ削除
rm -rf node_modules/.cache
echo "✅ node_modules/.cacheを削除しました"

# Expoキャッシュ削除
rm -rf ~/.expo/cache
echo "✅ ~/.expo/cacheを削除しました"

# Metroキャッシュ削除
rm -rf .expo
rm -rf .expo-shared
rm -rf .metro-cache
echo "✅ Expoとメトロのキャッシュを削除しました"

# eas-cliキャッシュ削除（問題がある場合のみ）
if [ "$1" = "--full" ]; then
  rm -rf ~/.eas-cli
  echo "✅ ~/.eas-cliを削除しました（完全クリア）"
fi

echo "✅ キャッシュのクリアが完了しました。"
