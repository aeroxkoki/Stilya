#!/bin/bash

# Expo/EASのキャッシュディレクトリをバックアップし削除
echo "== バックアップキャッシュディレクトリの作成 =="
mkdir -p backup-expo-cache
mv .expo .eas-cli backup-expo-cache/ 2>/dev/null || true

# node_modules内のキャッシュも確認
if [ -d "node_modules/.expo" ]; then
  mv node_modules/.expo backup-expo-cache/ 2>/dev/null || true
fi

# 古いプロジェクトIDを新しいプロジェクトIDに置換
OLD_ID="c2a98f3b-d8dc-4bc3-9b53-8ff63bc2cfd9"
NEW_ID="beb25e0f-344b-4f2f-8b64-20614b9744a3"

echo "== 古いプロジェクトID: $OLD_ID"
echo "== 新しいプロジェクトID: $NEW_ID"

# JSONファイルを検索
echo "== JSONファイルの検索と更新 =="
find . -type f -name "*.json" -not -path "*/node_modules/*" -not -path "*/backup-expo-cache/*" | xargs grep -l "$OLD_ID" | while read file; do
  echo "更新ファイル: $file"
  sed -i.bak "s|$OLD_ID|$NEW_ID|g" "$file"
  rm -f "$file.bak"
done

# YAMLファイルを検索
echo "== YAMLファイルの検索と更新 =="
find . -type f -name "*.yml" -not -path "*/node_modules/*" -not -path "*/backup-expo-cache/*" | xargs grep -l "$OLD_ID" | while read file; do
  echo "更新ファイル: $file"
  sed -i.bak "s|$OLD_ID|$NEW_ID|g" "$file"
  rm -f "$file.bak"
done

# 依存関係の再インストール
echo "== 依存関係のクリーンインストール =="
yarn install --legacy-peer-deps

echo "== 完了! =="
echo "次にビルドを実行してください: npx eas-cli build --platform android --profile ci --non-interactive"
