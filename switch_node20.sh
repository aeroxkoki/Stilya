#!/bin/bash

# Stilya - nodebrewでNode.js v20に切り替え

echo "🔧 nodebrewを使用してNode.js v20に切り替えます..."

# nodebrewの現在の状態を確認
echo "📋 現在のNode.jsバージョン:"
node --version

# nodebrewでv20を使用
echo "🔄 Node.js v20.18.1に切り替え中..."
nodebrew use v20.18.1

# nodebrewのパスを設定
export PATH=$HOME/.nodebrew/current/bin:$PATH

# 新しいバージョンを確認
echo "✅ 切り替え後のバージョン:"
$HOME/.nodebrew/current/bin/node --version

echo ""
echo "📝 以下のコマンドを実行して、パスを永続的に設定してください:"
echo ""
echo "# zshを使用している場合:"
echo "echo 'export PATH=\$HOME/.nodebrew/current/bin:\$PATH' >> ~/.zshrc"
echo "source ~/.zshrc"
echo ""
echo "# bashを使用している場合:"
echo "echo 'export PATH=\$HOME/.nodebrew/current/bin:\$PATH' >> ~/.bashrc"
echo "source ~/.bashrc"
echo ""
echo "# 設定後、以下のコマンドでプロジェクトを再起動:"
echo "cd /Users/koki_air/Documents/GitHub/Stilya"
echo "rm -rf node_modules package-lock.json .expo"
echo "npm install"
echo "npx expo start --clear"
