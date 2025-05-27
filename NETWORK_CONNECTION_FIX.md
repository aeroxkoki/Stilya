# iOS Simulator Network Connection Issue - 解決済み

## 問題
iOS SimulatorがネットワークIP（192.168.0.45:8081）に接続しようとして失敗する。

```
Could not connect to development server.
URL: http://192.168.0.45:8081/node_modules/expo/AppEntry.bundle...
```

## 原因
Expo/React Nativeアプリは、以前のビルド設定やキャッシュにより、localhostではなくネットワークIPアドレスに接続しようとすることがあります。

## 解決方法

### 方法1: クイックフィックス（推奨）
```bash
./localhost-quick-fix.sh
```
このスクリプトは：
- .expo/packager-info.jsonを作成してlocalhostを強制
- 環境変数REACT_NATIVE_PACKAGER_HOSTNAMEを設定
- Expoを--localhostオプションで起動

### 方法2: 完全な再ビルド
```bash
./build-ios-direct.sh
```
このスクリプトは：
- すべてのビルドキャッシュをクリア
- `npx expo run:ios`で新しくビルド

### 方法3: Ultimate修正
```bash
./ultimate-ios-fix.sh
```
このスクリプトは：
- 完全なクリーンアップ
- シミュレーターのリセット
- 明示的なlocalhost設定
- アプリの再インストール

## 手動での解決手順

1. **シミュレーターでの設定変更**
   - アプリ実行中にCmd+Dを押す
   - "Configure Bundler"を選択
   - Host: `localhost`、Port: `8081`に設定

2. **環境変数の設定**
   ```bash
   export REACT_NATIVE_PACKAGER_HOSTNAME=localhost
   npx expo start --localhost
   ```

3. **完全リセット**
   ```bash
   # アプリを削除
   xcrun simctl uninstall booted com.yourcompany.Stilya
   
   # 再ビルド
   npx expo run:ios
   ```

## なぜこの問題が発生するのか

1. **ネットワーク設定のキャッシュ**
   - 以前にLAN経由で接続した設定が残っている
   - .expo/packager-info.jsonにネットワークIPが保存されている

2. **Expoの自動検出**
   - ExpoはデフォルトでネットワークIPを使用することがある
   - 特にLAN上の実機デバイスと同時に開発している場合

3. **シミュレーターの設定**
   - シミュレーター内のアプリがバンドラーのURLを記憶している

## 予防策

1. **常にlocalhostを使用**
   ```bash
   # package.jsonのスクリプトを更新
   "start": "npx expo start --localhost"
   ```

2. **開発時の環境変数**
   ```bash
   # .bashrcまたは.zshrcに追加
   export REACT_NATIVE_PACKAGER_HOSTNAME=localhost
   ```

3. **定期的なクリーンアップ**
   ```bash
   npm run clean
   rm -rf .expo
   ```

## トラブルシューティング

### それでも接続できない場合

1. **ファイアウォールの確認**
   ```bash
   sudo lsof -i :8081
   ```

2. **Metro Bundlerの直接起動**
   ```bash
   npx react-native start --reset-cache
   ```

3. **Xcodeからの直接実行**
   ```bash
   cd ios
   open Stilya.xcworkspace
   # Xcodeで実行
   ```

## 関連ファイル
- `.expo/packager-info.json` - バンドラーの設定
- `ios/Stilya/Info.plist` - NSAppTransportSecurity設定
- `metro.config.js` - Metro設定

## 最終手段
すべての方法が失敗した場合：
```bash
# プロジェクトの完全リセット
rm -rf node_modules ios/Pods
npm install
cd ios && pod install && cd ..
npx expo run:ios
```
