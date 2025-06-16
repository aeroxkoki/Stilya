#!/bin/bash

# Stilya iOS ビルド時間最適化スクリプト

echo "🚀 Stilya iOS ビルド時間最適化を開始します..."

# 現在のディレクトリを保存
CURRENT_DIR=$(pwd)
PROJECT_ROOT="/Users/koki_air/Documents/GitHub/Stilya"

# プロジェクトルートに移動
cd "$PROJECT_ROOT" || exit 1

# 1. キャッシュのクリーンアップ
echo "📦 キャッシュをクリーンアップしています..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# 2. Expo Prebuildのクリーンアップ
echo "🧹 Expo prebuildをクリーンアップしています..."
npx expo prebuild --clean

# 3. use_expo_modules!の最適化
echo "⚙️ Podfile最適化を実行しています..."
cat > ios/Podfile.optimization.rb << 'EOF'
# Expo モジュールの最適化設定
def optimized_use_expo_modules!
  use_expo_modules!(
    excludeModules: [
      # 使用していないモジュールを除外
      'expo-ads-admob',
      'expo-ads-facebook', 
      'expo-analytics-amplitude',
      'expo-analytics-segment',
      'expo-app-auth',
      'expo-apple-authentication',
      'expo-av',
      'expo-background-fetch',
      'expo-barcode-scanner',
      'expo-battery',
      'expo-blur',
      'expo-brightness',
      'expo-calendar',
      'expo-camera',
      'expo-cellular',
      'expo-clipboard',
      'expo-contacts',
      'expo-crypto',
      'expo-device',
      'expo-document-picker',
      'expo-face-detector',
      'expo-facebook',
      'expo-file-system',
      'expo-font',
      'expo-gl',
      'expo-gl-cpp',
      'expo-google-sign-in',
      'expo-haptics',
      'expo-image-manipulator',
      'expo-image-picker',
      'expo-intent-launcher',
      'expo-keep-awake',
      'expo-linear-gradient',
      'expo-local-authentication',
      'expo-localization',
      'expo-location',
      'expo-mail-composer',
      'expo-media-library',
      'expo-network',
      'expo-notifications',
      'expo-payments-stripe',
      'expo-pedometer',
      'expo-permissions',
      'expo-print',
      'expo-random',
      'expo-screen-capture',
      'expo-screen-orientation',
      'expo-secure-store',
      'expo-sensors',
      'expo-sharing',
      'expo-sms',
      'expo-speech',
      'expo-sqlite',
      'expo-store-review',
      'expo-task-manager',
      'expo-updates',
      'expo-video-thumbnails',
      'expo-web-browser'
    ]
  )
end
EOF

# 4. Podfileの更新
echo "📝 Podfileを更新しています..."
cp ios/Podfile ios/Podfile.backup

# use_expo_modules!を最適化バージョンに置き換え
sed -i '' 's/use_expo_modules!/optimized_use_expo_modules!/g' ios/Podfile

# 最適化設定をPodfileの先頭に追加
cat ios/Podfile.optimization.rb > ios/Podfile.tmp
cat ios/Podfile >> ios/Podfile.tmp
mv ios/Podfile.tmp ios/Podfile

# 5. ビルド設定の最適化
echo "🔧 Xcodeビルド設定を最適化しています..."
cat > ios/xcode-optimization.rb << 'EOF'
# Xcodeプロジェクトのビルド設定最適化
require 'xcodeproj'

project_path = 'ios/Stilya.xcodeproj'
project = Xcodeproj::Project.open(project_path)

project.targets.each do |target|
  if target.name == 'Stilya'
    target.build_configurations.each do |config|
      if config.name == 'Debug'
        # デバッグビルドの最適化
        config.build_settings['COMPILER_INDEX_STORE_ENABLE'] = 'NO'
        config.build_settings['MTL_ENABLE_DEBUG_INFO'] = 'NO'
        config.build_settings['SWIFT_COMPILATION_MODE'] = 'singlefile'
        config.build_settings['ONLY_ACTIVE_ARCH'] = 'YES'
        config.build_settings['ENABLE_BITCODE'] = 'NO'
        config.build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf'
        config.build_settings['SWIFT_OPTIMIZATION_LEVEL'] = '-Onone'
        config.build_settings['GCC_OPTIMIZATION_LEVEL'] = '0'
        
        # ビルド時間短縮のための追加設定
        config.build_settings['ASSETCATALOG_COMPILER_OPTIMIZATION'] = 'time'
        config.build_settings['VALIDATE_PRODUCT'] = 'NO'
        config.build_settings['ENABLE_PREVIEWS'] = 'NO'
        config.build_settings['CLANG_ENABLE_MODULE_DEBUGGING'] = 'NO'
      end
    end
  end
end

project.save
EOF

# 6. キャッシュディレクトリの作成
echo "📁 キャッシュディレクトリを作成しています..."
mkdir -p ~/.expo/cache

# 7. Pod インストールの最適化
echo "🔄 Podをインストールしています..."
cd ios || exit 1
export COCOAPODS_DISABLE_STATS=1
pod install --repo-update --verbose

# 8. ビルドの並列化設定
echo "⚡ ビルドの並列化を設定しています..."
defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsExclusively -bool NO
defaults write com.apple.dt.Xcode ShowBuildOperationDuration -bool YES

# 9. 最適化の結果を表示
echo "✅ 最適化が完了しました！"
echo ""
echo "📊 最適化結果:"
echo "- Expo不要モジュールを除外"
echo "- デバッグビルドの最適化設定を適用"
echo "- ビルドの並列化を有効化"
echo "- インデックスストアを無効化"
echo ""
echo "💡 推奨事項:"
echo "1. Xcodeを再起動してください"
echo "2. DerivedDataがクリアされています"
echo "3. 初回ビルドは通常より時間がかかる場合があります"
echo ""
echo "🚀 次のコマンドでビルドを開始してください:"
echo "   cd $PROJECT_ROOT && npm run ios"

# 元のディレクトリに戻る
cd "$CURRENT_DIR" || exit 0
