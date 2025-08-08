#\!/bin/bash

echo "🔧 iOS Build Complete Fix - Starting..."

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 1. 完全なクリーンアップ
echo "🧹 Step 1: Complete cleanup..."
rm -rf node_modules
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf .expo
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 2. npm cache clean
echo "🧹 Step 2: Cleaning npm cache..."
npm cache clean --force

# 3. package.jsonのExpoバージョンを固定
echo "📦 Step 3: Fixing Expo version in package.json..."
npm install expo@53.0.0 --save-exact

# 4. 依存関係の再インストール
echo "📦 Step 4: Reinstalling dependencies..."
npm install

# 5. iOS用のPodのインストール
echo "📱 Step 5: Installing CocoaPods dependencies..."
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update

# 6. プロジェクトルートに戻る
cd ..

echo "✅ iOS Build fix complete\!"
