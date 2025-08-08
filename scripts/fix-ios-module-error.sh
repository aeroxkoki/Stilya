#!/bin/bash

# Fix iOS Module Map Error Script for Expo SDK 53
# This script fixes the "module map file not found" error in Xcode

echo "🔧 Starting iOS Module Map Fix for Expo SDK 53..."
echo "================================"

# Navigate to project directory
cd /Users/koki_air/Documents/GitHub/Stilya

# Step 1: Clean ALL Xcode caches
echo "Step 1: Deep cleaning all Xcode caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache
rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex
rm -rf ~/Library/Caches/com.apple.dt.Xcode
echo "✅ All Xcode caches cleaned"

# Step 2: Clean iOS folder completely
echo "Step 2: Cleaning iOS folder..."
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
rm -rf Stilya.xcworkspace/xcuserdata
rm -rf Stilya.xcodeproj/xcuserdata
echo "✅ iOS folder cleaned"

# Step 3: Clean CocoaPods cache
echo "Step 3: Cleaning CocoaPods cache..."
pod cache clean --all
rm -rf ~/Library/Caches/CocoaPods
echo "✅ CocoaPods cache cleaned"

# Step 4: Go back to project root and reinstall node modules
echo "Step 4: Reinstalling node modules..."
cd ..
rm -rf node_modules
npm install
echo "✅ Node modules reinstalled"

# Step 5: Run expo prebuild with clean flag
echo "Step 5: Running Expo prebuild (clean)..."
npx expo prebuild --clear --platform ios
echo "✅ Expo prebuild completed"

# Step 6: Navigate to iOS and update Podfile for M1 Mac and Expo SDK 53
echo "Step 6: Updating Podfile for M1 Mac and Expo SDK 53..."
cd ios

# Create a Ruby script to update Podfile
cat > update_podfile.rb << 'RUBY_SCRIPT'
require 'fileutils'

# Read the current Podfile
podfile_path = 'Podfile'
podfile_content = File.read(podfile_path)

# Ensure platform is set to iOS 15.1 (required for Expo SDK 53)
unless podfile_content.include?("platform :ios, '15.1'")
  podfile_content.gsub!(/platform :ios, ['"][\d.]+['"]/, "platform :ios, '15.1'")
end

# Ensure post_install block has necessary fixes
if podfile_content.include?('post_install do |installer|')
  # Check if our fixes are already there
  unless podfile_content.include?('ENABLE_USER_SCRIPT_SANDBOXING')
    # Insert our fixes into existing post_install block
    podfile_content.gsub!(/(post_install do \|installer\|.*?)(^end)/m) do |match|
      before = $1
      ending = $2
      
      fixes = <<-FIXES
  
  # Fix for Expo SDK 53 and M1 Mac
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Fix user script sandboxing issue
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      
      # Ensure iOS deployment target is correct
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      
      # M1 Mac architecture exclusion for simulator
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      
      # Fix module map issues
      config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
      config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
  
  # Fix for React-Core and other module issues
  installer.pods_project.build_configurations.each do |config|
    config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
  end
      FIXES
      
      before + fixes + "\n" + ending
    end
  end
else
  # Add new post_install block
  podfile_content += <<-BLOCK

post_install do |installer|
  react_native_post_install(installer)
  
  # Fix for Expo SDK 53 and M1 Mac
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Fix user script sandboxing issue
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      
      # Ensure iOS deployment target is correct
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      
      # M1 Mac architecture exclusion for simulator
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      
      # Fix module map issues
      config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
      config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
  
  # Fix for React-Core and other module issues
  installer.pods_project.build_configurations.each do |config|
    config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
  end
end
  BLOCK
end

# Write the updated Podfile
File.write(podfile_path, podfile_content)
puts "✅ Podfile updated successfully"
RUBY_SCRIPT

ruby update_podfile.rb
rm update_podfile.rb
echo "✅ Podfile configuration updated"

# Step 7: Install pods with proper configuration
echo "Step 7: Installing CocoaPods with proper configuration..."

# Ensure .xcode.env.local exists with correct node path
echo "export NODE_BINARY=$(which node)" > .xcode.env.local

# Deintegrate and reinstall pods
pod deintegrate
pod install --repo-update --verbose

echo "✅ Pods installed successfully"

# Step 8: Final Xcode project cleanup
echo "Step 8: Final Xcode project cleanup..."
cd ..

# Clean any remaining build artifacts
rm -rf ~/.xctoolchain
rm -rf ~/Library/Developer/Xcode/Archives

echo "✅ Final cleanup completed"

# Step 9: Provide instructions
echo ""
echo "================================"
echo "✅ iOS Module Map Fix Complete!"
echo "================================"
echo ""
echo "Next steps to build your app:"
echo ""
echo "1. Open Xcode with the WORKSPACE file (important!):"
echo "   cd ios && open Stilya.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   a. Wait for indexing to complete"
echo "   b. Select your target device (iPhone/Simulator)"
echo "   c. Clean Build Folder: Product → Clean Build Folder (Cmd+Shift+K)"
echo "   d. Build: Product → Build (Cmd+B)"
echo ""
echo "3. Alternative: Build from command line:"
echo "   npx expo run:ios --device"
echo "   or"
echo "   npx expo run:ios"
echo ""
echo "If you still encounter issues:"
echo "- Restart Xcode completely"
echo "- Restart your Mac"
echo "- Ensure you're using Xcode 15.2 or later"
echo "- Make sure you have the latest iOS SDKs installed"
echo ""
echo "================================"
