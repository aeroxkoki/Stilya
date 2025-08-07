# Stilya 実機テストガイド (Managed Workflow)

## 📱 実機テスト方法の概要

Managed Workflowでは以下の3つの方法で実機テストが可能です：

1. **Expo Go アプリ** - 最も簡単・開発中のテスト向け
2. **EAS Build (Preview)** - カスタム機能を含む本番に近いテスト
3. **EAS Build (Development)** - デバッグ機能付きのテスト

## 方法1: Expo Go アプリでのテスト（推奨）

### 準備
1. スマートフォンにExpo Goアプリをインストール
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 開発PCとスマートフォンを同じWi-Fiネットワークに接続

### 実行手順

```bash
# プロジェクトディレクトリで実行
cd /Users/koki_air/Documents/GitHub/Stilya

# 開発サーバーを起動
npm start
```

### 接続方法

#### iPhoneの場合:
1. Expo Goアプリを開く
2. カメラアプリでQRコードをスキャン
3. 「Expo Goで開く」をタップ

#### Androidの場合:
1. Expo Goアプリを開く
2. 「Scan QR Code」をタップ
3. QRコードをスキャン

### トラブルシューティング

#### 接続できない場合:
```bash
# トンネル接続を使用（Wi-Fi以外でも可能）
npx expo start --tunnel
```

#### キャッシュクリア:
```bash
# キャッシュをクリアして再起動
npx expo start --clear
```

## 方法2: EAS Build (Preview) - 本番に近いテスト

### 初期設定（初回のみ）

```bash
# EAS CLIのインストール
npm install -g eas-cli

# Expoアカウントにログイン
eas login

# プロジェクトの設定
eas build:configure
```

### ビルド実行

```bash
# iOS向けビルド
eas build --platform ios --profile preview

# Android向けビルド  
eas build --platform android --profile preview

# 両プラットフォーム同時ビルド
npm run eas-build-preview
```

### インストール方法

#### iOS (Ad Hoc配布):
1. ビルド完了後、Expo開発者ダッシュボードからQRコード/リンクを取得
2. iPhoneでリンクを開き、プロファイルをインストール
3. 設定 > 一般 > VPNとデバイス管理 > プロファイルを信頼
4. アプリを起動

#### Android (APK):
1. ビルド完了後、APKファイルをダウンロード
2. スマートフォンに転送してインストール
3. または、Expo開発者ダッシュボードのQRコードから直接インストール

## 方法3: 開発ビルド（デバッグ機能付き）

### eas.jsonの設定確認

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### 開発ビルドの作成

```bash
# 開発ビルドを作成
eas build --platform ios --profile development
```

## 📋 テストチェックリスト

### 基本機能テスト
- [ ] アプリが正常に起動する
- [ ] スプラッシュ画面が表示される
- [ ] ログイン/サインアップが動作する
- [ ] スワイプUIが正常に動作する
- [ ] 画像が正しく表示される
- [ ] 商品詳細画面への遷移が動作する
- [ ] 外部リンク（アフィリエイト）が開く

### パフォーマンステスト
- [ ] スワイプがスムーズに動作する
- [ ] 画像の読み込みが速い
- [ ] メモリリークがない
- [ ] バッテリー消費が適切

### ネットワークテスト
- [ ] Wi-Fi環境で動作する
- [ ] モバイルデータ通信で動作する
- [ ] オフライン時のエラー処理が適切

## 🔧 便利なコマンド

```bash
# ログを見ながら実行
npx expo start --dev

# 特定のデバイスで開く
npx expo start --ios  # iOSシミュレーター
npx expo start --android  # Androidエミュレーター

# ビルド履歴の確認
eas build:list

# ビルドの詳細確認
eas build:view

# デバイスの登録（iOS Ad Hoc配布用）
eas device:create
```

## ⚠️ 注意事項

### Expo Go の制限事項
- カスタムネイティブモジュールは使用不可
- プッシュ通知のテストは制限あり
- アプリ内課金のテストは不可

### EAS Build の注意点
- ビルドには時間がかかる（10-30分）
- 無料プランには月間ビルド数の制限あり
- iOSビルドにはApple Developer Programへの登録が必要（年間$99）

## 📱 推奨テストフロー

1. **開発中**: Expo Go でリアルタイムテスト
2. **機能完成時**: EAS Preview ビルドでテスト
3. **リリース前**: EAS Production ビルドで最終テスト

## 🆘 トラブルシューティング

### Expo Goで「プロジェクトが見つかりません」エラー
```bash
# アカウントを確認
npx expo whoami

# ログインし直す
npx expo logout
npx expo login
```

### ビルドエラーの解決
```bash
# 依存関係の確認
npx expo doctor

# キャッシュクリア
rm -rf node_modules .expo
npm install
```

### ネットワークエラー
```bash
# ファイアウォール/プロキシ設定を確認
# ポート19000, 19001が開いていることを確認

# トンネル接続を使用
npx expo start --tunnel
```

## 📚 参考リンク
- [Expo Go ドキュメント](https://docs.expo.dev/get-started/expo-go/)
- [EAS Build ドキュメント](https://docs.expo.dev/build/introduction/)
- [テストフライト設定](https://docs.expo.dev/submit/ios/)
- [Google Play Console](https://docs.expo.dev/submit/android/)
