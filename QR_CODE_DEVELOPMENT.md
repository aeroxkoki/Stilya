# Stilya QRコード開発ガイド

## 🎯 開発方法の選択

### Expo Go（QRコード）
- ✅ **メリット**: すぐに始められる、Apple Developer Account不要
- ❌ **デメリット**: 一部のネイティブ機能に制限
- 📱 **用途**: 初期開発、UI/UXの確認

### 開発用ビルド
- ✅ **メリット**: すべての機能が使用可能
- ❌ **デメリット**: ビルド時間が必要
- 📱 **用途**: カスタム機能のテスト、本番に近い環境

## 🚀 Expo Goで今すぐ始める

```bash
# 1. プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 2. 開発サーバーを起動
npx expo start

# 3. QRコードが表示される
```

## 📱 iPhoneでの手順

1. **Expo Goアプリをインストール**
   - [App Store - Expo Go](https://apps.apple.com/jp/app/expo-go/id982107779)

2. **QRコードをスキャン**
   - Expo Goアプリを開く
   - 「Scan QR Code」をタップ
   - ターミナルのQRコードをスキャン

3. **アプリが起動**
   - 自動的にStilya appが読み込まれる

## ⚠️ トラブルシューティング

### 「Network response timed out」エラー
- MacとiPhoneが同じWi-Fiに接続されているか確認
- VPNを無効にする
- ファイアウォール設定を確認

### 「Unable to resolve module」エラー
```bash
# キャッシュをクリア
npx expo start --clear
```

### カスタム機能が動かない場合
```bash
# 開発用ビルドを作成
eas build --profile development --platform ios
```

## 🔄 開発サイクル

1. **コード変更**
2. **自動リロード**（Fast Refresh）
3. **即座に反映**

### ショートカットキー
- `r` - アプリをリロード
- `m` - デベロッパーメニュー
- `shift + m` - 詳細メニュー
- `j` - デバッガーを開く

## 💡 Tips

- **開発初期**: Expo Goで十分
- **カスタム機能追加時**: 開発用ビルドに切り替え
- **本番テスト**: TestFlightまたはEAS Build

---

**今すぐ始める:**
```bash
npx expo start
```

QRコードが表示されたら、Expo Goアプリでスキャンして開発開始！
