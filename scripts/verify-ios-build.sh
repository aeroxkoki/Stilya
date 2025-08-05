#!/bin/bash

# iOS開発ビルド動作確認スクリプト

echo "🏗️ iOS開発ビルド動作確認を開始します..."

# 1. 作業ディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 2. node_modulesの整合性確認
echo "📦 node_modulesの確認..."
if [ ! -d "node_modules" ]; then
    echo "⚠️ node_modulesが見つかりません。npm installを実行してください。"
    exit 1
fi

# 3. iOS Podsの確認
echo "🍎 iOS Podsの確認..."
if [ ! -d "ios/Pods" ]; then
    echo "⚠️ Podsディレクトリが見つかりません。"
    echo "   cd ios && pod install を実行してください。"
    exit 1
fi

# 4. Podfile.lockの確認
echo "🔒 Podfile.lockの確認..."
if [ ! -f "ios/Podfile.lock" ]; then
    echo "⚠️ Podfile.lockが見つかりません。"
    echo "   cd ios && pod install を実行してください。"
    exit 1
fi

# 5. 開発ビルドの起動準備
echo "✅ iOS開発ビルドの準備が完了しました！"
echo ""
echo "🚀 開発ビルドを起動するには、以下のコマンドを実行してください："
echo ""
echo "   npx expo run:ios"
echo ""
echo "または、Xcodeで直接ビルドする場合："
echo ""
echo "   1. open ios/Stilya.xcworkspace"
echo "   2. デバイスまたはシミュレータを選択"
echo "   3. Runボタンをクリック"
echo ""
echo "📱 注意事項："
echo "   - 必ず .xcworkspace ファイルを使用してください（.xcodeproj ではなく）"
echo "   - 初回ビルドには時間がかかる場合があります"
echo "   - エラーが発生した場合は、docs/IOS_COCOAPODS_TROUBLESHOOTING.md を参照してください"
