#!/bin/bash

# Stilya MVP緊急対応スクリプト
echo "🚨 Stilya MVP - 緊急起動対応"

# 1. 全プロセス停止
pkill -f node
pkill -f expo
pkill -f Metro

# 2. ポート解放
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19000 | xargs kill -9 2>/dev/null || true
lsof -ti:19001 | xargs kill -9 2>/dev/null || true

# 3. 最小限のクリーンアップ
rm -rf .expo
rm -rf node_modules/.cache

# 4. Expo開発サーバー起動（ローカルホストモード）
echo "📱 アプリを起動します..."
npx expo start --localhost --ios
