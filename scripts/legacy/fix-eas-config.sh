#!/bin/bash

# Stilya Configuration Fix Script
# このスクリプトはEASビルド時の設定ファイル問題を解決します

echo "Stilya 設定ファイル修正スクリプトを実行します..."

# JSONlint-cli をインストール
echo "JSONlint-cli をインストールしています..."
yarn add -D jsonlint-cli || npm install --save-dev jsonlint-cli

# app.config.ts を削除し、app.config.js のみを使用
echo "app.config.ts を削除しています..."
rm -f app.config.ts

# app.config.js を確認・修正
echo "app.config.js を確認中..."
cat > app.config.js << 'EOL'
const { withPlugins } = require('@expo/config-plugins');
const appJson = require('./app.json');

// app.jsonの内容を使用する統合設定
module.exports = () => {
  const config = withPlugins(appJson.expo, [
    // expo-linkingプラグインを明示的に設定
    ['expo-linking', {
      prefixes: ['stilya://', 'https://stilya.app']
    }]
  ]);

  return config;
};
EOL

# app.json を確認・修正
echo "app.json を確認中..."
cat > app.json << 'EOL'
{
  "expo": {
    "name": "Stilya",
    "slug": "stilya",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "owner": "aeroxkoki",
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/beb25e0f-344b-4f2f-8b64-20614b9744a3",
      "fallbackToCacheTimeout": 0
    },
    "projectId": "beb25e0f-344b-4f2f-8b64-20614b9744a3",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.stilya.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.stilya.app",
      "versionCode": 3
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      "expo-notifications",
      "expo-linking",
      "expo-localization"
    ],
    "jsEngine": "hermes"
  }
}
EOL

# eas.json を確認・修正
echo "eas.json を確認中..."
cat > eas.json << 'EOL'
{
  "cli": {
    "version": "^16.6.0",
    "requireCommit": false,
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    },
    "ci": {
      "android": {
        "buildType": "apk",
        "withoutCredentials": true,
        "cache": {
          "key": "gradle-v1",
          "paths": [
            "~/.gradle/caches",
            "~/.gradle/wrapper"
          ]
        },
        "env": {
          "JAVA_TOOL_OPTIONS": "-XX:MaxHeapSize=6g -Dfile.encoding=UTF-8"
        }
      },
      "ios": {
        "simulator": true
      },
      "autoIncrement": true,
      "distribution": "internal",
      "extends": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./path-to-google-service-account.json",
        "track": "production"
      }
    }
  }
}
EOL

# package.json にバリデーションスクリプトを追加
echo "package.json にバリデーションスクリプトを追加します..."
# sedコマンドでpackage.jsonを修正する
sed -i'.bak' -e 's/"eas:check": "eas --version && echo '\''EAS CLI is installed correctly'\''",/"eas:check": "eas --version \&\& echo '\''EAS CLI is installed correctly'\''",\n    "eas:validate": "npx jsonlint-cli eas.json \&\& npx jsonlint-cli app.json \&\& node -c app.config.js",\n    "eas:build:ci": "npm run eas:validate \&\& npx eas-cli build --platform android --profile ci --non-interactive",/g' package.json

echo "GitHub Actions ワークフローファイルを修正します..."
mkdir -p .github/workflows
cat > .github/workflows/eas-build.yml << 'EOL'
name: EAS Build

on:
  push:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  build:
    name: Build App
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: 🏗 Setup repo
        uses: actions/checkout@v3
        with:
          fetch-depth: 0 # 完全な履歴を取得

      - name: 🏗 Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: yarn

      - name: 📦 Install dependencies
        run: yarn install --frozen-lockfile

      - name: 🗑️ Remove app.config.ts
        run: rm -f app.config.ts

      - name: 🧹 Clean Git state if needed
        run: |
          # Git設定を行う
          git config --global user.name "GitHub Action"
          git config --global user.email "action@github.com"
          
          # 変更がある場合はまずコミットする
          if [[ -n $(git status --porcelain) ]]; then
            echo "Changes detected, committing them first..."
            git add -A
            git commit -m "Auto-commit by GitHub Actions [skip ci]"
          else
            echo "Git working directory is clean."
          fi
          
          # リモートの変更を取得
          git fetch origin
          
          # 現在のブランチ名を取得
          CURRENT_BRANCH=${GITHUB_REF#refs/heads/}
          
          # リモートの変更を取り込む
          git pull --rebase origin $CURRENT_BRANCH || echo "No changes to pull or rebase failed"
          
          # Pull Requestではなく、直接pushの場合のみpushを実行
          if [[ "${{ github.event_name }}" != "pull_request" && -n $(git log origin/$CURRENT_BRANCH..$CURRENT_BRANCH) ]]; then
            echo "Pushing changes to origin..."
            git push origin $CURRENT_BRANCH
          else
            echo "No changes to push or Pull Request中のため変更はpushせず"
          fi

      - name: 🏗 Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: 📝 Configure EAS Project
        run: |
          # プロジェクトの状態を確認
          echo "Checking EAS project configuration..."
          npx eas-cli whoami
          
          # 必要に応じてプロジェクトを登録/更新
          npx eas-cli project:info || (
            echo "Project not found or not properly linked. Creating/linking project..."
            npx eas-cli init --id beb25e0f-344b-4f2f-8b64-20614b9744a3 --non-interactive || true
          )

      - name: 🚀 Build App (Android)
        run: yarn eas:build:ci

      # iOS is disabled until we fix the issues with iOS build
      # - name: 🚀 Build App (iOS)
      #   run: npx eas-cli build --platform ios --profile ci --non-interactive
EOL

echo "設定ファイルの修正が完了しました！"
echo "次のコマンドを実行して変更をコミットしてください:"
echo "  git add -A && git commit -m \"Fix configuration files for EAS build\" && git push"
echo "現在の設定でローカルビルドをテストするには:"
echo "  yarn eas:validate && npx eas-cli build --platform android --profile ci --local"
