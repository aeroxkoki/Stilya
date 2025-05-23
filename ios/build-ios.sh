#!/bin/bash

echo "🚀 Stilya iOS Build Script"
echo "=========================="

# 環境変数をエクスポート
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# プロジェクトルートに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 環境チェック
echo "📱 環境チェック中..."

# Node.jsバージョン確認
NODE_VERSION=$(node --version)
echo "✓ Node.js: $NODE_VERSION"

# Xcodeバージョン確認
XCODE_VERSION=$(xcodebuild -version | head -n 1)
echo "✓ Xcode: $XCODE_VERSION"

# CocoaPodsバージョン確認
if command -v pod &> /dev/null; then
    POD_VERSION=$(pod --version)
    echo "✓ CocoaPods: $POD_VERSION"
else
    echo "❌ CocoaPods not installed"
    echo "Installing CocoaPods..."
    sudo gem install cocoapods
fi

# ビルドタイプを選択
echo ""
echo "ビルドタイプを選択してください:"
echo "1) シミュレーター"
echo "2) 実機 (デバッグ)"
echo "3) 実機 (リリース)"
echo "4) EAS Build (クラウド)"
read -p "選択 (1-4): " BUILD_TYPE

case $BUILD_TYPE in
    1)
        echo "🖥️ シミュレータービルドを開始..."
        npm run ios
        ;;
    2)
        echo "📱 実機デバッグビルドを開始..."
        npx expo run:ios --device
        ;;
    3)
        echo "📦 実機リリースビルドを開始..."
        npx expo run:ios --configuration Release --device
        ;;
    4)
        echo "☁️ EAS Buildを開始..."
        eas build --platform ios --profile preview
        ;;
    *)
        echo "❌ 無効な選択です"
        exit 1
        ;;
esac

echo ""
echo "✅ ビルドプロセスが完了しました！"
