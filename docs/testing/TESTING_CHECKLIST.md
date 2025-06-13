# 📱 Stilya 実機テスト チェックリスト

## 事前準備
- [ ] EAS CLIがインストールされている (`eas --version`)
- [ ] EASにログインしている (`eas whoami`)
- [ ] .envファイルが正しく設定されている
- [ ] node_modulesがインストールされている (`npm install`)

## ビルド準備
- [ ] app.config.jsのバンドルIDが正しい
  - iOS: `com.stilya.app`
  - Android: `com.stilya.app`
- [ ] eas.jsonのプロファイルが設定されている
- [ ] 必要な権限が設定されている（カメラ、フォトライブラリ等）

## 開発ビルド
- [ ] iOS開発ビルドを作成 (`eas build --platform ios --profile development`)
- [ ] Android開発ビルドを作成 (`eas build --platform android --profile development`)
- [ ] ビルドが正常に完了

## 実機インストール
- [ ] iOS: QRコードまたは.ipaファイルでインストール
- [ ] Android: QRコードまたは.apkファイルでインストール
- [ ] アプリが正常に起動

## 開発サーバー接続
- [ ] 開発サーバーを起動 (`npm start` or `./start-dev.sh`)
- [ ] デバイスと同じWi-Fiネットワークに接続
- [ ] アプリから開発サーバーに接続
- [ ] Hot Reloadが動作

## 機能テスト
- [ ] ログイン/サインアップ画面が表示
- [ ] Supabaseとの接続が正常
- [ ] 画像が正しく読み込まれる
- [ ] スワイプUIが動作
- [ ] エラーが適切に表示される

## デバッグ
- [ ] コンソールログが表示される
- [ ] React Developer Toolsが使える（任意）
- [ ] ネットワークログが確認できる

## 最終確認
- [ ] パフォーマンスが許容範囲内
- [ ] メモリ使用量が適切
- [ ] クラッシュしない
- [ ] 期待通りの動作をする

---

テスト日時: _______________
テスター: _______________
デバイス: _______________
結果: _______________
