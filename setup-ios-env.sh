#!/bin/bash

echo "🔧 iOS開発環境セットアップ..."

# CocoaPodsがインストールされているか確認
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPodsが見つかりません。インストールします..."
    sudo gem install cocoapods
    echo "✅ CocoaPodsのインストール完了"
else
    echo "✅ CocoaPodsは既にインストールされています（バージョン: $(pod --version)）"
fi

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# iOS依存関係のインストール
echo "📦 iOS依存関係をインストール中..."
cd ios

# Podfile.lockがある場合は削除（クリーンインストール）
if [ -f "Podfile.lock" ]; then
    echo "🗑️ 古いPodfile.lockを削除..."
    rm Podfile.lock
fi

# Podsディレクトリがある場合は削除
if [ -d "Pods" ]; then
    echo "🗑️ 古いPodsディレクトリを削除..."
    rm -rf Pods
fi

# Pod install実行
echo "🔄 pod installを実行中..."
pod install

cd ..

echo "✅ iOS開発環境のセットアップ完了！"
echo ""
echo "📱 次のコマンドでアプリを起動できます:"
echo "   npm run ios"
echo ""
echo "または特定のシミュレーターで起動:"
echo "   npx expo run:ios --simulator 'iPhone 15 Pro'"
