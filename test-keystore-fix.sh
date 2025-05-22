#!/bin/bash

# Stilya Keystore Fix Test Script
# このスクリプトは修正されたビルド設定をテストします

echo "🚀 Stilya Keystore Fix Test"
echo "=================================="

# EAS Build設定をチェック
echo "📋 eas.json設定確認中..."
if grep -q "credentialsSource.*local" eas.json; then
    echo "✅ credentialsSource: local が設定されています"
else
    echo "❌ credentialsSource設定に問題があります"
fi

# Keystoreファイルの存在確認
echo "🔑 Keystoreファイル確認中..."
if [ -f "android/app/stilya-keystore.jks" ]; then
    echo "✅ Keystoreファイルが存在します"
    ls -la android/app/stilya-keystore.jks
else
    echo "⚠️  Keystoreファイルが見つかりません"
fi

# Android build.gradle設定確認
echo "📦 build.gradle設定確認中..."
if grep -q "signingConfig signingConfigs.release" android/app/build.gradle; then
    echo "✅ Release signing configが設定されています"
else
    echo "❌ Release signing config設定に問題があります"
fi

# 環境変数確認（GitHub Actionsで使用される）
echo "🔧 GitHub Actions環境変数確認中..."
required_vars=(
    "ANDROID_KEYSTORE_BASE64"
    "ANDROID_KEY_ALIAS" 
    "ANDROID_KEYSTORE_PASSWORD"
    "ANDROID_KEY_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️  ${var} 環境変数が設定されていません（GitHub Secretsで設定してください）"
    else
        echo "✅ ${var} 環境変数が設定されています"
    fi
done

echo ""
echo "🎯 修正概要:"
echo "1. eas.json: credentialsSource: local を追加"
echo "2. build.gradle: release署名設定を追加"
echo "3. app.config.ts: android.package設定を削除（ネイティブ設定を優先）"
echo "4. GitHub Actions: 環境変数とkeystore作成を修正"
echo ""
echo "📝 次のステップ:"
echo "1. GitHub Secretsで以下の変数が設定されていることを確認:"
echo "   - EXPO_TOKEN"
echo "   - ANDROID_KEYSTORE_BASE64"
echo "   - ANDROID_KEY_ALIAS"
echo "   - ANDROID_KEYSTORE_PASSWORD" 
echo "   - ANDROID_KEY_PASSWORD"
echo "2. 変更をGitHubにpushしてビルドをテスト"
echo ""
echo "✅ 修正完了！"
