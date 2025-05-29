#!/bin/bash

# Stilya - Node.js v20セットアップスクリプト
# このスクリプトは、nvmをインストールし、Node.js v20を設定します

echo "🔧 Stilya - Node.js v20セットアップを開始します..."

# nvmがインストールされているか確認
if ! command -v nvm &> /dev/null; then
    echo "📦 nvmがインストールされていません。インストールを開始します..."
    
    # nvmインストール（公式インストールスクリプト）
    echo "📥 nvmをダウンロードしています..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # シェル設定を再読み込み
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    echo "✅ nvmのインストールが完了しました"
else
    echo "✅ nvmは既にインストールされています"
fi

echo ""
echo "📝 以下のコマンドを手動で実行してください："
echo ""
echo "# 1. 新しいターミナルを開くか、以下を実行してnvmを有効化:"
echo "source ~/.bashrc"
echo "# または"
echo "source ~/.zshrc"
echo ""
echo "# 2. Node.js v20をインストール:"
echo "nvm install 20"
echo "nvm use 20"
echo "nvm alias default 20"
echo ""
echo "# 3. インストールを確認:"
echo "node --version"
echo ""
echo "# 4. プロジェクトの依存関係を再インストール:"
echo "cd /Users/koki_air/Documents/GitHub/Stilya"
echo "rm -rf node_modules package-lock.json .expo"
echo "npm install"
echo "npx expo start --clear"
echo ""
echo "💡 ヒント: nvmが認識されない場合は、新しいターミナルウィンドウを開いてください"
