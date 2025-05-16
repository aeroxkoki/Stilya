#!/bin/bash
# GitHub Actions環境向けnpm初期化スクリプト
# unsafe-permエラーの根本対処

echo "CIビルドのためのnpm環境を初期化しています..."

# npmをクリーンインストールするためのディレクトリ準備
if [ -d "node_modules" ]; then
  echo "node_modulesディレクトリが存在します。"
  echo "パッケージのロック状態をクリアします..."
  rm -f node_modules/.yarn-integrity || true
  rm -f node_modules/.package-lock.json || true
fi

# 直接npmrc設定を適用
./ci-direct-npmrc.sh --force

# npmのグローバル設定も修正（CI環境でのみ実行）
if [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ]; then
  echo "CI環境を検出: グローバルnpm設定も更新します"
  
  # ホームディレクトリに.npmrcファイルを作成
  cat > $HOME/.npmrc << EOF
# CI環境用のグローバルnpm設定
unsafe-perm=
ignore-scripts=false
fund=false
audit=false
update-notifier=false
maxsockets=3
legacy-peer-deps=true
strict-peer-dependencies=false
prefer-offline=true
loglevel=error
cache-min=3600
force=true
EOF

  echo "✅ グローバルnpm設定が完了しました"
  echo "グローバル.npmrc:"
  cat $HOME/.npmrc
fi

# パッケージのインストール方法についてのヒント
echo ""
echo "▶ インストールコマンド推奨順:"
echo "  1. npm ci"
echo "  2. npm install --no-package-lock"
echo "  3. yarn install --force"
echo ""
echo "✅ npm初期化完了"
