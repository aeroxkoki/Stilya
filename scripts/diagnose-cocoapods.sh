#!/bin/bash

# Stilya iOS CocoaPods Diagnostic Script
# This script diagnoses and attempts to fix CocoaPods issues

echo "===== Stilya iOS CocoaPods Diagnostic ====="
echo "Running comprehensive diagnostics..."
echo

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

# Function to print section headers
print_header() {
    echo
    echo "========================================="
    echo "$1"
    echo "========================================="
}

# Check Ruby version
print_header "Ruby Environment"
echo "Ruby version:"
ruby --version
echo
echo "Ruby path:"
which ruby
echo
echo "Gem environment:"
gem env | grep -E "(RUBY VERSION|GEM PATHS)"

# Check CocoaPods
print_header "CocoaPods Status"
echo "CocoaPods version:"
pod --version
echo
echo "CocoaPods path:"
which pod
echo
echo "CocoaPods plugins:"
pod plugins installed

# Check Node.js
print_header "Node.js Environment"
echo "Node version:"
node --version
echo
echo "Node path:"
which node
echo
echo "npm version:"
npm --version

# Check Xcode
print_header "Xcode Configuration"
echo "Xcode version:"
xcodebuild -version
echo
echo "Xcode path:"
xcode-select -p
echo
echo "Available simulators:"
xcrun simctl list devices available | grep -E "(iPhone|iPad)" | head -5

# Check iOS directory status
print_header "iOS Directory Status"
cd ios
echo "Current directory: $(pwd)"
echo
echo "Directory contents:"
ls -la
echo
echo "Checking file permissions:"
if [ -d "Pods" ]; then
    echo "Pods directory: $(stat -f "%Sp %u:%g" Pods)"
fi
if [ -f "Podfile.lock" ]; then
    echo "Podfile.lock: $(stat -f "%Sp %u:%g" Podfile.lock)"
fi

# Check for problematic files
print_header "Checking for Issues"
echo "Checking build directory size:"
if [ -d "build" ]; then
    echo "Build directory file count: $(find build -type f | wc -l)"
    echo "Build directory size: $(du -sh build | cut -f1)"
fi

# Attempt to diagnose pod install issues
print_header "Pod Install Diagnostic"
echo "Running pod install with verbose output..."
echo
echo "First, updating repo..."
pod repo update --verbose 2>&1 | tail -20
echo
echo "Attempting pod install..."
pod install --verbose 2>&1 | tail -50

# Check result
if [ $? -eq 0 ]; then
    echo
    echo "✅ Pod install completed successfully!"
else
    echo
    echo "❌ Pod install failed!"
    echo
    echo "Common solutions:"
    echo "1. Clean installation:"
    echo "   sudo rm -rf Pods Podfile.lock build"
    echo "   pod cache clean --all"
    echo "   pod install"
    echo
    echo "2. Update CocoaPods:"
    echo "   sudo gem install cocoapods"
    echo
    echo "3. Use system Ruby:"
    echo "   /usr/bin/ruby -S pod install"
    echo
    echo "4. Reset CocoaPods:"
    echo "   pod deintegrate"
    echo "   pod setup"
    echo "   pod install"
fi

# Return to project root
cd ..

print_header "Summary"
echo "Diagnostic complete. Please review the output above for any issues."
echo
echo "Key things to check:"
echo "- Ruby version compatibility"
echo "- CocoaPods version (should be latest)"
echo "- File permissions in ios directory"
echo "- Xcode command line tools installation"
