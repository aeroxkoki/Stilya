# iOS ビルド最適化ガイド（根本的解決版）

## 🚀 Stilya iOS開発ビルドの根本的最適化

このドキュメントは、Stilyaプロジェクトで265個のPodsによるビルド時間の問題を根本的に解決するための実装をまとめたものです。

## 実装された根本的解決策

### 1. expo-build-propertiesプラグインの導入
```javascript
// app.config.js
plugins: [
  [
    "expo-build-properties",
    {
      ios: {
        deploymentTarget: "15.1",
        useFrameworks: "static",
        ccacheEnabled: true
      }
    }
  ]
]
```

### 2. 不要なExpoモジュールの除外（40個以上）
```json
// package.json
"expo": {
  "autolinking": {
    "exclude": [
      "expo-camera",
      "expo-av",
      "expo-sensors",
      // ... 40個以上のモジュールを除外
    ]
  }
}
```

### 3. New Architectureの無効化
```json
// ios/Podfile.properties.json
{
  "expo.jsEngine": "hermes",
  "EX_DEV_CLIENT_NETWORK_INSPECTOR": "true",
  "newArchEnabled": "false"
}
```

### 4. Metro設定の最適化
- Webプラットフォーム関連を完全除外
- テストファイルやデモファイルを除外
- 並列処理の最適化

## 期待される効果

### Podの数の削減
- **Before**: 265個のPods
- **After**: 約100-150個（40-60%削減見込み）

### ビルド時間の改善
- **初回ビルド**: 通常通り（キャッシュ生成のため）
- **2回目以降**: 50-70%の時間短縮

### メモリ使用量の削減
- 不要なモジュールの除外により、メモリ使用量が大幅に削減

## 最適化スクリプトの使用方法

```bash
# 完全な最適化を実行
./scripts/optimize-pods.sh

# 通常のビルド
npm run ios
```

## 技術的詳細

### なぜ265個のPodsが存在していたのか？

1. **Expo SDK 53のデフォルト設定**
   - New Architectureがデフォルトで有効
   - すべてのExpoモジュールが自動的に含まれる

2. **依存関係の膨張**
   - 各Expoモジュールが独自の依存関係を持つ
   - React Native 0.79.2の新しい依存関係

3. **プラットフォームの混在**
   - Web、iOS、Androidのコードがすべて含まれる

### 実装した解決策の詳細

1. **静的フレームワークの使用**
   - `useFrameworks: "static"`により、動的リンクのオーバーヘッドを削減

2. **選択的モジュール読み込み**
   - 実際に使用している5個のExpoモジュールのみを有効化
   - 残りの40個以上を除外

3. **ビルドキャッシュの活用**
   - ccacheによるCコンパイルキャッシュ
   - CocoaPodsのキャッシュ最適化

## トラブルシューティング

### ビルドエラーが発生した場合

```bash
# 完全リセット
rm -rf ios android node_modules
npm install
npx expo prebuild --clean
cd ios && pod install
```

### 特定のExpoモジュールが必要になった場合

`package.json`の`expo.autolinking.exclude`から該当モジュールを削除してください。

## 今後の改善案

1. **カスタム開発クライアントの作成**
   - 必要最小限のモジュールのみを含む専用クライアント

2. **Turboモジュールの活用**
   - より効率的なネイティブモジュール読み込み

3. **Expo SDK 54への移行準備**
   - さらなる最適化が予定されている

## 参照

- [Expo SDK 53 Changelog](https://expo.dev/changelog/sdk-53)
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [expo-build-properties Documentation](https://docs.expo.dev/versions/latest/sdk/build-properties/)
