#!/bin/bash
# GitHub Actions CI環境専用のnpm設定スクリプト
# unsafe-permエラーを直接的に解決します

echo "CI環境用のnpm設定を適用します..."

# GitHub Actions環境チェック
if [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ]; then
  echo "CI環境を検出しました"
else
  echo "このスクリプトはCI環境専用です。ローカル環境では必要ありません。"
  echo "CI=true を設定して実行するには: CI=true $0"
  if [ "$1" != "--force" ]; then
    exit 0
  fi
  echo "--force オプションが指定されました。処理を続行します。"
fi

# CI環境用の.npmrcファイルを直接作成
cat > .npmrc << EOF
# CI環境用の安全なnpm設定
# unsafe-permオプションの代替設定
ignore-scripts=false
fund=false
audit=false
update-notifier=false
# 並列処理制限
maxsockets=3
# レガシーピア依存関係の互換性
legacy-peer-deps=true
strict-peer-dependencies=false
# パフォーマンス設定
prefer-offline=true
# エラーログレベル
loglevel=error
# GitHub Actionsのキャッシュ最適化
cache-min=3600
force=true
EOF

# npmパッケージのキャッシュを設定（失敗してもエラーにしない）
npm config set cache-min 3600 || true
npm config set maxsockets 3 || true
npm config set loglevel error || true
npm config set force true || true
npm config set ignore-scripts false || true
npm config set fund false || true
npm config set audit false || true
npm config set update-notifier false || true
npm config set legacy-peer-deps true || true
npm config set strict-peer-dependencies false || true

echo "✅ CI環境用npm設定が完了しました"
echo "作成された.npmrcファイル:"
cat .npmrc
