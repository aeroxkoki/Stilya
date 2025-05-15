#!/bin/bash
# fix-metro-dependencies.sh
# Metro関連の依存関係のバージョン矛盾を解決するスクリプト

echo "Installing and fixing Metro dependencies..."

# 必要なMetro関連パッケージを明示的にインストール
yarn add --dev metro@0.80.2 metro-react-native-babel-transformer@0.80.2 metro-source-map@0.80.2 metro-resolver@0.80.2

# 依存関係の更新とMetro設定の修正
yarn add --dev @expo/metro-config@~0.20.0 metro-config@0.80.2

# 環境の整理とキャッシュのクリア
rm -rf node_modules/.cache
yarn cache clean

echo "Metro dependencies fixed!"
