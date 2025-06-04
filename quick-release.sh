#!/bin/bash

# Stilya クイックリリース準備スクリプト
# 実機テストからストア申請まで一連の作業をサポート

echo "🚀 Stilya クイックリリース準備"
echo "================================"

# 関数定義
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 完了"
    else
        echo "❌ $1 失敗"
        exit 1
    fi
}

# メニュー表示
show_menu() {
    echo ""
    echo "何を実行しますか？"
    echo "1) 環境設定確認"
    echo "2) 実機テスト（トンネルモード）"
    echo "3) EASプレビュービルド作成"
    echo "4) 本番環境切り替え"
    echo "5) ストア用スクリーンショット準備"
    echo "6) 全ての準備を実行"
    echo "0) 終了"
    echo ""
    read -p "選択してください (0-6): " choice
}

# 1. 環境設定確認
check_env() {
    echo ""
    echo "📋 環境設定を確認中..."
    
    # .envファイルの存在確認
    if [ -f .env ]; then
        echo "✅ .envファイル: 存在"
        
        # 重要な環境変数の確認
        if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
            echo "✅ Supabase URL: 設定済み"
        else
            echo "⚠️  Supabase URL: 未設定"
        fi
        
        if grep -q "EXPO_PUBLIC_DEMO_MODE=false" .env; then
            echo "✅ デモモード: 無効（本番モード）"
        else
            echo "⚠️  デモモード: 有効（テストモード）"
        fi
    else
        echo "❌ .envファイルが見つかりません"
        echo "   .env.exampleをコピーして設定してください"
    fi
    
    # node_modulesの確認
    if [ -d "node_modules" ]; then
        echo "✅ 依存関係: インストール済み"
    else
        echo "⚠️  依存関係: 未インストール"
        echo "   'npm install'を実行してください"
    fi
}

# 2. 実機テスト（トンネルモード）
start_tunnel_test() {
    echo ""
    echo "🌐 トンネルモードで実機テストを開始..."
    echo "QRコードが表示されたら、Expo Goアプリでスキャンしてください"
    echo ""
    npx expo start --tunnel --clear
}

# 3. EASビルド作成
create_eas_build() {
    echo ""
    echo "🏗️  EASビルドを作成中..."
    echo ""
    
    # プラットフォーム選択
    echo "ビルドするプラットフォームを選択:"
    echo "1) iOS"
    echo "2) Android"
    echo "3) 両方"
    read -p "選択 (1-3): " platform_choice
    
    case $platform_choice in
        1)
            echo "📱 iOSビルドを作成中..."
            eas build --platform ios --profile preview
            ;;
        2)
            echo "🤖 Androidビルドを作成中..."
            eas build --platform android --profile preview
            ;;
        3)
            echo "📱🤖 iOS/Android両方のビルドを作成中..."
            eas build --platform all --profile preview
            ;;
        *)
            echo "無効な選択です"
            ;;
    esac
}

# 4. 本番環境切り替え
switch_to_production() {
    echo ""
    echo "🔄 本番環境に切り替え中..."
    
    # .envファイルのバックアップ
    if [ -f .env ]; then
        cp .env .env.backup
        echo "✅ .envファイルをバックアップしました (.env.backup)"
    fi
    
    # 本番環境設定の作成
    cat > .env.production << EOF
# Stilya 本番環境設定
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_SUPABASE_URL=your-production-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
EXPO_PUBLIC_APP_VERSION=1.0.0
EOF
    
    echo "✅ .env.productionファイルを作成しました"
    echo "⚠️  Supabase URLとキーを本番用に更新してください"
    echo ""
    read -p "今すぐ.env.productionを編集しますか？ (y/n): " edit_choice
    
    if [ "$edit_choice" = "y" ]; then
        ${EDITOR:-nano} .env.production
    fi
}

# 5. スクリーンショット準備
prepare_screenshots() {
    echo ""
    echo "📸 スクリーンショット準備..."
    
    # ディレクトリ作成
    mkdir -p assets/store_assets/ios/screenshots
    mkdir -p assets/store_assets/android/screenshots
    
    echo "✅ スクリーンショット用ディレクトリを作成しました"
    echo ""
    echo "📌 必要なスクリーンショット:"
    echo "   1. スワイプ画面（商品表示中）"
    echo "   2. 商品詳細画面"
    echo "   3. おすすめ商品画面"
    echo "   4. プロフィール画面"
    echo "   5. スタイル診断結果画面"
    echo ""
    echo "🎯 推奨サイズ:"
    echo "   iOS: 1284x2778px (iPhone 15 Pro Max)"
    echo "   Android: 1080x1920px"
}

# 6. 全ての準備を実行
run_all() {
    echo ""
    echo "🎯 全ての準備を順番に実行します..."
    
    check_env
    
    echo ""
    read -p "続行しますか？ (y/n): " continue_choice
    if [ "$continue_choice" != "y" ]; then
        echo "中断しました"
        return
    fi
    
    switch_to_production
    prepare_screenshots
    
    echo ""
    echo "✅ 準備が完了しました！"
    echo ""
    echo "次のステップ:"
    echo "1. .env.productionを本番用に編集"
    echo "2. 実機テストを実行"
    echo "3. EASビルドを作成"
    echo "4. TestFlightまたはGoogle Play内部テストに配布"
}

# メイン処理
while true; do
    show_menu
    
    case $choice in
        1) check_env ;;
        2) start_tunnel_test ;;
        3) create_eas_build ;;
        4) switch_to_production ;;
        5) prepare_screenshots ;;
        6) run_all ;;
        0) 
            echo "👋 終了します"
            exit 0
            ;;
        *)
            echo "無効な選択です"
            ;;
    esac
    
    echo ""
    read -p "Enterキーを押してメニューに戻る..."
done
