#!/bin/bash

# 環境変数のチェックスクリプト

echo "Checking Rakuten API environment variables..."
echo ""

# .envファイルから楽天API関連の変数を読み込み
if [ -f .env ]; then
    echo "Reading from .env file:"
    grep "RAKUTEN" .env
    echo ""
else
    echo ".env file not found!"
fi

# 実際の環境変数を確認
echo "Current environment variables:"
echo "EXPO_PUBLIC_RAKUTEN_APP_ID: ${EXPO_PUBLIC_RAKUTEN_APP_ID:-Not set}"
echo "EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID: ${EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID:-Not set}"
echo "RAKUTEN_APP_ID: ${RAKUTEN_APP_ID:-Not set}"
echo "RAKUTEN_AFFILIATE_ID: ${RAKUTEN_AFFILIATE_ID:-Not set}"
echo ""

# Expoの設定を確認
echo "Checking app.config.js..."
if [ -f app.config.js ]; then
    echo "app.config.js exists"
    grep -A 3 "rakuten" app.config.js || echo "No 'rakuten' found in app.config.js"
else
    echo "app.config.js not found!"
fi
