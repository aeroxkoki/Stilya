#!/bin/bash
# fix-metro-dependencies.sh
# Metro関連の依存関係のバージョン矛盾を解決するスクリプト

echo "Installing and fixing Metro dependencies..."

# Expoのバージョンに適合するMetroバージョンを使用
# metro-react-native-babel-transformerの最大バージョンは0.77.0
yarn add --dev metro@0.76.0 metro-config@0.76.0 metro-runtime@0.76.0

# 関連するMetroパッケージを同じバージョンに合わせる
yarn add --dev metro-react-native-babel-transformer@0.76.0 metro-source-map@0.76.0 metro-resolver@0.76.0

# Expo Metro設定も同期
yarn add --dev @expo/metro-config@~0.10.0

# 環境の整理とキャッシュのクリア
rm -rf node_modules/.cache
yarn cache clean

echo "Metro dependencies fixed!"
