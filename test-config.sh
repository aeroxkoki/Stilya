#!/bin/bash

# Stilya Config Test Script
echo "Stilya 設定ファイルテストスクリプト"

# JSONLint がなければインストール
if ! command -v npx jsonlint-cli &> /dev/null; then
  echo "JSONLint-CLI をインストールしています..."
  yarn add -D jsonlint-cli || npm install --save-dev jsonlint-cli
fi

# 設定ファイルの検証
echo "eas.json を検証中..."
npx jsonlint-cli eas.json || {
  echo "eas.json にフォーマット問題があります。修正中..."
  node -e "const fs=require('fs');const content=fs.readFileSync('eas.json','utf8');fs.writeFileSync('eas.json',JSON.stringify(JSON.parse(content),null,2));"
  echo "eas.json を修正しました。"
}

echo "app.json を検証中..."
npx jsonlint-cli app.json || {
  echo "app.json にフォーマット問題があります。修正中..."
  node -e "const fs=require('fs');const content=fs.readFileSync('app.json','utf8');fs.writeFileSync('app.json',JSON.stringify(JSON.parse(content),null,2));"
  echo "app.json を修正しました。"
}

echo "app.config.js を検証中..."
node -c app.config.js || {
  echo "app.config.js に問題があります。修正中..."
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
  echo "app.config.js を修正しました。"
}

echo "検証が完了しました！ローカルビルドを試すには:"
echo "  npx eas-cli build --platform android --profile ci --local"
