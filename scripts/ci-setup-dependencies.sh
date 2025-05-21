#!/bin/bash
# ci-setup-dependencies.sh
# CI環境用のExpo SDK 53依存関係セットアップ（2025年5月最適化版）

set -e  # エラーで停止する

echo "🚀 Stilya - CI環境用依存関係セットアップを開始します..."

# クリーンアップ
echo "🧹 キャッシュをクリーンアップ中..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache || true
rm -rf .expo/cache || true
rm -rf ~/.metro-cache || true
rm -rf .metro-cache || true

# npmrc設定
echo "📝 npmrc設定を最適化中..."
cat > .npmrc << EOF
cache=false
prefer-offline=false
fund=false
audit=false
loglevel=error
save-exact=true
EOF

# 基本依存関係のインストール
echo "📦 依存関係をインストール中..."
npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# 必須の依存関係を明示的に再インストール
echo "🔄 Metro関連パッケージを再インストール中..."
npm install --no-save \
  metro@0.77.0 \
  metro-core@0.77.0 \
  metro-config@0.77.0 \
  metro-runtime@0.77.0 \
  metro-source-map@0.77.0 \
  metro-resolver@0.77.0 \
  @expo/metro-config@0.9.0 \
  @babel/runtime@7.27.1

# Metro互換性の修正を適用
echo "🔧 Metro互換性の修正を適用中..."
chmod +x ./scripts/fix-github-actions-metro.sh
./scripts/fix-github-actions-metro.sh

# TerminalReporterの設定
echo "📝 TerminalReporterを設定中..."
chmod +x ./scripts/create-terminal-reporter.sh
./scripts/create-terminal-reporter.sh

# Android用のアセットディレクトリを準備
echo "📁 Android用アセットディレクトリを準備中..."
mkdir -p android/app/src/main/assets
touch android/app/src/main/assets/index.android.bundle
echo "// Empty bundle for CI build - Generated $(date)" > android/app/src/main/assets/index.android.bundle

# dedupe実行
echo "🧩 依存関係ツリーを最適化中..."
npm dedupe

echo "✅ Stilya - CI環境用依存関係のセットアップが完了しました！"
