# iOS Build エラー対策ガイド

## 「No such module 'ExpoModulesCore'」エラーの解決方法

このエラーは、CocoaPodsの依存関係が正しくインストールされていない場合に発生します。

### 🔧 迅速な解決方法

```bash
# Quick fixスクリプトを実行
bash scripts/quick-fix-expo-modules.sh
```

### 📋 手動での解決手順

1. **iOS artifactsをクリーンアップ**
   ```bash
   cd ios
   rm -rf build Pods Podfile.lock
   cd ..
   ```

2. **Podsを再インストール**
   ```bash
   cd ios
   pod deintegrate
   pod install --repo-update
   cd ..
   ```

3. **Xcodeでクリーンビルド**
   - ワークスペースを開く: `open ios/Stilya.xcworkspace`
   - Clean Build Folder: `Cmd + Shift + K`
   - Build: `Cmd + B`

### 🚫 よくある間違い

- ❌ `Stilya.xcodeproj`を開く → ⭕ `Stilya.xcworkspace`を開く
- ❌ `pod install`だけ実行 → ⭕ `pod deintegrate`してから`pod install`
- ❌ キャッシュを残したまま → ⭕ 完全にクリーンアップしてから再インストール

### 🔍 その他のトラブルシューティング

#### エラーが継続する場合

1. **Xcode DerivedDataをクリア**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

2. **Node modulesを再インストール**
   ```bash
   rm -rf node_modules
   npm install
   npx expo prebuild --platform ios --clean
   ```

3. **Xcodeを再起動**
   - Xcodeを完全に終了
   - ワークスペースを再度開く

#### 環境の確認

```bash
# CocoaPodsのバージョン確認
pod --version

# Nodeのバージョン確認
node --version

# npmのバージョン確認
npm --version

# Expoのバージョン確認
npx expo --version
```

### 📱 開発ビルド作成時の注意点

1. **managed workflowを維持**
   - `expo prebuild`は必要な時のみ実行
   - 不要なネイティブコードの変更は避ける

2. **定期的なクリーンアップ**
   - 週に1回程度は`scripts/quick-fix-expo-modules.sh`を実行
   - ビルドエラーが出た場合は即座にクリーンアップ

3. **依存関係の管理**
   - package.jsonの変更後は必ず`npm install`
   - 新しいライブラリ追加後は`cd ios && pod install`

### 🚀 ビルド成功の確認

ビルドが成功したら、以下を確認：

1. シミュレーターまたは実機でアプリが起動する
2. Metro bundlerが正常に動作する
3. Hot reloadingが機能する

## 関連スクリプト

- `scripts/quick-fix-expo-modules.sh` - ExpoModulesCoreエラーの迅速修正
- `scripts/fix-expo-modules-core.sh` - 完全なクリーンアップと再セットアップ
- `npm run full-reset` - プロジェクト全体のリセット
