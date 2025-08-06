#!/bin/bash

# Stilya iOS プロジェクト診断スクリプト
# "No such module 'Expo'" エラーの原因を特定します

echo "=== Stilya iOS プロジェクト診断 ==="
echo "現在時刻: $(date)"
echo ""

# カラー出力用の関数
print_success() {
    echo -e "\033[0;32m✓ $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m✗ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34mℹ $1\033[0m"
}

print_warning() {
    echo -e "\033[0;33m⚠ $1\033[0m"
}

# プロジェクトのルートディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

echo "=== 1. 基本情報 ==="
echo "プロジェクトディレクトリ: $(pwd)"
echo ""

echo "=== 2. Node.js環境 ==="
echo "Node.js バージョン: $(node --version)"
echo "npm バージョン: $(npm --version)"
echo ""

echo "=== 3. Expo/React Native バージョン ==="
if [ -f "package.json" ]; then
    echo "expo: $(grep '"expo":' package.json | grep -o '[0-9.^~]*')"
    echo "react-native: $(grep '"react-native":' package.json | grep -o '[0-9.^~]*')"
    echo "expo-dev-client: $(grep '"expo-dev-client":' package.json | grep -o '[0-9.^~]*')"
else
    print_error "package.jsonが見つかりません"
fi
echo ""

echo "=== 4. iOS ディレクトリの状態 ==="
if [ -d "ios" ]; then
    print_success "iOSディレクトリが存在します"
    
    # Podfileの確認
    if [ -f "ios/Podfile" ]; then
        print_success "Podfileが存在します"
        echo "  Podfileの最初の5行:"
        head -5 ios/Podfile | sed 's/^/    /'
    else
        print_error "Podfileが見つかりません"
    fi
    
    # Podfile.lockの確認
    if [ -f "ios/Podfile.lock" ]; then
        print_success "Podfile.lockが存在します"
        echo "  インストールされているPods数: $(grep -c "  - " ios/Podfile.lock)"
    else
        print_warning "Podfile.lockが見つかりません - pod installが必要です"
    fi
    
    # Podsディレクトリの確認
    if [ -d "ios/Pods" ]; then
        print_success "Podsディレクトリが存在します"
        
        # ExpoModulesProvider.swiftの確認
        if [ -f "ios/Pods/Target Support Files/Pods-Stilya/ExpoModulesProvider.swift" ]; then
            print_success "ExpoModulesProvider.swiftが存在します"
            
            # Expoモジュールのインポートを確認
            echo "  ExpoModulesProvider.swiftでインポートされているモジュール:"
            grep "^import" "ios/Pods/Target Support Files/Pods-Stilya/ExpoModulesProvider.swift" | head -10 | sed 's/^/    /'
        else
            print_error "ExpoModulesProvider.swiftが見つかりません"
        fi
        
        # Expo関連のPodを確認
        echo ""
        echo "  Expo関連のPods:"
        find ios/Pods -maxdepth 1 -name "Expo*" -type d 2>/dev/null | head -10 | sed 's/^/    /'
        find ios/Pods -maxdepth 1 -name "EX*" -type d 2>/dev/null | head -10 | sed 's/^/    /'
    else
        print_error "Podsディレクトリが見つかりません"
    fi
    
    # .xcworkspaceの確認
    if [ -f "ios/Stilya.xcworkspace/contents.xcworkspacedata" ]; then
        print_success "Stilya.xcworkspaceが存在します"
    else
        print_error "Stilya.xcworkspaceが見つかりません"
    fi
    
else
    print_error "iOSディレクトリが存在しません"
    print_warning "expo prebuild --iosを実行する必要があります"
fi
echo ""

echo "=== 5. AppDelegate.swiftの確認 ==="
if [ -f "ios/Stilya/AppDelegate.swift" ]; then
    print_success "AppDelegate.swiftが存在します"
    echo "  インポート文:"
    grep "^import" "ios/Stilya/AppDelegate.swift" | sed 's/^/    /'
else
    print_error "AppDelegate.swiftが見つかりません"
fi
echo ""

echo "=== 6. プロジェクト設定の確認 ==="
if [ -f "ios/Stilya.xcodeproj/project.pbxproj" ]; then
    print_success "project.pbxprojが存在します"
    
    # Framework Search Pathsの確認
    echo "  Framework Search Paths:"
    grep -A2 "FRAMEWORK_SEARCH_PATHS" "ios/Stilya.xcodeproj/project.pbxproj" | head -10 | sed 's/^/    /'
else
    print_error "project.pbxprojが見つかりません"
fi
echo ""

echo "=== 7. 診断結果 ==="
echo ""

# 問題の診断
PROBLEMS_FOUND=0

if [ ! -d "ios" ]; then
    print_error "iOSディレクトリが存在しません"
    echo "  → 解決策: npx expo prebuild --clean --ios を実行してください"
    PROBLEMS_FOUND=$((PROBLEMS_FOUND + 1))
elif [ ! -d "ios/Pods" ]; then
    print_error "Podsがインストールされていません"
    echo "  → 解決策: cd ios && pod install を実行してください"
    PROBLEMS_FOUND=$((PROBLEMS_FOUND + 1))
elif [ ! -f "ios/Pods/Target Support Files/Pods-Stilya/ExpoModulesProvider.swift" ]; then
    print_error "ExpoModulesProvider.swiftが生成されていません"
    echo "  → 解決策: cd ios && pod deintegrate && pod install を実行してください"
    PROBLEMS_FOUND=$((PROBLEMS_FOUND + 1))
fi

if [ $PROBLEMS_FOUND -eq 0 ]; then
    print_success "プロジェクト構造に明らかな問題は見つかりませんでした"
    echo ""
    echo "それでも'No such module Expo'エラーが発生する場合:"
    echo "1. Xcodeを完全に終了"
    echo "2. DerivedDataを削除: rm -rf ~/Library/Developer/Xcode/DerivedData/*"
    echo "3. ios/Stilya.xcworkspaceを開く（.xcodeprojではない）"
    echo "4. Clean Build Folder (Shift+Cmd+K)"
    echo "5. Build (Cmd+B)"
else
    echo ""
    print_warning "$PROBLEMS_FOUND 個の問題が見つかりました"
    echo ""
    echo "推奨される修正手順:"
    echo "1. ./scripts/fix-expo-module-error-root-cause.sh を実行"
    echo "   または"
    echo "2. 手動で上記の解決策を実行"
fi
