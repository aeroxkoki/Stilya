#!/bin/bash

# Stilya MVP - プロジェクトクリーンアップスクリプト
# このスクリプトは、MVP開発に不要なファイルを削除し、プロジェクトを最小構成にします

echo "🧹 Stilya MVP クリーンアップを開始します..."

# 現在のディレクトリを確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: package.jsonが見つかりません。Stilyaプロジェクトのルートディレクトリで実行してください。"
    exit 1
fi

# バックアップの作成を推奨
echo "⚠️  警告: このスクリプトは多くのファイルを削除します。"
read -p "続行する前にバックアップを作成しましたか？ (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 中止しました。バックアップを作成してから再実行してください。"
    exit 1
fi

echo "🗑️  不要なディレクトリを削除しています..."

# ネイティブディレクトリの削除（managed workflow維持）
rm -rf android ios

# MVP段階で不要な機能ディレクトリの削除
rm -rf src/batch
rm -rf src/store
rm -rf src/contexts
rm -rf src/screens/report
rm -rf src/navigation/ReportNavigator.tsx
rm -rf src/utils/performance
rm -rf src/utils/metro-context.ts
rm -rf src/utils/metro-serializer-fix.js

# 不要なサービスファイルの削除
rm -f src/services/analyticsService.ts
rm -f src/services/integratedRecommendationService.ts

echo "📦 パッケージの最適化..."

# 最小限のpackage.jsonを作成
cat > package_minimal.json << 'EOF'
{
  "name": "stilya",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "clean": "rm -rf node_modules .expo",
    "reset": "npm run clean && npm install"
  },
  "dependencies": {
    "expo": "~53.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-constants": "~17.0.0",
    "expo-linking": "~7.0.0",
    "react": "18.3.1",
    "react-native": "0.75.0",
    "@react-navigation/native": "^6.1.14",
    "@react-navigation/native-stack": "^6.9.22",
    "@react-navigation/bottom-tabs": "^6.5.16",
    "react-native-screens": "~4.4.0",
    "react-native-safe-area-context": "~4.14.0",
    "@supabase/supabase-js": "^2.39.3",
    "@react-native-async-storage/async-storage": "~2.1.0",
    "react-native-url-polyfill": "^2.0.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0",
    "@expo/vector-icons": "^14.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.3.0",
    "@types/react-native": "0.73.0",
    "typescript": "^5.3.0"
  },
  "private": true
}
EOF

echo "🧹 キャッシュのクリア..."
rm -rf .expo
rm -rf .metro-health-check*
rm -rf node_modules/.cache

echo "📝 クリーンアップレポートの作成..."
cat > CLEANUP_REPORT.md << 'EOF'
# Stilya MVP クリーンアップレポート

## 削除されたディレクトリ
- android/ (managed workflow維持のため)
- ios/ (managed workflow維持のため)
- src/batch/ (MVP段階では不要)
- src/store/ (状態管理はuseStateで対応)
- src/contexts/ (MVPでは簡略化)
- src/screens/report/ (分析機能は次フェーズ)
- src/utils/performance/ (パフォーマンス計測は後回し)

## 削除されたファイル
- analyticsService.ts (分析は次フェーズ)
- integratedRecommendationService.ts (推薦ロジックは簡略化)
- metro関連ファイル (設定の簡略化)

## 次のステップ
1. `npm install` で依存関係を再インストール
2. `npx expo start -c` でクリーンスタート
3. App_minimal.tsx をApp.tsxにリネームして最小構成でテスト

## MVP機能
- ✅ 基本的なスワイプUI
- ✅ Supabase認証
- ✅ 商品表示
- ✅ Yes/No記録
EOF

echo "✅ クリーンアップが完了しました！"
echo ""
echo "📋 次のステップ:"
echo "1. package.jsonのバックアップ: cp package.json package_original.json"
echo "2. 最小構成の適用: cp package_minimal.json package.json"
echo "3. 依存関係の再インストール: rm -rf node_modules package-lock.json && npm install"
echo "4. App.tsxの置き換え: cp App_minimal.tsx App.tsx"
echo "5. クリーンスタート: npx expo start -c"
