#!/bin/bash

echo "🧹 Stilya プロジェクトの完全リセットを開始します..."

# 開発サーバーの停止を促す
echo "⚠️  開発サーバーが起動している場合は、Ctrl+Cで停止してください"
echo "停止したらEnterキーを押してください..."
read

# プロジェクトディレクトリに移動
cd "$(dirname "$0")/.."

echo "📁 現在のディレクトリ: $(pwd)"

# キャッシュクリア
echo "🗑️  キャッシュをクリアしています..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-native-*
rm -rf $TMPDIR/haste-*
rm -rf ~/.expo
rm -rf .expo
rm -rf node_modules
rm -f package-lock.json

# Watchmanキャッシュ（インストールされている場合）
if command -v watchman &> /dev/null; then
    echo "👁️  Watchmanキャッシュをクリアしています..."
    watchman watch-del-all
fi

# 再インストール
echo "📦 パッケージを再インストールしています..."
npm install

echo "✅ 完全リセットが完了しました！"
echo ""
echo "次のコマンドで開発を再開できます:"
echo "  npm start"
echo "または"
echo "  npm run clear-cache"
