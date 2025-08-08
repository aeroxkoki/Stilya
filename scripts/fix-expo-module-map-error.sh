#!/bin/bash

# Expo SDK 53 ModuleMap Error Fix Script
# This script fixes the module map error and import issues for Expo SDK 53

echo "==================================================================================="
echo "🔧 Expo SDK 53 Module Map Error Fix"
echo "==================================================================================="
echo ""

cd /Users/koki_air/Documents/GitHub/Stilya

# Step 1: Fix AppDelegate.swift import statement
echo "🔧 Step 1: Fixing AppDelegate.swift imports..."
if [ -f "ios/Stilya/AppDelegate.swift" ]; then
    # Replace 'import Expo' with 'import ExpoModulesCore'
    sed -i '' 's/^import Expo$/import ExpoModulesCore/' ios/Stilya/AppDelegate.swift
    echo "✅ Fixed import statement in AppDelegate.swift"
fi

# Step 2: Clean build folder
echo ""
echo "🔧 Step 2: Cleaning build folders..."
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/Stilya-*
echo "✅ Build folders cleaned"

# Step 3: Reinstall Pods with modular headers
echo ""
echo "🔧 Step 3: Reinstalling Pods with modular headers..."
cd ios

# Add modular headers configuration to Podfile
cat > Podfile.temp << 'EOF'
require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")

require 'json'
podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}

ENV['RCT_NEW_ARCH_ENABLED'] = '0' if podfile_properties['newArchEnabled'] == 'false'
ENV['EX_DEV_CLIENT_NETWORK_INSPECTOR'] = podfile_properties['EX_DEV_CLIENT_NETWORK_INSPECTOR']

platform :ios, podfile_properties['ios.deploymentTarget'] || '15.1'
install! 'cocoapods',
  :deterministic_uuids => false

prepare_react_native_project!

# Add this line to enable modular headers globally
use_modular_headers!

target 'Stilya' do
  use_expo_modules!

  if ENV['EXPO_USE_COMMUNITY_AUTOLINKING'] == '1'
    config_command = ['node', '-e', "process.argv=['', '', 'config'];require('@react-native-community/cli').run()"];
  else
    config_command = [
      'npx',
      'expo-modules-autolinking',
      'react-native-config',
      '--json',
      '--platform',
      'ios'
    ]
  end

  config = use_native_modules!(config_command)

  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    :privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] != 'false',
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true',
    )

    # This is necessary for Xcode 14, because it signs resource bundles by default
    # when building for devices.
    installer.target_installation_results.pod_target_installation_results
      .each do |pod_name, target_installation_result|
      target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
        resource_bundle_target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
    
    # Fix for Expo modules
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['DEFINES_MODULE'] = 'YES'
        config.build_settings['SWIFT_VERSION'] = '5.0'
        config.build_settings['ENABLE_BITCODE'] = 'NO'
      end
    end
  end
end
EOF

# Backup original Podfile
cp Podfile Podfile.backup
mv Podfile.temp Podfile

# Clean Pods
rm -rf Pods
rm -f Podfile.lock

# Install Pods
pod install --repo-update

echo "✅ Pods reinstalled with modular headers"

# Step 4: Fix the import in AppDelegate if needed
echo ""
echo "🔧 Step 4: Final check and fix..."
cd ..

# Create a fixed version of AppDelegate.swift
cat > ios/Stilya/AppDelegate.swift << 'EOF'
import ExpoModulesCore
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
EOF

echo "✅ AppDelegate.swift fixed"

echo ""
echo "==================================================================================="
echo "✨ 修正完了！"
echo "==================================================================================="
echo ""
echo "📱 次のステップ："
echo "  1. Xcodeを再起動"
echo "  2. Product > Clean Build Folder (Shift+Cmd+K)"
echo "  3. ios/Stilya.xcworkspace を開く"
echo "  4. Product > Build (Cmd+B)"
echo ""
echo "⚠️  もしまだエラーが続く場合："
echo "  - Xcodeで Pods プロジェクトを選択"
echo "  - Build Settings > Swift Compiler > Module Name が正しく設定されているか確認"
echo "  - Build Settings > Build Options > Enable Modules を YES に設定"
echo ""
