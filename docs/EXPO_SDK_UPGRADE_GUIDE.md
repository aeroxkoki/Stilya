# Expo SDK 53.0.9 アップグレードガイド

## 概要

このドキュメントは、Stilyaプロジェクトを Expo SDK 53.0.9 にアップグレードする際の手順と注意事項をまとめたものです。

## アップグレード実施日

2025年6月4日

## 主な変更点

### 1. jsEngine フィールドの廃止

SDK 53 では JavaScriptCore サポートが廃止されたため、app.config.js から以下のフィールドを削除：

```diff
- jsEngine: "jsc",
```

### 2. New Architecture

SDK 53 では New Architecture（Bridgeless/Fabric）がデフォルトで有効になっています。

無効化が必要な場合は app.config.js に以下を追加：

```json
{
  "expo": {
    "newArchEnabled": false
  }
}
```

### 3. package.json exports フィールド

Metro bundler で package.json exports フィールドがデフォルトで有効になりました。

問題が発生した場合は metro.config.js で以下を設定：

```javascript
config.resolver.unstable_enablePackageExports = false
```

## アップグレード手順

### 1. 事前準備

```bash
# 現在の状態を保存
git add .
git commit -m "Before Expo SDK upgrade"

# クリーンアップ
rm -rf node_modules .expo package-lock.json
```

### 2. npmrc の設定（Node.js 23対応）

```bash
echo "legacy-peer-deps=true" > .npmrc
echo "engine-strict=false" >> .npmrc
```

### 3. package.json の更新

主要な依存関係のバージョン：

```json
{
  "dependencies": {
    "expo": "~53.0.9",
    "react": "19.0.0",
    "react-native": "0.79.2"
  }
}
```

### 4. 依存関係のインストール

```bash
# Expoのアップグレード
npm install expo@~53.0.9 --legacy-peer-deps

# 依存関係の修正
npx expo install --fix
```

### 5. app.config.js の更新

jsEngine フィールドを削除：

```javascript
// 削除
// jsEngine: "jsc",
```

### 6. 診断の実行

```bash
npx expo-doctor@latest
```

すべてのチェックに合格することを確認。

## トラブルシューティング

### npm peer dependency エラー

```bash
# legacy peer deps フラグを使用
npm install --legacy-peer-deps
```

### WebSocket（ws）パッケージのエラー

Supabase などの依存関係で発生する場合：

1. Supabase を最新バージョンに更新
2. metro.config.js で exports を無効化

```javascript
config.resolver.unstable_enablePackageExports = false
```

### ビルドエラー

```bash
# キャッシュをクリア
npx expo start --clear

# 完全リセット
./scripts/full-reset.sh
```

## 既知の問題

### 1. 廃止されたパッケージ

- `expo-av`: `expo-video` と `expo-audio` に置き換え
- `expo-background-fetch`: `expo-background-task` に置き換え

### 2. React Native 内部インポート

内部インポートが export 構文に更新されました。ネストされたパスをインポートしている場合は修正が必要です。

## リソース

- [Expo SDK 53 Changelog](https://expo.dev/changelog/sdk-53)
- [React Native 0.79 Release Notes](https://reactnative.dev/blog/2025/01/21/react-native-0.79)
- [New Architecture Documentation](https://reactnative.dev/docs/new-architecture-intro)
- [Expo Discord Community](https://chat.expo.dev)

## まとめ

Expo SDK 53.0.9 へのアップグレードは以下の点に注意：

1. jsEngine フィールドの削除（必須）
2. New Architecture がデフォルトで有効
3. Node.js 23 を使用する場合は legacy-peer-deps 設定が必要
4. expo-doctor で診断を実行して問題がないことを確認

アップグレード後は必ず動作確認を行い、問題がある場合は上記のトラブルシューティングを参照してください。
