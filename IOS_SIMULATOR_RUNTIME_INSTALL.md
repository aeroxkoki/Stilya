# iOSシミュレーターランタイム インストールガイド

## 問題
現在、iOSシミュレーターのランタイムがインストールされていません。

## 解決方法

### 方法1: Xcodeから直接インストール（推奨）

1. **Xcodeを開く**
   ```bash
   open /Applications/Xcode.app
   ```

2. **設定を開く**
   - メニューバー → Xcode → Settings（設定）
   - または `Cmd + ,`

3. **Platformsタブを選択**
   - 左側のタブから「Platforms」を選択

4. **iOSランタイムをダウンロード**
   - 「+」ボタンをクリック
   - iOS 17.x（最新版）を選択
   - 「Download & Install」をクリック
   - ダウンロード完了まで待つ（約5-10GB）

### 方法2: コマンドラインからインストール

```bash
# 利用可能なランタイムを確認
xcodebuild -downloadPlatform iOS

# または、特定のバージョンを指定
xcodebuild -downloadPlatform iOS -version 17.5
```

## インストール後の確認

```bash
# ランタイムの確認
xcrun simctl list runtimes

# デバイスリストの確認
xcrun simctl list devices
```

## 完了後の手順

1. **シミュレーターでアプリを起動**
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya
   npm run ios
   ```

2. **特定のデバイスで起動**
   ```bash
   npx expo run:ios --simulator "iPhone 15 Pro"
   ```

## トラブルシューティング

### ダウンロードが遅い場合
- 安定したWi-Fi接続を使用
- 深夜など混雑しない時間帯に実行

### 容量不足エラー
- 少なくとも20GB以上の空き容量を確保
- 不要なシミュレーターを削除：
  ```bash
  xcrun simctl delete unavailable
  ```

### Xcode再起動が必要な場合
```bash
# Xcodeを完全に終了
killall Xcode

# 再度開く
open /Applications/Xcode.app
```
