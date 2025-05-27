# Expo Go Connection Issues - Complete Solution Guide

## 問題の症状
```
** INFO ** Connection established to app='host.exp.Exponent' on device='iPhone 16 Pro'.
** INFO ** Connection closed to device='iPhone 16 Pro' for app='host.exp.Exponent' with code='1006' and reason=''.
```

Expo Goアプリへの接続が確立されるが、すぐに切断される。

## 原因

1. **依存関係の不一致**
   - Expo SDK 53と互換性のないパッケージバージョン
   - React、React Native、その他の依存関係のバージョン不一致

2. **app.json設定の不足**
   - 最小限の設定しかなく、Expo Goが期待する設定が欠落

3. **キャッシュの問題**
   - Metro bundler、Expo Go、React Nativeのキャッシュ

4. **Expo Goアプリのバージョン**
   - 古いバージョンのExpo Goアプリ

## 解決方法

### 方法1: 依存関係の修正（推奨）
```bash
./check-expo-compatibility.sh
```
このスクリプトは：
- 依存関係のバージョンをチェック
- Expo SDK 53との互換性を確認
- 必要に応じて自動修正

### 方法2: Expo Go接続の修正
```bash
./fix-expo-go-connection.sh
```
このスクリプトは：
- すべてのキャッシュをクリア
- 問題のある依存関係を修正
- トンネルモードでExpoを起動

### 方法3: 開発ビルドの作成（最も安定）
```bash
./create-dev-client.sh
```
このスクリプトは：
- カスタム開発クライアントを作成
- Expo Goの制限を回避
- より安定した開発環境を提供

## 手動での修正手順

### 1. 依存関係の更新
```bash
# Expo doctorで自動修正
npx expo doctor --fix-dependencies

# または手動で更新
npm install @react-native-async-storage/async-storage@2.1.2
npm install @react-native-community/netinfo@11.4.1
```

### 2. app.jsonの更新
app.jsonファイルが既に更新されています。主な設定：
- orientation
- icon/splash設定
- iOS/Androidの設定
- packagerOpts

### 3. キャッシュのクリア
```bash
# Expo Goアプリ内で
Settings → Clear cache

# 開発マシンで
rm -rf ~/.expo .expo node_modules/.cache
npx expo start --clear
```

### 4. Expo Goアプリの更新
- App StoreでExpo Goを最新版に更新
- アプリを完全に終了して再起動

## トラブルシューティング

### 問題: 依存関係の警告が続く
```bash
# package-lock.jsonを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npx expo doctor --fix-dependencies
```

### 問題: Expo Goが繰り返しクラッシュ
```bash
# トンネルモードを使用
npx expo start --tunnel

# またはLANモード
npx expo start --lan
```

### 問題: 特定のモジュールがExpo Goでサポートされない
```bash
# 開発ビルドを作成
npx expo run:ios
```

## 推奨される開発フロー

### Expo Goを使用する場合
1. 依存関係の互換性を確認
2. `./check-expo-compatibility.sh`を実行
3. `npx expo start`で起動
4. QRコードをスキャン

### 開発ビルドを使用する場合（推奨）
1. `./create-dev-client.sh`を実行
2. シミュレーターで自動的に起動
3. より安定した開発が可能

## Expo SDK 53の重要な変更点

1. **React 19への移行**
   - React 18.3.1 → 19.0.0

2. **依存関係のバージョン**
   ```json
   {
     "@react-native-async-storage/async-storage": "2.1.2",
     "@react-native-community/netinfo": "11.4.1",
     "react": "19.0.0",
     "@types/react": "~19.0.10",
     "babel-preset-expo": "~13.0.0"
   }
   ```

3. **新しいExpo CLIの使用**
   - すべてのコマンドで`npx expo`を使用

## ベストプラクティス

1. **定期的なキャッシュクリア**
   ```bash
   npx expo start --clear
   ```

2. **依存関係の確認**
   ```bash
   npx expo doctor
   ```

3. **開発ビルドの使用**
   - 複雑なプロジェクトでは開発ビルドが推奨
   - より安定した開発体験

## 関連リソース
- [Expo SDK 53 Release Notes](https://blog.expo.dev/expo-sdk-53)
- [Expo Go Limitations](https://docs.expo.dev/workflow/expo-go/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
