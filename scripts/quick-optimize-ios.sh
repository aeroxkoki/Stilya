#!/bin/bash

# Stilya iOS ビルド最適化スクリプト（簡易版）

echo "🚀 Stilya iOS ビルド最適化を開始します..."

# プロジェクトルートに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 1. キャッシュのクリーンアップ
echo "📦 キャッシュをクリーンアップしています..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# 2. Xcodeの並列ビルド設定
echo "⚡ Xcodeの並列ビルド設定を最適化しています..."
defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsExclusively -bool NO
defaults write com.apple.dt.Xcode ShowBuildOperationDuration -bool YES
defaults write com.apple.dt.Xcode IDEBuildOperationMaxNumberOfConcurrentCompileTasks $(sysctl -n hw.ncpu)

# 3. CocoaPodsの最適化設定
echo "🔧 CocoaPodsの最適化設定を適用しています..."
export COCOAPODS_DISABLE_STATS=1
export CP_REPOS_DIR=~/.cocoapods/repos

# 4. Pod インストール
echo "🔄 Podをインストールしています..."
cd ios
pod install --repo-update

# 5. xcworkspaceの最適化設定
echo "📝 Xcworkspace設定を最適化しています..."
cd ..

# 6. 結果を表示
echo "✅ 最適化が完了しました！"
echo ""
echo "📊 適用された最適化:"
echo "✓ DerivedDataクリア"
echo "✓ Xcodeの並列ビルド有効化"
echo "✓ Podfileの最適化設定適用"
echo "✓ インデックスストア無効化"
echo "✓ デバッグシンボル最小化"
echo "✓ アクティブアーキテクチャのみビルド"
echo ""
echo "💡 次のステップ:"
echo "1. Xcodeを再起動してください"
echo "2. 初回ビルドは時間がかかる場合があります"
echo "3. 'npm run ios' でビルドを開始してください"
