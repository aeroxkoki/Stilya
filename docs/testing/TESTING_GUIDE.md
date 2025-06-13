# 📱 Stilya 実機テストガイド

## 🚀 クイックスタート

### 1. 初回セットアップ

#### 必要なツール
```bash
# EAS CLIのインストール（未インストールの場合）
npm install -g eas-cli

# EASへのログイン
eas login
```

### 2. 開発ビルドの作成

#### iOS開発ビルド
```bash
eas build --platform ios --profile development
```

#### Android開発ビルド  
```bash
eas build --platform android --profile development
```

### 3. アプリのインストール

**iOS:**
1. ビルド完了後、EAS Build画面のQRコードをiPhoneのカメラアプリでスキャン
2. または、.ipaファイルをダウンロードしてXcode経由でインストール

**Android:**
1. ビルド完了後、EAS Build画面のQRコードをスキャン
2. または、.apkファイルを直接ダウンロードしてインストール
   - 「設定」→「セキュリティ」→「不明なソースからのインストール」を許可

### 4. 開発サーバーの起動

```bash
# シンプルな起動
npm start

# または起動スクリプトを使用
./start-dev.sh

# LAN内の他デバイスからアクセス可能にする場合
npx expo start --dev-client --clear --host 0.0.0.0
```

### 5. デバイスとの接続

1. 開発用にビルドしたアプリを実機で起動
2. 開発サーバーのURLを入力（通常は自動検出される）
   - 例: `exp://192.168.1.xxx:8081`
3. 「Connect」をタップ

## 🔧 トラブルシューティング

### 接続できない場合

1. **同じWi-Fiネットワーク**に接続されているか確認
2. ファイアウォールがポート8081をブロックしていないか確認
3. 開発サーバーを`--host 0.0.0.0`オプションで起動してみる

### ビルドエラーの場合

```bash
# キャッシュをクリア
npm run clean

# 完全リセット
npm run full-reset
```

### アプリがクラッシュする場合

```bash
# ログを確認
npx expo start --dev-client --clear
# デバイスのログがターミナルに表示される
```

## 📝 デバッグ用コマンド

```bash
# 環境変数の確認
npm run check-env

# データベース接続テスト
npm run test-db

# 商品データ同期テスト
npm run sync-products:improved
```

## 🔒 セキュリティ注意事項

- 開発ビルドは**内部配布のみ**に使用
- 本番用のAPIキーやシークレットは含めない
- .envファイルはGitにコミットしない

## 📱 対応デバイス

- iOS: 13.0以上
- Android: API Level 21以上（Android 5.0以上）

## 🔗 関連リンク

- [EAS Build Dashboard](https://expo.dev/accounts/aeroxkoki/projects/stilya/builds)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
