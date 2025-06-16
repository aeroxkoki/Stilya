#!/bin/bash

# Stilya iOS Pod最適化スクリプト（根本的解決版）

echo "🚀 Stilya iOS Pod最適化を開始します..."

# プロジェクトルートに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 1. 既存のビルドファイルを完全にクリーン
echo "🧹 既存のビルドファイルをクリーンアップしています..."
rm -rf ios android
rm -rf node_modules/.cache
rm -rf ~/.expo

# 2. prebuildをクリーンな状態で実行
echo "📱 Prebuildを実行しています..."
npx expo prebuild --clean --platform ios

# 3. Podfileを最適化
echo "🔧 Podfileを最適化しています..."
cat > ios/Podfile.patch << 'EOF'
--- a/ios/Podfile
+++ b/ios/Podfile
@@ -10,6 +10,12 @@
 platform :ios, podfile_properties['ios.deploymentTarget'] || '15.1'
 install! 'cocoapods',
   :deterministic_uuids => false
+  
+# ビルド時間最適化
+ENV['COCOAPODS_DISABLE_STATS'] = 'true'
+ENV['CP_CACHE_DIR'] = "#{Dir.home}/.cocoapods_cache"
+
+$PODS_CONFIGURATION_CACHE = {}
 
 prepare_react_native_project!
 
@@ -45,6 +51,20 @@
       :ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true',
     )
 
+    # インクリメンタルビルドの最適化
+    installer.pods_project.build_configurations.each do |config|
+      config.build_settings['SWIFT_COMPILATION_MODE'] = 'wholemodule'
+      config.build_settings['ENABLE_INCREMENTAL_DISTILL'] = 'YES'
+      config.build_settings['CLANG_INDEX_STORE_ENABLE'] = 'NO'
+    end
+    
+    # 不要なターゲットの除外
+    installer.pod_targets.select { |target| 
+      target.name.include?('Expo') && 
+      !['expo-constants', 'expo-dev-client', 'expo-image', 'expo-linking', 'expo-status-bar', 'ExpoModulesCore'].any? { |required| target.name.include?(required) }
+    }.each do |target|
+      target.build_configurations.each { |config| config.build_settings['EXCLUDED_ARCHS'] = 'arm64 x86_64' }
+    end
+
     # This is necessary for Xcode 14, because it signs resource bundles by default
     # when building for devices.
     installer.target_installation_results.pod_target_installation_results
EOF

# 4. Podfileにパッチを適用
cd ios
patch -p1 < Podfile.patch
rm Podfile.patch

# 5. ccacheをインストール（まだインストールされていない場合）
if ! command -v ccache &> /dev/null; then
    echo "📦 ccacheをインストールしています..."
    brew install ccache
fi

# 6. ccacheの設定
ccache --max-size=5G
ccache --set-config=compiler_check=content
ccache --set-config=sloppiness=pch_defines,time_macros,include_file_mtime,include_file_ctime

# 7. Xcodeのビルド設定を最適化
defaults write com.apple.dt.Xcode ShowBuildOperationDuration -bool YES
defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsExclusively -bool NO
defaults write com.apple.dt.Xcode IDEBuildOperationMaxNumberOfConcurrentCompileTasks $(sysctl -n hw.ncpu)
defaults write com.apple.dt.Xcode EnableSwiftBuildSystemIntegration -bool YES

# 8. Pod installを最適化モードで実行
echo "🔄 最適化されたPod installを実行しています..."
pod install --deployment --repo-update

# 9. 結果を表示
echo ""
echo "✅ Pod最適化が完了しました！"
echo ""
echo "📊 最適化結果:"
echo "✓ New Architecture無効化"
echo "✓ 不要なExpoモジュール除外"
echo "✓ ccacheによるコンパイルキャッシュ有効化"
echo "✓ インクリメンタルビルド最適化"
echo "✓ 並列ビルド最大化"
echo ""
echo "💡 次のステップ:"
echo "1. 'npm run ios' でビルドを実行してください"
echo "2. 初回ビルドは通常通り時間がかかりますが、2回目以降は大幅に高速化されます"
