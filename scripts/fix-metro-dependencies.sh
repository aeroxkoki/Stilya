#!/bin/bash
# 最適化されたMetro依存関係設定スクリプト

echo "Installing and configuring Metro dependencies for Expo SDK 53..."

# キャッシュのクリア
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# Metro依存関係のインストール（必要最小限のみ）
npm install --save-dev metro@0.76.8 metro-config@0.76.8 metro-minify-terser@0.76.8
npm install --save-dev @expo/metro-config@^0.10.7

# Expoの設定プラグインを確認
npm install --save-dev @expo/config-plugins@~10.0.0

echo "Metro dependencies configured successfully."
