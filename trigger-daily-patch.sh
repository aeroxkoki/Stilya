#!/bin/bash

# GitHub Actions Manual Workflow Trigger Script
# 日次パッチを手動で実行するためのスクリプト

echo "🚀 GitHub Actions - Daily Maintenance Patch 手動実行"
echo "================================================"
echo ""
echo "このスクリプトは GitHub Actions の Daily Maintenance Patch ワークフローを手動で実行します。"
echo ""
echo "実行方法:"
echo "1. GitHub にアクセス: https://github.com/aeroxkoki/Stilya/actions/workflows/daily-patch.yml"
echo "2. 'Run workflow' ボタンをクリック"
echo "3. Branch: main を選択"
echo "4. Dry run mode: false を選択（本番実行の場合）"
echo "5. 'Run workflow' ボタンをクリック"
echo ""
echo "または、GitHub CLIがインストールされている場合:"
echo "  gh workflow run daily-patch.yml --repo aeroxkoki/Stilya"
echo ""
echo "最新の実行状態を確認:"
echo "  https://github.com/aeroxkoki/Stilya/actions/workflows/daily-patch.yml"
echo ""
echo "================================================"
echo ""
echo "代わりにローカルで日次パッチを実行しますか？ (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "📦 ローカルで日次パッチを実行中..."
    cd /Users/koki_air/Documents/GitHub/Stilya
    npm run daily-patch
else
    echo "ℹ️ GitHub Actions での実行をお待ちください。"
    echo "実行状態: https://github.com/aeroxkoki/Stilya/actions"
fi
