#!/bin/bash

# Stilya - ExpoModulesCore エラー修正（シンプル版）
# 目的: XcodeビルドでのExpoModulesCoreエラーを段階的に解決

echo "📱 Stilya - ExpoModulesCore エラー修正（シンプル版）を開始します..."
echo "=================================="

# 現在のディレクトリを確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: package.jsonが見つかりません。プロジェクトルートディレクトリで実行してください。"
    exit 1
fi

# 1. 現在の状態を確認
echo ""
echo "📊 1. 現在の状態を確認しています..."
echo "   - Node version: $(node --version)"
echo "   - npm version: $(npm --version)"
echo "   - CocoaPods version: $(cd ios && pod --version)"

# 2. iOSディレクトリのバックアップ
echo ""
echo "💾 2. iOSディレクトリをバックアップしています..."
if [ -d "ios_backup" ]; then
    rm -rf ios_backup
fi
cp -r ios ios_backup
echo "   - バックアップ完了: ios_backup/"

# 3. iOSディレクトリの削除
echo ""
echo "🗑️  3. iOSディレクトリを削除しています..."
rm -rf ios

# 4. Expoプレビルドの実行
echo ""
echo "🔄 4. Expoプレビルドを実行しています..."
npx expo prebuild --platform ios

# 5. 実行結果の確認
echo ""
echo "📋 5. 実行結果を確認しています..."
if [ -d "ios/Pods" ]; then
    echo "   ✅ Podsディレクトリが作成されました"
else
    echo "   ❌ Podsディレクトリが作成されませんでした"
fi

if [ -f "ios/Stilya.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Xcodeワークスペースが作成されました"
else
    echo "   ❌ Xcodeワークスペースが作成されませんでした"
fi

# 6. ExpoModulesCoreの確認
echo ""
echo "🔍 6. ExpoModulesCoreの存在を確認しています..."
if [ -d "ios/Pods/ExpoModulesCore" ]; then
    echo "   ✅ ExpoModulesCoreが正常にインストールされました"
    ls -la ios/Pods/ExpoModulesCore | head -5
else
    echo "   ❌ ExpoModulesCoreが見つかりません"
    echo "   📝 手動でpod installを実行してください:"
    echo "      cd ios && pod install"
fi

# 7. 完了メッセージ
echo ""
echo "✅ 処理が完了しました！"
echo "=================================="
echo ""
echo "📝 次のステップ:"
echo "1. Xcodeで ios/Stilya.xcworkspace を開いてください"
echo "2. Product > Clean Build Folder (Cmd+Shift+K) を実行"
echo "3. Product > Build (Cmd+B) を実行"
echo ""
echo "⚠️  もし問題が続く場合:"
echo "1. cd ios && pod install を手動で実行"
echo "2. それでも解決しない場合は ios_backup から復元可能です"
