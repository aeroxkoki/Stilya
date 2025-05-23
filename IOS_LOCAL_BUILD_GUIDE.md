# iOS ローカルビルド ガイド

## 前提条件
- macOS（必須）
- Xcode 15以上（App Storeからインストール）
- Apple Developer Account（実機テストする場合）
- CocoaPods（自動インストールされます）

## 方法1: Expo Run Commands（推奨）

### 1. 初回セットアップ
```bash
# プロジェクトディレクトリで実行
cd /Users/koki_air/Documents/GitHub/Stilya

# 依存関係のインストール（まだの場合）
npm install

# iOS向けのネイティブプロジェクトを生成
npx expo prebuild --platform ios

# または、クリーンビルドしたい場合
npx expo prebuild --platform ios --clear
```

### 2. シミュレーターでの実行
```bash
# iOSシミュレーターで起動
npm run ios

# または
npx expo run:ios
```

### 3. 実機での実行
```bash
# デバイスを接続して実行
npx expo run:ios --device
```

## 方法2: EAS Build（ローカル）

### 1. EAS CLIのインストール
```bash
npm install -g eas-cli
```

### 2. ローカルビルドの実行
```bash
# 開発用ビルド（シミュレーター向け）
eas build --platform ios --profile development --local

# プレビュー用ビルド（実機向け）
eas build --platform ios --profile preview --local
```

## トラブルシューティング

### Xcodeのバージョンエラー
```bash
# Xcodeのパスを確認
xcode-select -p

# 正しいXcodeを選択
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### CocoaPodsエラー
```bash
# CocoaPodsのインストール/更新
sudo gem install cocoapods

# ポッドの再インストール
cd ios
pod install
cd ..
```

### ビルドキャッシュのクリア
```bash
# Metroキャッシュをクリア
npx expo start --clear

# iOSビルドキャッシュをクリア
cd ios
xcodebuild clean
cd ..

# 完全にクリーンビルド
rm -rf ios
npx expo prebuild --platform ios --clear
```

## 開発時の便利なコマンド

### デバイスログの確認
```bash
# iOSシミュレーターのログ
xcrun simctl spawn booted log stream --level debug | grep -i stilya
```

### 特定のシミュレーターで起動
```bash
# 利用可能なシミュレーター一覧
xcrun simctl list devices

# 特定のデバイスで起動（例：iPhone 15 Pro）
npx expo run:ios --simulator "iPhone 15 Pro"
```

## ビルド設定の確認

現在の設定（eas.json）でのiOSビルド：
- `development`: シミュレーター向け開発ビルド
- `preview`: 内部配布用（実機テスト）
- `production`: App Store配布用

## 注意事項

1. **初回ビルドは時間がかかります**（20-30分程度）
2. **実機テストには Apple Developer Account が必要です**
3. **M1/M2 Macの場合**、Rosettaが必要な場合があります：
   ```bash
   softwareupdate --install-rosetta
   ```

## 次のステップ

1. まずはシミュレーターでテスト：
   ```bash
   npm run ios
   ```

2. 問題なければ実機でテスト：
   ```bash
   npx expo run:ios --device
   ```

3. 配布用ビルドが必要になったら：
   ```bash
   eas build --platform ios --profile preview
   ```
