#!/bin/bash

echo "🔧 Android環境変数を設定します..."

# .zshrcのバックアップ
cp ~/.zshrc ~/.zshrc.backup.$(date +%Y%m%d%H%M%S)

# 環境変数を追加
cat >> ~/.zshrc << 'EOL'

# Android SDK Configuration
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
EOL

echo "✅ 環境変数を.zshrcに追加しました"
echo "📌 設定を反映するため、以下のコマンドを実行してください："
echo "   source ~/.zshrc"
