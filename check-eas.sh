#!/bin/bash
# EAS CLI チェックスクリプト - GitHub Actions用

# エラーが発生したらスクリプトを停止
set -e

echo "=== EAS CLI チェック ==="

# Node.jsバージョンを確認
node_version=$(node -v)
echo "Node.js バージョン: $node_version"

# npm バージョンを確認
npm_version=$(npm -v)
echo "npm バージョン: $npm_version"

# Expo CLIの存在を確認
if ! command -v expo &> /dev/null
then
    echo "Expo CLI がインストールされていません。インストールを試みます..."
    npm install -g expo-cli
else
    expo_version=$(expo --version)
    echo "Expo CLI バージョン: $expo_version"
fi

# EAS CLIの存在を確認
if ! command -v eas &> /dev/null
then
    echo "EAS CLI がインストールされていません。インストールを試みます..."
    npm install -g eas-cli
else
    eas_version=$(eas --version)
    echo "EAS CLI バージョン: $eas_version"
fi

# もう一度バージョンを確認
echo "=== インストール後の確認 ==="
expo_version=$(npx expo --version)
echo "Expo CLI バージョン: $expo_version"
eas_version=$(npx eas --version)
echo "EAS CLI バージョン: $eas_version"

# ログイン状態を確認
echo "=== EAS アカウント確認 ==="
npx eas whoami || echo "EAS にログインしていませんが、コマンドは実行可能です"

echo "=== チェック完了 ==="
