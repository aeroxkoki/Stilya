# iOS シミュレーター セットアップガイド

## 問題
現在、iOSシミュレーターが利用できない状態です。以下のエラーが発生しています：
```
CommandError: No iOS devices available in Simulator.app
```

## 解決方法

### 方法1: Xcodeからシミュレーターをインストール

1. **Xcodeを開く**
   ```bash
   open /Applications/Xcode.app
   ```

2. **Xcodeの設定画面を開く**
   - メニューバーから `Xcode` → `Settings...` (または `Preferences...`) を選択
   - または `Cmd + ,` を押す

3. **Platformsタブを選択**
   - 左側のタブから「Platforms」を選択

4. **iOSシミュレーターをダウンロード**
   - 「+」ボタンをクリック
   - 「iOS」を選択
   - 推奨されるバージョン（iOS 17.2以降）を選択してダウンロード
   - ダウンロードサイズは約7-10GBです

5. **ダウンロード完了を待つ**
   - ダウンロードには時間がかかります（ネットワーク速度により15-60分程度）

### 方法2: xcrun経由でシミュレーターをインストール

1. **利用可能なランタイムを確認**
   ```bash
   xcrun simctl runtime list
   ```

2. **シミュレーターランタイムをダウンロード**
   ```bash
   xcodebuild -downloadPlatform iOS
   ```

### 方法3: 実機での開発（シミュレーター不要）

1. **実機をMacに接続**
   - iPhoneをUSBケーブルでMacに接続
   - iPhoneで「このコンピュータを信頼」を選択

2. **開発者モードを有効化**（iOS 16以降）
   - iPhone: 設定 → プライバシーとセキュリティ → 開発者モード → ON

3. **実機でビルド**
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya
   export LANG=en_US.UTF-8
   npx expo run:ios --device
   ```

## 推奨される次のステップ

### オプション1: Expo Goアプリを使用（最も簡単）

1. **App StoreからExpo Goをダウンロード**
   - iPhoneのApp Storeで「Expo Go」を検索してインストール

2. **開発サーバーを起動**
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya
   npm start
   ```

3. **QRコードをスキャン**
   - ターミナルに表示されるQRコードをiPhoneのカメラでスキャン
   - Expo Goアプリで自動的に開かれます

### オプション2: EAS Buildを使用（プロダクション向け）

1. **EAS Buildでビルド**
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya
   eas build --platform ios --profile development
   ```

2. **ビルドされたアプリをインストール**
   - ビルド完了後、QRコードまたはリンクからアプリをインストール

## トラブルシューティング

### Xcodeのバージョンが古い場合
```bash
# Xcodeのバージョン確認
xcodebuild -version

# 推奨: Xcode 15.0以上
```

### コマンドラインツールの再設定
```bash
# 管理者権限が必要
sudo xcode-select --reset
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## 現在の状況まとめ

- ✅ Xcodeプロジェクトは正しく生成されている
- ✅ CocoaPodsは正常にインストールされている
- ❌ iOSシミュレーターがインストールされていない
- ✅ プロジェクトのビルド設定は正常

シミュレーターをインストールするか、Expo Goアプリを使用することで、開発を続行できます。
