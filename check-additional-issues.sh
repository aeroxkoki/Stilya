#!/bin/bash
echo "🔍 Stilyaアプリの追加チェック項目..."
echo ""

# 1. オフライン時の画像キャッシュ確認
echo "1️⃣ オフライン時の画像キャッシュ状態を確認..."
if [ -d ~/Library/Caches/ExponentExperienceData ]; then
    CACHE_SIZE=$(du -sh ~/Library/Caches/ExponentExperienceData 2>/dev/null | cut -f1)
    echo "   Expo キャッシュサイズ: ${CACHE_SIZE:-不明}"
else
    echo "   Expo キャッシュディレクトリが見つかりません"
fi

# 2. Metro Bundlerの状態確認
echo ""
echo "2️⃣ Metro Bundlerの状態確認..."
if pgrep -f "metro" > /dev/null; then
    echo "   ✅ Metro Bundlerは実行中です"
else
    echo "   ⚠️ Metro Bundlerが実行されていません"
fi

# 3. ネットワーク接続の確認
echo ""
echo "3️⃣ ネットワーク接続の確認..."
if ping -c 1 thumbnail.image.rakuten.co.jp > /dev/null 2>&1; then
    echo "   ✅ 楽天画像サーバーへの接続: 正常"
else
    echo "   ⚠️ 楽天画像サーバーへの接続: 失敗"
fi

# 4. プロジェクトのnode_modules確認
echo ""
echo "4️⃣ 依存関係の確認..."
cd /Users/koki_air/Documents/GitHub/Stilya

# expo-imageのバージョン確認
EXPO_IMAGE_VERSION=$(npm list expo-image --depth=0 2>/dev/null | grep expo-image | awk '{print $NF}')
echo "   expo-image バージョン: ${EXPO_IMAGE_VERSION:-インストールされていません}"

# React Nativeのバージョン確認
RN_VERSION=$(npm list react-native --depth=0 2>/dev/null | grep react-native | awk '{print $NF}')
echo "   React Native バージョン: ${RN_VERSION:-不明}"

# 5. エラーログの確認
echo ""
echo "5️⃣ 最近のエラーログを確認..."
if [ -f expo_test.log ]; then
    ERROR_COUNT=$(grep -c "ERROR\|Failed\|failed" expo_test.log 2>/dev/null || echo "0")
    echo "   エラー件数: $ERROR_COUNT"
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "   最新のエラー:"
        grep -E "ERROR|Failed|failed" expo_test.log | tail -3 | while read line; do
            echo "      - ${line:0:80}..."
        done
    fi
fi

# 6. TypeScriptコンパイルエラーの確認
echo ""
echo "6️⃣ TypeScriptエラーチェック..."
npx tsc --noEmit 2>&1 | head -10 || echo "   ✅ TypeScriptエラーなし"

echo ""
echo "==============================================="
echo "📋 追加で確認すべき項目:"
echo ""
echo "1. 【パフォーマンス最適化】"
echo "   - 画像の遅延読み込みが正しく動作しているか"
echo "   - メモリリークが発生していないか"
echo "   - FPSが60を維持できているか"
echo ""
echo "2. 【エラーハンドリング】"
echo "   - 404エラーの画像が適切にフォールバック表示されるか"
echo "   - ネットワークタイムアウト時の挙動"
echo "   - 巨大な画像ファイルへの対応"
echo ""
echo "3. 【ユーザビリティ】"
echo "   - 画像読み込み中のスケルトンスクリーンの表示"
echo "   - Pull to Refreshでの画像キャッシュ更新"
echo "   - 画像タップでの拡大表示機能"
echo ""
echo "4. 【データ整合性】"
echo "   - スワイプ済み商品の重複表示防止"
echo "   - お気に入り機能との連携"
echo "   - 商品詳細画面への遷移時のデータ引き継ぎ"
echo ""
echo "==============================================="
