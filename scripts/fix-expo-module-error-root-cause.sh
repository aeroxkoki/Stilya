#!/bin/bash

# Stilya iOS "No such module 'Expo'" エラー根本解決スクリプト
# このスクリプトは、Expo prebuildを使用してiOSプロジェクトを再生成し、問題を根本的に解決します

echo "=== Stilya iOS Expo Module Error 根本解決スクリプト ==="
echo "このスクリプトは、iOSプロジェクトを再生成して問題を解決します"
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

echo ""
echo "=== STEP 1: プロジェクトのクリーンアップ ==="
echo ""

# node_modulesの再インストール
print_info "node_modulesを再インストール中..."
rm -rf node_modules
npm install

if [ $? -eq 0 ]; then
    print_success "node_modulesのインストールが完了しました"
else
    print_error "node_modulesのインストールに失敗しました"
    exit 1
fi

echo ""
echo "=== STEP 2: 既存のiOSプロジェクトのバックアップと削除 ==="
echo ""

# iOSディレクトリのバックアップ（念のため）
if [ -d "ios" ]; then
    print_info "既存のiOSディレクトリをバックアップ中..."
    mv ios ios.backup.$(date +%Y%m%d%H%M%S)
    print_success "iOSディレクトリをバックアップしました"
fi

echo ""
echo "=== STEP 3: Expo Prebuildでプロジェクトを再生成 ==="
echo ""

print_info "expo prebuildを実行中..."
npx expo prebuild --clean --ios

if [ $? -eq 0 ]; then
    print_success "iOSプロジェクトの再生成が完了しました"
else
    print_error "iOSプロジェクトの再生成に失敗しました"
    exit 1
fi

echo ""
echo "=== STEP 4: CocoaPodsの設定 ==="
echo ""

cd ios

# Pod installの実行
print_info "pod installを実行中..."
pod install

if [ $? -eq 0 ]; then
    print_success "pod installが完了しました"
else
    print_error "pod installに失敗しました"
    # pod repoのアップデートを試す
    print_warning "pod repoをアップデートして再試行します..."
    pod repo update
    pod install
fi

echo ""
echo "=== STEP 5: 検証 ==="
echo ""

# 重要なファイルの存在確認
if [ -f "Stilya.xcworkspace" ]; then
    print_success "Stilya.xcworkspaceが存在します"
else
    print_error "Stilya.xcworkspaceが見つかりません"
fi

if [ -f "Pods/Target Support Files/Pods-Stilya/ExpoModulesProvider.swift" ]; then
    print_success "ExpoModulesProvider.swiftが正しく生成されています"
else
    print_error "ExpoModulesProvider.swiftが見つかりません"
fi

# Expoフレームワークの確認
if [ -d "Pods/Expo" ]; then
    print_success "Expoフレームワークが存在します"
else
    print_warning "Expoフレームワークが個別のディレクトリとして存在しません（これは正常な場合があります）"
fi

echo ""
echo "=== 完了 ==="
echo ""
print_success "iOSプロジェクトの再生成が完了しました！"
echo ""
echo "次の手順:"
echo "1. Xcodeを完全に終了してください"
echo "2. ターミナルで以下のコマンドを実行："
echo "   rm -rf ~/Library/Developer/Xcode/DerivedData/*"
echo "3. Xcodeで ios/Stilya.xcworkspace を開いてください（.xcodeprojではありません）"
echo "4. Product > Clean Build Folder (Shift+Cmd+K) を実行"
echo "5. Product > Build (Cmd+B) を実行"
echo ""
print_info "ビルドエラーが続く場合は、Xcodeの Scheme > Edit Scheme > Build で"
print_info "すべてのターゲットが正しく設定されているか確認してください"
