#!/bin/bash

echo "🔧 CocoaPods UTF-8 環境設定修正"
echo "================================"

# プロファイルファイルのバックアップを作成
if [ -f ~/.profile ]; then
    cp ~/.profile ~/.profile.backup
    echo "✅ .profileのバックアップを作成しました"
fi

# UTF-8設定を追加
echo "" >> ~/.profile
echo "# UTF-8 encoding for CocoaPods" >> ~/.profile
echo "export LANG=en_US.UTF-8" >> ~/.profile
echo "export LC_ALL=en_US.UTF-8" >> ~/.profile

echo "✅ ~/.profileにUTF-8設定を追加しました"

# .bash_profileにも追加（macOSでより確実）
if [ -f ~/.bash_profile ]; then
    echo "" >> ~/.bash_profile
    echo "# UTF-8 encoding for CocoaPods" >> ~/.bash_profile
    echo "export LANG=en_US.UTF-8" >> ~/.bash_profile
    echo "export LC_ALL=en_US.UTF-8" >> ~/.bash_profile
    echo "✅ ~/.bash_profileにもUTF-8設定を追加しました"
fi

# .zshrcにも追加（新しいmacOSのデフォルト）
if [ -f ~/.zshrc ]; then
    echo "" >> ~/.zshrc
    echo "# UTF-8 encoding for CocoaPods" >> ~/.zshrc
    echo "export LANG=en_US.UTF-8" >> ~/.zshrc
    echo "export LC_ALL=en_US.UTF-8" >> ~/.zshrc
    echo "✅ ~/.zshrcにもUTF-8設定を追加しました"
fi

echo ""
echo "🎯 次のステップ："
echo "1. 新しいターミナルウィンドウを開く"
echo "2. 以下のコマンドを実行："
echo ""
echo "cd /Users/koki_air/Documents/GitHub/Stilya"
echo "npm run ios"
echo ""
echo "または、Xcodeプロジェクトを直接開く場合："
echo "cd /Users/koki_air/Documents/GitHub/Stilya/ios"
echo "open Stilya.xcodeproj"
