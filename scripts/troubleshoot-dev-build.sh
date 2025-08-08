#!/bin/bash

# 開発ビルドトラブルシューティングスクリプト

echo "🔍 Stilya開発ビルドトラブルシューティング開始..."
echo "================================================"

# 1. 環境変数の確認
echo "📋 環境変数を確認中..."
if [ -f .env ]; then
    echo "✅ .envファイルが存在します"
    # 必要な環境変数の確認
    required_vars=("EXPO_PUBLIC_SUPABASE_URL" "EXPO_PUBLIC_SUPABASE_ANON_KEY")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            echo "✅ $var が設定されています"
        else
            echo "❌ $var が設定されていません"
        fi
    done
else
    echo "❌ .envファイルが見つかりません"
fi

# 2. Expo CLIとEAS CLIのバージョン確認
echo ""
echo "📦 CLIバージョンを確認中..."
echo "Expo CLI:"
npx expo --version
echo "EAS CLI:"
npx eas-cli --version

# 3. プロジェクトの整合性チェック
echo ""
echo "🔧 プロジェクトの整合性を確認中..."
npx expo doctor || echo "⚠️ expo doctorで問題が検出されました"

# 4. ネットワーク設定の確認
echo ""
echo "🌐 ネットワーク設定を確認中..."
# ローカルIPアドレスの取得
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi
echo "ローカルIPアドレス: $LOCAL_IP"

# 5. 開発サーバーの起動方法を表示
echo ""
echo "🚀 開発サーバーの起動方法:"
echo "================================================"
echo "1. LAN経由（推奨）:"
echo "   npm run start:lan"
echo ""
echo "2. トンネル経由（LANが使えない場合）:"
echo "   npm run start:tunnel"
echo ""
echo "3. 通常の開発モード:"
echo "   npm run dev"
echo ""

# 6. 実機テストの手順
echo "📱 実機テストの手順:"
echo "================================================"
echo "1. 開発ビルドのインストール:"
echo "   - QRコードをスキャン"
echo "   - Expo Goアプリではなく、開発ビルドアプリを使用"
echo ""
echo "2. 開発サーバーへの接続:"
echo "   - 実機と開発マシンが同じWi-Fiネットワークに接続されていることを確認"
echo "   - ファイアウォールでポート8081がブロックされていないことを確認"
echo ""

# 7. トラブルシューティングのヒント
echo "💡 トラブルシューティングのヒント:"
echo "================================================"
echo "• キャッシュのクリア: npm run clear-cache"
echo "• フルリセット: npm run full-reset"
echo "• 開発ビルドの再作成: npm run eas-build-development"
echo "• ログの確認: eas build:list --status=in-progress"
echo ""

# 8. 現在の開発ビルドの状態を確認
echo "🏗️ 最新の開発ビルドを確認中..."
npx eas build:list --limit=5 --json | jq -r '.[] | select(.profile == "development") | "\(.createdAt) - \(.platform) - \(.status)"' || echo "ビルド情報の取得に失敗しました"

echo ""
echo "✅ トラブルシューティング完了"
echo "================================================"