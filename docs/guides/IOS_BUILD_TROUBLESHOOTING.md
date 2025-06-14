# iOS開発ビルド トラブルシューティングガイド

## 概要

このガイドでは、iOS開発ビルドでよく発生する問題とその解決方法を説明します。

## よくある問題と解決方法

### 1. Pods設定ファイルが見つからないエラー

**エラーメッセージ:**
```
Unable to open base configuration reference file '/path/to/Pods/Target Support Files/Pods-Stilya/Pods-Stilya.debug.xcconfig'.
```

**原因:**
- `pod install`が実行されていない
- `.xcworkspace`ではなく`.xcodeproj`を開いている

**解決方法:**
```bash
# 1. プロジェクトディレクトリに移動
cd /path/to/Stilya

# 2. iOSディレクトリに移動してpod installを実行
cd ios
pod install

# 3. .xcworkspaceファイルを開く（重要！）
open Stilya.xcworkspace
```

### 2. CocoaPodsがインストールされていない

**エラーメッセージ:**
```
command not found: pod
```

**解決方法:**
```bash
# CocoaPodsをインストール
sudo gem install cocoapods

# またはHomebrewを使用
brew install cocoapods
```

### 3. Expo Prebuiltの問題

**症状:**
- iOSディレクトリが存在しない
- ネイティブファイルが古い

**解決方法:**
```bash
# クリーンなprebuiltを実行
npx expo prebuild --platform ios --clean

# その後、pod installを実行
cd ios && pod install
```

### 4. Signing & Capabilitiesの設定

**問題:**
- "Signing for 'Stilya' requires a development team"エラー

**解決方法:**
1. Xcodeで`Stilya.xcworkspace`を開く
2. プロジェクトナビゲーターで`Stilya`を選択
3. "Signing & Capabilities"タブを選択
4. "Team"で自分のApple IDを選択（Personal Teamでも可）
5. Bundle Identifierをユニークな値に変更（例: `com.yourname.stilya.dev`）

### 5. 開発ビルドのインストール手順

**完全な手順:**
```bash
# 1. クリーンスタート
cd /path/to/Stilya
rm -rf ios android node_modules
npm install

# 2. Expo Prebuild
npx expo prebuild --platform ios --clean

# 3. Pod Install
cd ios
pod install
cd ..

# 4. Xcodeで開く
open ios/Stilya.xcworkspace

# 5. 実機を接続して以下を設定：
# - Team設定
# - Bundle Identifier変更
# - デバイスを選択してRun
```

### 6. Managed Workflowの維持

**重要な注意点:**
- `expo prebuild`は開発ビルド用の一時的な処理
- 本番ビルドはGitHub ActionsとEAS Buildを使用
- ローカルでの変更は`git add ios/`しない（.gitignoreで除外）

### 7. 開発サーバーとの接続

**実機でアプリを起動後:**
```bash
# 開発サーバーを起動
npx expo start --dev-client --lan

# QRコードをスキャンまたは
# 表示されるURLを実機のアプリで入力
```

## 推奨される開発フロー

1. **コード変更** → Expoの開発サーバーでホットリロード
2. **ネイティブ機能の追加** → `expo prebuild`を再実行
3. **依存関係の追加** → `npm install` → `cd ios && pod install`
4. **本番ビルド** → GitHub Actionsにプッシュ

## 参考リンク

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [CocoaPods Guides](https://guides.cocoapods.org/)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup?platform=ios)
