# Stilya Development Build Migration Guide

## 概要

このガイドでは、StilyaアプリケーションをExpoGoから開発ビルドへ移行する手順を説明します。この移行により、Supabaseの`AuthRetryableFetchError: Network request failed`エラーが解決され、ネイティブモジュールの完全なサポートが可能になります。

## 前提条件

### macOS (iOS開発)
- Node.js 18以上
- Xcode 14以上（App Storeからインストール）
- CocoaPods（自動インストールされます）

### Android開発
- Java JDK 11以上
- Android Studio（Android SDKを含む）

## クイックスタート

プロジェクトルートで以下のコマンドを実行します：

```bash
./scripts/migrate-to-dev-build.sh
```

このスクリプトは以下を自動的に実行します：
1. 環境の検証
2. プロジェクトのクリーンアップ
3. 依存関係の再インストール
4. ネットワーク接続のテスト
5. 選択したプラットフォーム用の開発ビルド生成

## 手動での移行手順

### 1. 環境の検証

```bash
./scripts/validate-environment.sh
```

### 2. プロジェクトのクリーンアップ

```bash
# 重要なファイルのバックアップ
cp .env .env.backup
cp app.config.js app.config.js.backup

# クリーンアップ
rm -rf node_modules .expo ios android package-lock.json
npm cache clean --force
```

### 3. 依存関係の再インストール

```bash
npm install
```

### 4. iOS開発ビルドの生成

```bash
# Prebuildの生成
npx expo prebuild --platform ios --clear

# CocoaPodsの依存関係インストール
cd ios
pod install --repo-update
cd ..

# ビルドと実行
npx expo run:ios
```

### 5. Android開発ビルドの生成

```bash
# 環境変数の設定
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Prebuildの生成
npx expo prebuild --platform android --clear

# ビルドと実行
npx expo run:android
```

## 環境変数の確認

`.env`ファイルに以下の環境変数が正しく設定されていることを確認してください：

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://ddypgpljprljqrblpuli.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# LinkShare API
EXPO_PUBLIC_LINKSHARE_CLIENT_ID=your_client_id
EXPO_PUBLIC_LINKSHARE_CLIENT_SECRET=your_client_secret
EXPO_PUBLIC_LINKSHARE_SITE_ID=your_site_id
```

## トラブルシューティング

### Network request failedエラーが継続する場合

1. **Supabase URLの確認**
   ```bash
   node scripts/test-network.js
   ```

2. **Metro Bundlerのリスタート**
   ```bash
   npx expo start --clear
   ```

3. **開発ビルドの再生成**
   ```bash
   ./scripts/clean-state.sh
   npm install
   npx expo prebuild --clear
   ```

### iOS固有の問題

- **Xcodeでのビルドエラー**: Product > Clean Build Folderを実行
- **シミュレーターが起動しない**: Xcodeから直接実行してみる

### Android固有の問題

- **Gradleエラー**: `cd android && ./gradlew clean`
- **エミュレーターが見つからない**: Android Studioでエミュレーターを起動

## デバッグ方法

### iOS
```bash
# コンソールログの確認
xcrun simctl spawn booted log stream --predicate 'subsystem == "com.stilya.app"'
```

### Android
```bash
# React Nativeログの確認
adb logcat -s ReactNative:V ReactNativeJS:V
```

## 移行後の確認項目

- [ ] アプリが正常に起動する
- [ ] Supabase認証が機能する
- [ ] AsyncStorageにデータが保存される
- [ ] ネットワークリクエストが成功する
- [ ] ホットリロードが機能する

## 元の状態に戻す

問題が発生した場合は、以下のコマンドで元の状態に戻せます：

```bash
# バックアップから復元
cp .env.backup .env
cp app.config.js.backup app.config.js

# クリーンインストール
rm -rf node_modules ios android
npm install
```

## サポート

問題が解決しない場合は、以下の情報を含めてissueを作成してください：

- エラーメッセージの全文
- 実行したコマンドの履歴
- プラットフォーム（iOS/Android）
- 開発環境の詳細

---

最終更新: 2025年6月5日
