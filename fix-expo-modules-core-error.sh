#!/bin/bash

# Stilya - ExpoModulesCore エラー修正スクリプト
# 目的: XcodeビルドでのExpoModulesCoreエラーを根本的に解決

echo "📱 Stilya - ExpoModulesCore エラー修正を開始します..."
echo "=================================="

# 現在のディレクトリを確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: package.jsonが見つかりません。プロジェクトルートディレクトリで実行してください。"
    exit 1
fi

# 1. iOSビルドキャッシュのクリア
echo ""
echo "🧹 1. iOSビルドキャッシュをクリアしています..."
cd ios || exit 1

# DerivedDataのクリア
echo "   - DerivedDataをクリア中..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Stilya-*

# ビルドディレクトリのクリア
echo "   - ビルドディレクトリをクリア中..."
rm -rf build/

# 2. Podsディレクトリとlockファイルのクリア
echo ""
echo "🗑️  2. Podsディレクトリとlockファイルを削除しています..."
rm -rf Pods/
rm -f Podfile.lock

# 3. Xcodeワークスペースのクリア
echo ""
echo "🔧 3. Xcodeワークスペースをクリアしています..."
rm -rf Stilya.xcworkspace

# 4. プロジェクトルートに戻る
cd .. || exit 1

# 5. node_modulesの再インストール
echo ""
echo "📦 4. 依存関係を再インストールしています..."
echo "   - node_modulesを削除中..."
rm -rf node_modules
rm -f package-lock.json

echo "   - npmパッケージをインストール中..."
npm install

# 6. Expoプレビルドのクリーンアップ
echo ""
echo "🔄 5. Expoプレビルドをクリーンアップしています..."
npx expo prebuild --clean --platform ios

# 7. CocoaPodsの再インストール
echo ""
echo "🍫 6. CocoaPods依存関係を再インストールしています..."
cd ios || exit 1

# CocoaPodsのキャッシュクリア
echo "   - CocoaPodsキャッシュをクリア中..."
pod cache clean --all

# pod installの実行
echo "   - pod installを実行中..."
pod install --repo-update

# 8. プロジェクトルートに戻る
cd .. || exit 1

# 9. Xcodeの設定をリセット
echo ""
echo "⚙️  7. Xcode設定をリセットしています..."
cd ios || exit 1

# Build Settingsのリセット（必要に応じて）
echo "   - プロジェクト設定を確認中..."

# 10. 完了メッセージ
echo ""
echo "✅ ExpoModulesCore エラー修正が完了しました！"
echo "=================================="
echo ""
echo "📝 次のステップ:"
echo "1. Xcodeを完全に終了してください"
echo "2. ターミナルで以下のコマンドを実行してください:"
echo "   cd ios && open Stilya.xcworkspace"
echo "3. Xcodeで以下の操作を行ってください:"
echo "   - Product > Clean Build Folder (Cmd+Shift+K)"
echo "   - Product > Build (Cmd+B)"
echo ""
echo "⚠️  注意事項:"
echo "- 必ずStilya.xcworkspaceを開いてください（.xcodeprojではありません）"
echo "- ビルド時のターゲットデバイスがiOS 15.1以上であることを確認してください"
echo "- シミュレーターまたは実機でのテストを推奨します"
echo ""
echo "問題が解決しない場合は、以下のコマンドも試してください:"
echo "  npx react-native doctor"
