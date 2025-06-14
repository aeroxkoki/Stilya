#!/bin/bash
# GitHub Actions統合マイグレーションスクリプト

echo "🔄 GitHub Actions統合マイグレーション開始..."

WORKFLOW_DIR=".github/workflows"
DEPRECATED_DIR=".github/workflows/deprecated"

# deprecatedディレクトリの作成
mkdir -p "$DEPRECATED_DIR"

# 無効化するワークフローのリスト
WORKFLOWS_TO_DEPRECATE=(
    "daily-product-sync.yml"
    "daily-sync.yml"
    "extended-mvp-sync.yml"
    "mvp-brand-sync.yml"
    "phase2-daily-sync.yml"
)

echo "📋 統合計画:"
echo "  - 新規作成: unified-product-sync.yml (Phase 3対応)"
echo "  - 保持: build.yml"
echo "  - 無効化: ${#WORKFLOWS_TO_DEPRECATE[@]}個のワークフロー"
echo ""

# 各ワークフローを無効化
for workflow in "${WORKFLOWS_TO_DEPRECATE[@]}"; do
    if [ -f "$WORKFLOW_DIR/$workflow" ]; then
        echo "⏸️  $workflow を無効化中..."
        
        # バックアップとして移動
        mv "$WORKFLOW_DIR/$workflow" "$DEPRECATED_DIR/$workflow.backup"
        
        # 無効化されたワークフローを作成
        cat > "$WORKFLOW_DIR/$workflow" << EOF
# このワークフローは統合版に移行されました
# 新しいワークフロー: unified-product-sync.yml

name: [DEPRECATED] $(basename "$workflow" .yml)

on:
  workflow_dispatch:
    inputs:
      message:
        description: 'このワークフローは廃止されました'
        required: true
        default: 'Use unified-product-sync.yml instead'

jobs:
  deprecated:
    runs-on: ubuntu-latest
    steps:
      - name: Deprecated Notice
        run: |
          echo "❌ このワークフローは廃止されました" >> \$GITHUB_STEP_SUMMARY
          echo "" >> \$GITHUB_STEP_SUMMARY
          echo "## 📢 重要なお知らせ" >> \$GITHUB_STEP_SUMMARY
          echo "" >> \$GITHUB_STEP_SUMMARY
          echo "このワークフローは **unified-product-sync.yml** に統合されました。" >> \$GITHUB_STEP_SUMMARY
          echo "" >> \$GITHUB_STEP_SUMMARY
          echo "### 🚀 新しいワークフローの特徴:" >> \$GITHUB_STEP_SUMMARY
          echo "- 50-60ブランド対応（Phase 3）" >> \$GITHUB_STEP_SUMMARY
          echo "- 20-40代女性向け最適化" >> \$GITHUB_STEP_SUMMARY
          echo "- 統合された全機能" >> \$GITHUB_STEP_SUMMARY
          echo "- 柔軟な実行モード" >> \$GITHUB_STEP_SUMMARY
          echo "" >> \$GITHUB_STEP_SUMMARY
          echo "**Actions → Unified Product Sync - Phase 3** を使用してください。" >> \$GITHUB_STEP_SUMMARY
          exit 1
EOF
        echo "  ✅ $workflow を無効化しました"
    fi
done

echo ""
echo "📊 マイグレーション結果:"
echo "  - 統合版ワークフロー: unified-product-sync.yml ✅"
echo "  - ビルドワークフロー: build.yml (変更なし) ✅"
echo "  - 無効化済み: ${#WORKFLOWS_TO_DEPRECATE[@]}個"
echo "  - バックアップ保存先: $DEPRECATED_DIR/"
echo ""
echo "🎉 マイグレーション完了!"
echo ""
echo "📌 次のステップ:"
echo "1. git add ."
echo "2. git commit -m 'feat: GitHub Actions統合 - Phase 3対応 (50-60ブランド)'"
echo "3. git push origin main"
echo "4. GitHub Actionsで新しいワークフローを確認"
