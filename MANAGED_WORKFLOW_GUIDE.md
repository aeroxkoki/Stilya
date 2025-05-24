# Expo Managed Workflow 開発ガイドライン

このプロジェクトは**Expo Managed Workflow**を採用しています。以下のガイドラインに従って開発を行ってください。

## Managed Workflowとは

Managed Workflowは、Expoが提供する開発方式で、ネイティブコードを直接触ることなくReact Native開発ができる仕組みです。

### メリット
- ✅ ネイティブコードの管理が不要
- ✅ EAS Buildでクラウドビルドが簡単
- ✅ OTA（Over-The-Air）アップデートが可能
- ✅ 開発環境のセットアップが簡単

## 重要な制限事項

### ❌ 使用してはいけないもの

1. **ネイティブディレクトリ**
   - `ios/` ディレクトリを作成しない
   - `android/` ディレクトリを作成しない

2. **禁止コマンド**
   - `expo run:ios` - bare workflowに移行してしまう
   - `expo run:android` - bare workflowに移行してしまう
   - `expo eject` - 非推奨

3. **禁止パッケージ**
   - `expo-dev-client` - bare workflow用
   - Expoでサポートされていないネイティブモジュール

### ✅ 使用すべきもの

1. **開発コマンド**
   - `npm start` - 開発サーバーの起動
   - `eas build` - アプリのビルド
   - `eas submit` - ストアへの提出

2. **推奨パッケージ**
   - Expo SDK内のパッケージ（`expo-*`）
   - React Navigationなど、Expoでサポートされているもの

## 開発フロー

### 1. ローカル開発
```bash
# 開発サーバーの起動
npm start

# Expo Goアプリでテスト（QRコードをスキャン）
```

### 2. ビルド
```bash
# プレビュービルド（内部配布用）
npm run eas:build:preview

# 本番ビルド（ストア配布用）
npm run eas:build:prod
```

### 3. 配布
```bash
# EAS Updateでのアップデート配信
eas update --branch production
```

## ファイル構成の注意点

### app.json / app.config.js
- Expoの設定ファイル
- ネイティブ設定もここに記述

### eas.json
- EAS Buildの設定
- `developmentClient: true`は使用しない

### metro.config.js
- Metro Bundlerの設定
- カスタマイズは最小限に

## トラブルシューティング

### Q: ネイティブモジュールが必要になった場合は？
A: まずExpo SDKで代替手段がないか確認してください。どうしても必要な場合は、Config Pluginsを使用するか、チームで相談の上bare workflowへの移行を検討してください。

### Q: `ios/`や`android/`ディレクトリが生成されてしまった
A: 以下の手順で修正してください：
1. `rm -rf ios android`でディレクトリを削除
2. `package.json`から`expo run:*`スクリプトを削除
3. `eas.json`から`developmentClient`設定を削除

### Q: ローカルでiOS/Androidシミュレータでテストしたい
A: Expo Goアプリを使用するか、EAS Buildでプレビュービルドを作成してください。

## まとめ

Managed Workflowを維持することで、開発効率とメンテナンス性が大幅に向上します。ネイティブコードが必要になった場合は、必ずチームで相談してから対応方針を決定してください。
