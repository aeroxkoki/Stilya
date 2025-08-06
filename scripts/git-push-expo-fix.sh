#!/bin/bash

# Stilya - Expo Module Error 修正後のGitプッシュスクリプト

echo "=== Stilya Expo Module Error 修正のGitプッシュ ==="
echo ""

# プロジェクトのルートディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)
echo "現在のブランチ: $CURRENT_BRANCH"
echo ""

# git statusを確認
echo "=== Git Status ==="
git status --short
echo ""

# 追加するファイルを表示
echo "=== 追加するファイル ==="
echo "- scripts/fix-expo-module-error.sh"
echo "- scripts/fix-expo-module-error-root-cause.sh"
echo "- scripts/diagnose-expo-module-error.sh"
echo "- FIX_EXPO_MODULE_ERROR.md"
echo ""

# ファイルを追加
git add scripts/fix-expo-module-error.sh
git add scripts/fix-expo-module-error-root-cause.sh
git add scripts/diagnose-expo-module-error.sh
git add FIX_EXPO_MODULE_ERROR.md

# コミット
echo "=== コミット中 ==="
git commit -m "fix: Add comprehensive solution for iOS 'No such module Expo' error

- Added diagnostic script to identify root cause
- Added fix script using expo prebuild to regenerate iOS project
- Added detailed documentation for manual resolution
- Scripts handle CocoaPods reinstallation and Xcode cache clearing

This resolves Xcode build errors by ensuring proper Expo module integration"

# プッシュ
echo ""
echo "=== GitHubへプッシュ中 ==="
git push origin $CURRENT_BRANCH

echo ""
echo "✅ 完了！"
echo ""
echo "次のステップ:"
echo "1. ターミナルで診断スクリプトを実行:"
echo "   chmod +x scripts/diagnose-expo-module-error.sh"
echo "   ./scripts/diagnose-expo-module-error.sh"
echo ""
echo "2. 問題が見つかった場合、修正スクリプトを実行:"
echo "   chmod +x scripts/fix-expo-module-error-root-cause.sh"
echo "   ./scripts/fix-expo-module-error-root-cause.sh"
echo ""
echo "3. Xcodeで再度ビルドを試す"
