#!/bin/bash

# Docker Desktop Proxy Fix Script
# This script helps to temporarily disable proxy for Docker commands

echo "🔧 Dockerプロキシ設定の一時的な無効化スクリプト"
echo "================================================"

# プロキシ環境変数をクリア
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset NO_PROXY
unset no_proxy

echo "✅ プロキシ環境変数をクリアしました"

# Docker configにプロキシ無効設定を追加
mkdir -p ~/.docker
cat > ~/.docker/config.json.proxy-disabled << EOF
{
  "auths": {},
  "credsStore": "desktop",
  "currentContext": "desktop-linux",
  "proxies": {
    "default": {
      "httpProxy": "",
      "httpsProxy": "",
      "noProxy": "*"
    }
  }
}
EOF

# バックアップを作成
if [ -f ~/.docker/config.json ]; then
  cp ~/.docker/config.json ~/.docker/config.json.backup
  echo "✅ 既存のconfig.jsonをバックアップしました"
fi

# 新しい設定を適用
cp ~/.docker/config.json.proxy-disabled ~/.docker/config.json
echo "✅ プロキシ無効設定を適用しました"

echo ""
echo "📝 次のステップ:"
echo "1. Docker Desktopを再起動してください"
echo "2. 再起動後、以下のコマンドを実行してください:"
echo "   cd /Users/koki_air/Documents/GitHub/Stilya"
echo "   npm run supabase:start"
echo ""
echo "⚠️  元の設定に戻すには:"
echo "   cp ~/.docker/config.json.backup ~/.docker/config.json"
