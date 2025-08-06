#!/bin/bash

# iOS ビルドエラー「No such module 'Expo'」を修正するスクリプト

echo "🔧 iOS ビルドエラーを修正しています..."

# 1. 作業ディレクトリの確認
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_DIR"

echo "📁 プロジェクトディレクトリ: $PROJECT_DIR"

# 2. XcodeのDerivedDataをクリア
echo "🧹 Xcode DerivedDataをクリアしています..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 3. Xcodeのキャッシュをクリア
echo "🧹 Xcodeキャッシュをクリアしています..."
xcrun --kill-cache 2>/dev/null || true

# 4. CocoaPodsのキャッシュをクリア
echo "🧹 CocoaPodsキャッシュをクリアしています..."
cd ios
pod cache clean --all

# 5. Podsディレクトリとロックファイルを削除
echo "🗑️  Podsディレクトリを削除しています..."
rm -rf Pods
rm -f Podfile.lock

# 6. ビルドディレクトリをクリア
echo "🗑️  ビルドディレクトリをクリアしています..."
rm -rf build

# 7. node_modulesの再インストール
echo "📦 node_modulesを再インストールしています..."
cd "$PROJECT_DIR"
rm -rf node_modules
npm install

# 8. Metroキャッシュのクリア
echo "🧹 Metroキャッシュをクリアしています..."
npx expo start --clear --dev-client &
METRO_PID=$!
sleep 5
kill $METRO_PID 2>/dev/null || true

# 9. CocoaPodsの再インストール
echo "📦 CocoaPodsを再インストールしています..."
cd ios
pod deintegrate
pod setup
pod install --repo-update

# 10. xcworkspaceファイルの確認
echo "✅ xcworkspaceファイルを確認しています..."
if [ -f "Stilya.xcworkspace" ]; then
    echo "✅ Stilya.xcworkspaceが存在します"
else
    echo "❌ Stilya.xcworkspaceが見つかりません"
    exit 1
fi

# 11. ビルド設定の確認
echo "🔍 ビルド設定を確認しています..."
cd "$PROJECT_DIR"

# expo-modulesの存在確認
if [ -d "node_modules/expo" ]; then
    echo "✅ expo モジュールが存在します"
else
    echo "❌ expo モジュールが見つかりません"
    exit 1
fi

# 12. 最終的なビルドの準備
echo "🎯 ビルドの準備が完了しました！"
echo ""
echo "次のステップ:"
echo "1. Xcodeで ios/Stilya.xcworkspace を開く（.xcodeprojではなく）"
echo "2. Product > Clean Build Folder を実行"
echo "3. Product > Build を実行"
echo ""
echo "それでも問題が解決しない場合は、以下を試してください:"
echo "- Xcodeを完全に終了して再起動"
echo "- iOSシミュレーターをリセット"
echo "- npx expo run:ios --clear を実行"

exit 0
