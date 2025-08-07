# Managed Workflow 復元ガイド

## 修正日時
2025年8月7日

## 問題の概要
- **エラー**: Sandbox: bash(22897) deny(1) file-read-data エラー
- **原因**: プロジェクトが managed workflow から bare workflow に移行してしまっていた
- **影響**: iOS Pods関連のファイルアクセスエラーが発生

## 解決方法

### 1. 根本原因の特定
- managed workflowでは `ios/` と `android/` ディレクトリは存在してはいけない
- 開発ビルド（dev-client）の使用により、bare workflowに移行していた

### 2. 実施した修正

#### ネイティブディレクトリの削除
```bash
rm -rf ios android
```

#### package.json の修正
- `expo run:ios` → `expo start --ios`  
- `expo run:android` → `expo start --android`
- `--dev-client` フラグを削除

#### expo-dev-client の削除
```bash
npm uninstall expo-dev-client
```

#### 不要なファイルの削除
```bash
rm -f dev-client.config.js Podfile* Gemfile*
```

#### キャッシュのクリア
```bash
rm -rf .expo node_modules/.cache
```

## 現在の状態
- ✅ Managed workflow に完全復元
- ✅ ネイティブディレクトリを削除
- ✅ package.json を適切に修正
- ✅ 不要な依存関係を削除

## テスト方法

### Expo Go アプリでのテスト
```bash
npm start
```
Expo Go アプリでQRコードをスキャンして動作確認

### EAS Build でのビルド
```bash
npm run eas-build-preview
```

## 今後の注意点

### ❌ 避けるべきコマンド
- `expo run:ios`
- `expo run:android`
- `expo prebuild`
- `expo eject`

### ✅ 使用すべきコマンド
- `expo start`
- `expo start --ios`
- `expo start --android`
- `eas build`

## Managed Workflow の利点
1. **シンプルな管理**: ネイティブコードの管理が不要
2. **OTA更新**: Expo Updateによる即座の更新
3. **クロスプラットフォーム**: 一つのコードベースで両OS対応
4. **簡単なビルド**: EAS Buildによるクラウドビルド
5. **保守性**: アップグレードが容易

## GitHub Actions との互換性
Managed workflow は GitHub Actions と完全に互換性があります：
- ネイティブビルド環境の設定が不要
- EAS Build との統合が容易
- CI/CD パイプラインがシンプル

## 参考資料
- [Expo Managed Workflow](https://docs.expo.dev/introduction/managed-vs-bare/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Migration Guide](https://docs.expo.dev/workflow/prebuild/)
