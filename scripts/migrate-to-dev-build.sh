#!/bin/bash
# scripts/migrate-to-dev-build.sh

echo "🚀 Stilya ExpoGo → Development Build Migration"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Validate environment
echo -e "${YELLOW}Step 1: Validating environment...${NC}"
./scripts/validate-environment.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Environment validation failed. Please fix the issues above.${NC}"
    exit 1
fi

# Step 2: Clean state
echo -e "${YELLOW}Step 2: Cleaning project state...${NC}"
./scripts/clean-state.sh

# Step 3: Install dependencies
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install

# Step 4: Check react-native-url-polyfill
echo -e "${YELLOW}Step 4: Verifying critical dependencies...${NC}"
npm ls react-native-url-polyfill @react-native-async-storage/async-storage @supabase/supabase-js

# Step 5: Test network connectivity
echo -e "${YELLOW}Step 5: Testing Supabase connectivity...${NC}"
if command -v node &> /dev/null; then
    node scripts/test-network.js
else
    echo -e "${YELLOW}⚠️  Node not found in PATH, skipping network test${NC}"
fi

# Step 6: Choose platform
echo ""
echo -e "${GREEN}Environment setup complete!${NC}"
echo ""
echo "Choose your platform to build:"
echo "1) iOS"
echo "2) Android"
echo "3) Both"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${YELLOW}Building for iOS...${NC}"
        ./scripts/build-ios-dev.sh
        ;;
    2)
        echo -e "${YELLOW}Building for Android...${NC}"
        ./scripts/build-android-dev.sh
        ;;
    3)
        echo -e "${YELLOW}Building for both platforms...${NC}"
        ./scripts/build-ios-dev.sh
        echo ""
        ./scripts/build-android-dev.sh
        ;;
    *)
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Migration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. If the build succeeded, your app should be running on the simulator/emulator"
echo "2. Test the authentication flow to ensure Supabase is working correctly"
echo "3. Check the console logs for any errors"
echo ""
echo "Troubleshooting:"
echo "- iOS: Check Xcode console for detailed logs"
echo "- Android: Run 'adb logcat -s ReactNative:V ReactNativeJS:V' for logs"
echo ""
