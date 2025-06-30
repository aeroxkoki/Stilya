#!/bin/bash
# 画像URL更新をバックグラウンドで実行

echo "🚀 画像URL更新処理をバックグラウンドで開始します..."
echo "ログファイル: update-image-urls-$(date +%Y%m%d-%H%M%S).log"

# バックグラウンドで実行
nohup node scripts/update-image-urls-to-800.js > "update-image-urls-$(date +%Y%m%d-%H%M%S).log" 2>&1 &

echo "✅ プロセスID: $!"
echo "📝 ログを確認するには: tail -f update-image-urls-*.log"
