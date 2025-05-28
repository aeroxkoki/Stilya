#!/bin/bash

# Stilyaプロジェクト クリーンアップスクリプト
# 実行前に必ずバックアップを作成してください

echo "🚀 Stilyaプロジェクトのクリーンアップを開始します..."
echo "⚠️  このスクリプトは不要なファイルを削除します。続行しますか? (y/n)"
read -r response

if [[ "$response" != "y" ]]; then
    echo "❌ キャンセルしました"
    exit 1
fi

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya || exit

echo "📊 クリーンアップ前の状態:"
echo "  総ファイル数: $(find . -type f | wc -l | tr -d ' ')"
echo "  node_modules以外: $(find . -type f -not -path "./node_modules/*" | wc -l | tr -d ' ')"
echo "  ディスク使用量: $(du -sh . | cut -f1)"

# ステップ1: キャッシュとビルドファイルの削除
echo ""
echo "📦 キャッシュとビルドファイルを削除中..."
rm -rf .expo/ .metro-cache/ dist/ build/ web-build/ .expo-shared/

# ステップ2: 一時ファイルの削除
echo "🗑️ 一時ファイルを削除中..."
find . -name "*.tmp" -type f -delete
find . -name "*.temp" -type f -delete
find . -name "*.bak" -type f -delete
find . -name "*.backup" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "*~" -type f -delete
find . -name "*.swp" -type f -delete
find . -name "*.swo" -type f -delete

# ステップ3: ログファイルの削除
echo "📄 ログファイルを削除中..."
find . -name "*.log" -type f -not -path "./node_modules/*" -delete

# ステップ4: 不要なディレクトリの削除
echo "📁 不要なディレクトリを削除中..."
rm -rf temp-backup-*/ backup*/ scripts/backup/ scripts/old/ scripts/temp/
rm -rf coverage/ test-results/

# ステップ5: TypeScriptビルドファイルの削除
echo "🔧 TypeScriptビルドファイルを削除中..."
find . -name "*.tsbuildinfo" -type f -delete
rm -f typescript_errors.txt

# ステップ6: node_modulesの最適化
echo ""
echo "❓ node_modulesを再インストールしますか? (y/n)"
read -r reinstall

if [[ "$reinstall" == "y" ]]; then
    echo "📦 node_modulesを再インストール中..."
    rm -rf node_modules package-lock.json
    npm install
fi

# ステップ7: Gitの最適化
echo ""
echo "🔧 Gitリポジトリを最適化中..."
git gc --aggressive --prune=now

# 結果を表示
echo ""
echo "✅ クリーンアップが完了しました！"
echo ""
echo "📊 クリーンアップ後の状態:"
echo "  総ファイル数: $(find . -type f | wc -l | tr -d ' ')"
echo "  node_modules以外: $(find . -type f -not -path "./node_modules/*" | wc -l | tr -d ' ')"
echo "  ディスク使用量: $(du -sh . | cut -f1)"

# 推奨事項
echo ""
echo "💡 推奨される次のステップ:"
echo "  1. npm run type-check でTypeScriptエラーがないか確認"
echo "  2. npm start でアプリが正常に起動するか確認"
echo "  3. 必要に応じて git status で変更を確認"
