#\!/bin/bash
# eas-build-debug.sh - EASビルドのデバッグヘルパー

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Stilya EAS ビルドデバッグ =====${NC}"

# Expoのバージョン情報を確認
echo -e "${YELLOW}Expoの環境情報:${NC}"
npx expo --version
npx expo-cli --version 2>/dev/null || echo "expo-cliはインストールされていません"

# EAS CLIのバージョン確認
echo -e "${YELLOW}EAS CLIの情報:${NC}"
npx eas-cli --version
npx eas-cli whoami

# プロジェクト設定の確認
echo -e "${YELLOW}プロジェクト情報:${NC}"
echo "app.json 内の projectId:"
cat app.json | grep -A 3 "eas" || echo "projectIdが見つかりません"

# 依存関係の確認
echo -e "${YELLOW}重要な依存関係のバージョン:${NC}"
echo "- React: $(node -e "console.log(require('./package.json').dependencies.react)")"
echo "- React Native: $(node -e "console.log(require('./package.json').dependencies['react-native'])")"
echo "- Expo: $(node -e "console.log(require('./package.json').dependencies.expo)")"
echo "- @babel/runtime: $(node -e "console.log(require('./package.json').dependencies['@babel/runtime'] || require('./package.json').devDependencies['@babel/runtime'] || 'インストールされていません')")"

# GitHub環境の確認
if [ -n "$GITHUB_ACTIONS" ]; then
    echo -e "${YELLOW}GitHub Actions 環境変数:${NC}"
    echo "- GITHUB_REF: $GITHUB_REF"
    echo "- GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
    echo "- GITHUB_ACTOR: $GITHUB_ACTOR"
    
    echo -e "${YELLOW}EAS 環境変数:${NC}"
    echo "- EXPO_TOKEN: ${EXPO_TOKEN:+設定済み}"
    echo "- EAS_SKIP_JAVASCRIPT_BUNDLING: $EAS_SKIP_JAVASCRIPT_BUNDLING"
fi

# その他の環境変数
echo -e "${YELLOW}Node設定:${NC}"
echo "- NODE_OPTIONS: $NODE_OPTIONS"
echo "- NODE_ENV: $NODE_ENV"

# 推奨コマンド
echo -e "${GREEN}=== トラブルシューティング推奨コマンド ===${NC}"
echo "1. キャッシュをクリア:"
echo "   yarn cache clean && rm -rf node_modules/.cache"
echo ""
echo "2. 依存関係を再インストール:"
echo "   rm -rf node_modules && yarn install"
echo ""
echo "3. @babel/runtimeを固定:"
echo "   yarn add --dev @babel/runtime@7.27.1 --exact"
echo ""
echo "4. より詳しい環境準備:"
echo "   yarn eas:prep"
echo ""
echo "5. ローカルで適切にEASビルドを実行:"
echo "   EAS_SKIP_JAVASCRIPT_BUNDLING=1 eas build --platform android --profile ci --local"
