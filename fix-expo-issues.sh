#\!/bin/bash

# エラー時に実行を停止
set -e

echo "🛠️ Stilyaプロジェクト修復スクリプト 🛠️"
echo "================================================="
echo "これからExpoの設定や依存関係の問題を解決します。"
echo "================================================="

# 現在の作業ディレクトリを確認
echo "📂 現在のディレクトリは $(pwd) です"

# ステップ1: 古いnode_modulesと依存関係を削除
echo "🧹 古いnode_modulesとロックファイルを削除しています..."
rm -rf node_modules
rm -f yarn.lock package-lock.json

# ステップ2: package.jsonを修正
echo "📝 package.jsonを修正しています..."
cat > package.json << 'JSONEOF'
{
  "name": "stilya",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "start:dev": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "NODE_OPTIONS=--no-warnings jest --config jest.config.js simple.test.js",
    "test:watch": "NODE_OPTIONS=--no-warnings jest --watch --config jest.config.js",
    "test:coverage": "NODE_OPTIONS=--no-warnings jest --coverage --config jest.config.js",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc",
    "docs": "node scripts/generate-docs.js",
    "docs:serve": "npx http-server ./docs/generated -o",
    "simple": "node start-app.js",
    "fix-deps": "sh ./fix-dependencies.sh",
    "eas:whoami": "eas whoami",
    "eas:build": "eas build",
    "eas:build:dev": "eas build --profile development",
    "eas:build:preview": "eas build --profile preview",
    "eas:build:prod": "eas build --profile production",
    "eas:update": "eas update",
    "eas:check": "eas --version && echo 'EAS CLI is installed correctly'",
    "postinstall": "echo 'Resolving peer dependencies with legacy compatibility'"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "@react-native-community/netinfo": "^11.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "@react-navigation/stack": "^7.0.0",
    "@supabase/supabase-js": "^2.39.3",
    "axios": "^1.6.7",
    "expo": "~53.0.0",
    "expo-application": "~5.8.0",
    "expo-device": "~5.8.0",
    "expo-image": "~1.10.0",
    "expo-linking": "~6.3.0",
    "expo-localization": "~14.8.0",
    "expo-modules-autolinking": "~2.1.0",
    "expo-notifications": "~0.30.0",
    "expo-secure-store": "~14.2.0",
    "expo-status-bar": "~2.2.0",
    "nativewind": "^4.0.1",
    "react": "19.0.0",
    "react-native": "0.73.4",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-safe-area-context": "4.9.0",
    "react-native-screens": "~3.29.0",
    "react-native-toast-message": "^2.2.0",
    "react-native-url-polyfill": "^2.0.0",
    "tailwind-merge": "^3.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@babel/plugin-transform-runtime": "^7.24.0",
    "@expo/config-plugins": "~10.0.0",
    "@expo/metro-config": "~0.20.0",
    "@expo/prebuild-config": "~9.0.0",
    "@testing-library/jest-native": "^5.4.2",
    "@testing-library/react-native": "^12.3.0",
    "@types/jest": "^29.5.12",
    "@types/react": "~19.0.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "babel-plugin-module-resolver": "^5.0.0",
    "babel-plugin-transform-remove-console": "^6.9.4",
    "babel-plugin-transform-remove-debugger": "^6.9.4",
    "better-docs": "^2.7.3",
    "eas-cli": "^5.9.1",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "http-server": "^14.1.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-expo": "~53.0.0",
    "jsdoc": "^4.0.2",
    "prettier": "^3.2.5",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "private": true
}
JSONEOF

# ステップ3: app.config.tsを修正
echo "📝 app.config.tsを修正しています..."
cat > app.config.ts << 'TSEOF'
import { ExpoConfig } from 'expo/config';
import appJson from './app.json';

// app.jsonの内容を使用する統合設定
export default (): ExpoConfig => {
  return appJson.expo;
};
TSEOF

# ステップ4: app.config.jsを退避
echo "📝 app.config.jsをバックアップとして移動しています..."
if [ -f "app.config.js" ]; then
  mv app.config.js app.config.js.bak
fi

# ステップ5: 依存関係のクリーンインストール
echo "📦 依存関係を再インストールしています..."
echo "このコマンドを実行してください: npm install"
echo "または: yarn install"

# ステップ6: Expoプロジェクトの再構築
echo "🔄 Expoプロジェクトを再構築しています..."
echo "依存関係のインストールが完了したら、次のコマンドを実行してください: npx expo prebuild --clean"

# ステップ7: GitHubにプッシュするための準備
echo "🚀 GitHubへの変更をコミットする準備ができました"
echo "インストールと再構築が完了したら、次のコマンドでコミット・プッシュしてください:"
echo "git add ."
echo "git commit -m \"Fix: Resolve Expo and Autolinking configuration issues\""
echo "git push origin main"

echo "================================================="
echo "修復スクリプトが完了しました。"
echo "上記のコマンドを順番に実行して、プロジェクトを完全に修復してください。"
echo "================================================="
