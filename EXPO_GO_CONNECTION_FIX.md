# Expo Go 接続トラブルシューティング

## 問題
- ngrokのインストールエラー
- トンネル接続が失敗

## 解決方法

### 方法1: LANモードで起動（推奨）

```bash
# プロジェクトディレクトリで実行
cd /Users/koki_air/Documents/GitHub/Stilya

# LANモードで起動（同じWi-Fi必須）
npx expo start --clear

# または
npm start
```

### 方法2: ngrokを手動でインストール

```bash
# ngrokをアンインストール
npm uninstall -g @expo/ngrok

# キャッシュクリア
npm cache clean --force

# 再インストール
npm install -g @expo/ngrok@4.1.3
```

### 方法3: Expo Devクライアントを使用

1. **開発用ビルドを作成**
   ```bash
   npx expo prebuild --platform ios
   npx expo run:ios
   ```

### 方法4: 手動でIPアドレスを入力

1. **MacのIPアドレスを確認**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Expo Goアプリで手動入力**
   - Expo Goを開く
   - "Enter URL manually"を選択
   - `exp://[MacのIPアドレス]:8081` を入力

## 確認事項

### ネットワーク設定
- [ ] iPhoneとMacが同じWi-Fiに接続されている
- [ ] ファイアウォールがポート19000-19001を許可している
- [ ] プライベートネットワークとして設定されている

### Expo設定
- [ ] `.expo`フォルダを削除して再試行
- [ ] `node_modules`を削除して再インストール

## クイックフィックス

```bash
# 全キャッシュクリア＆再起動
rm -rf node_modules .expo
npm install
npx expo start --clear
```

## それでも接続できない場合

### Web版で確認
```bash
npx expo start --web
```
ブラウザで動作確認後、モバイルで再試行

### デバッグモード
```bash
DEBUG=* npx expo start
```
詳細なログを確認

## 最終手段

### Expo Goを再インストール
1. iPhoneからExpo Goを削除
2. App Storeから再インストール
3. アプリを開いてログイン（任意）

### プロジェクトをリセット
```bash
# プロジェクトバックアップ
cp -r . ../Stilya-backup

# クリーンインストール
rm -rf node_modules package-lock.json .expo
npm install
npx expo doctor
npx expo start
```
