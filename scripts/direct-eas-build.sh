#!/bin/bash
# direct-eas-build.sh
# ローカル環境でEASビルドを直接実行するスクリプト

set -e

echo "🚀 EASビルドを直接実行します..."

# 前提条件の確認
if ! which eas >/dev/null; then
    echo "❌ EAS CLIがインストールされていません。yarn global add eas-cli@7.3.0 を実行してください。"
    exit 1
fi

# Expoログイン状態確認
eas whoami || {
    echo "❌ Expoにログインしていません。eas login を実行してください。"
    exit 1
}

# 依存関係の修正(実行済みか確認)
if [ ! -f node_modules/.build_fixed ]; then
    echo "📦 依存関係を修正します..."
    bash ./scripts/fix-metro-dependencies.sh
    touch node_modules/.build_fixed
fi

# キャッシュクリア
echo "🧹 キャッシュをクリア..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf .expo/cache 2>/dev/null || true
rm -rf .metro-cache 2>/dev/null || true

# プロファイル選択
echo "📱 ビルドプロファイルを選択してください:"
echo "1) ci (CI用内部テスト)"
echo "2) development (開発用)"
echo "3) preview (プレビュー)"
echo "4) production (本番)"
read -p "選択 (デフォルト: 2): " profile_choice

case $profile_choice in
    1)
        PROFILE="ci"
        ;;
    3)
        PROFILE="preview"
        ;;
    4)
        PROFILE="production"
        ;;
    *)
        PROFILE="development"
        ;;
esac

# プラットフォーム選択
echo "📱 ビルドプラットフォームを選択してください:"
echo "1) Android"
echo "2) iOS"
echo "3) 両方"
read -p "選択 (デフォルト: 1): " platform_choice

case $platform_choice in
    2)
        PLATFORM="ios"
        ;;
    3)
        PLATFORM="all"
        ;;
    *)
        PLATFORM="android"
        ;;
esac

echo "🚀 ${PROFILE}プロファイルで${PLATFORM}向けビルドを開始します..."

# EAS環境変数設定 (CIプロファイルの場合はJavaScriptバンドルをスキップ)
if [ "$PROFILE" = "ci" ]; then
    export EAS_SKIP_JAVASCRIPT_BUNDLING=1
fi

# ビルド実行
eas build --platform $PLATFORM --profile $PROFILE

echo "✅ ビルドリクエストが送信されました。進捗はEASダッシュボードで確認できます。"
echo "https://expo.dev/accounts/aeroxkoki/projects/stilya/builds"
