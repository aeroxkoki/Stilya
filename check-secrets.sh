#!/bin/bash

# GitHub Secrets設定確認スクリプト
# このスクリプトは設定すべきSecretsの一覧を表示します

echo "🔐 GitHub Secrets 設定確認"
echo "================================"
echo "以下のSecretsがGitHubリポジトリに設定されている必要があります："
echo ""

echo "1. EXPO_TOKEN"
echo "   説明: ExpoアカウントのAPIトークン"
echo "   値: expo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo ""

echo "2. ANDROID_KEYSTORE_BASE64"
echo "   説明: Androidアプリ署名用のKeystoreファイル(Base64エンコード済み)"
echo "   値: tEvrv3PcgY+eEcJngom01fTm4UHC/TP4+qYYR8DwKRcZqOguWn1C3RDT+..."
echo ""

echo "3. ANDROID_KEY_ALIAS"
echo "   説明: Keystoreで使用するキーのエイリアス名"
echo "   値: stilya-key-alias"
echo ""

echo "4. ANDROID_KEYSTORE_PASSWORD"
echo "   説明: Keystoreファイルのパスワード"
echo "   値: jpn3025Koki"
echo ""

echo "5. ANDROID_KEY_PASSWORD"
echo "   説明: Keystore内のキーのパスワード"
echo "   値: jpn3025Koki"
echo ""

echo "🔗 設定方法:"
echo "1. https://github.com/aeroxkoki/Stilya/settings/secrets/actions にアクセス"
echo "2. 'New repository secret' をクリック"
echo "3. 上記の各Secret名と値を設定"
echo ""

echo "📋 設定確認:"
echo "すべてのSecretsが設定されたら、このリポジトリにプッシュしてGitHub Actionsの動作を確認してください。"
echo ""

echo "❓ トラブルシューティング:"
echo "- ビルドが失敗する場合は、Secret名にタイポがないか確認"
echo "- EXPO_TOKENの有効期限を確認"
echo "- GitHub ActionsのログでDetailエラーメッセージを確認"
