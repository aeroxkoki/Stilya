#!/bin/bash

# ========================================
# Stilya 画像読み込みテストスクリプト
# ========================================
# 
# このスクリプトは画像読み込み問題の修正後のテストを行います
# 実行方法: chmod +x test-image-loading.sh && ./test-image-loading.sh

echo "🖼️  Stilya - 画像読み込みテスト"
echo "========================================"
echo ""

# プロジェクトディレクトリの確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: package.jsonが見つかりません"
    echo "Stilyaプロジェクトのルートディレクトリで実行してください"
    exit 1
fi

echo "📝 環境設定チェック..."
echo "------------------------"

# 環境変数の確認
if [ -f ".env" ]; then
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        echo "✅ Supabase URLが設定されています"
        SUPABASE_URL=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)
        echo "   URL: ${SUPABASE_URL:0:40}..."
    else
        echo "❌ Supabase URLが設定されていません"
        exit 1
    fi
else
    echo "❌ .envファイルが見つかりません"
    exit 1
fi

echo ""
echo "🔍 修正内容の確認..."
echo "------------------------"

# 修正ファイルの存在確認
FILES_TO_CHECK=(
    "src/components/common/CachedImage.tsx"
    "src/components/swipe/SwipeCardImproved.tsx"
    "src/components/swipe/SwipeCardEnhanced.tsx"
    "src/utils/imageUtils.ts"
)

ALL_FILES_OK=true
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file が存在します"
        # リトライ機能の実装確認
        if grep -q "retryCount" "$file" 2>/dev/null; then
            echo "   └─ リトライ機能が実装されています"
        fi
    else
        echo "❌ $file が見つかりません"
        ALL_FILES_OK=false
    fi
done

if [ "$ALL_FILES_OK" = false ]; then
    echo ""
    echo "⚠️  一部のファイルが見つかりません"
    echo "修正が正しく適用されていない可能性があります"
fi

echo ""
echo "🎯 主な修正内容:"
echo "------------------------"
echo "1. 画像読み込みの自動リトライ機能（最大3回）"
echo "2. 複数のフォールバック画像URL"
echo "3. 楽天画像URLの最適化処理"
echo "4. HTTPSへの強制変換"
echo "5. デバッグモードでの詳細ログ出力"
echo "6. エラー時の失敗リスト管理と再試行機能"

echo ""
echo "🚀 開発サーバーを起動してテスト..."
echo "========================================"
echo ""
echo "以下のステップでテストを実行してください："
echo ""
echo "1️⃣  開発サーバーの起動:"
echo "   npm run start:expo-go"
echo ""
echo "2️⃣  Expo Goアプリでテスト:"
echo "   - QRコードをスキャン"
echo "   - スワイプ画面に移動"
echo ""
echo "3️⃣  確認するポイント:"
echo "   ✓ 商品画像が表示されるか"
echo "   ✓ 画像読み込み中のローディング表示"
echo "   ✓ エラー時のフォールバック画像表示"
echo "   ✓ コンソールログでのデバッグ情報"
echo ""
echo "4️⃣  デバッグログの確認:"
echo "   以下のログが表示されるはずです:"
echo "   - [CachedImage] Image URL optimization:"
echo "   - [ImageUtils] Processing Rakuten image URL"
echo "   - [ImagePrefetch] Successfully prefetched:"
echo ""
echo "5️⃣  エラーが発生した場合:"
echo "   - 自動的に3回までリトライされます"
echo "   - リトライ後もエラーの場合はプレースホルダー画像が表示されます"
echo ""
echo "========================================"
echo ""

# 開発サーバーを起動するか確認
read -p "今すぐ開発サーバーを起動しますか？ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🎯 Expo開発サーバーを起動中..."
    echo "Ctrl+Cで終了できます"
    echo ""
    npm run start:expo-go
else
    echo ""
    echo "📌 手動でテストする場合は以下のコマンドを実行してください:"
    echo "   npm run start:expo-go"
    echo ""
    echo "テストが完了したら、正常に動作することを確認してください。"
fi

echo ""
echo "✅ テストスクリプトが完了しました"
echo ""
