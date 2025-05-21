# Keystore設定ガイド - Stilya

このドキュメントでは、Stilyaアプリのビルドに必要なKeystoreの設定方法について説明します。

## 重要: GitHub Secretsの設定

GitHub Actionsでビルドを成功させるためには、以下の4つのSecretsを設定する必要があります：

1. **ANDROID_KEYSTORE_BASE64**: base64エンコードされたKeystoreファイル
2. **ANDROID_KEY_ALIAS**: `stilya-key-alias`
3. **ANDROID_KEYSTORE_PASSWORD**: JPで始まるパスワード
4. **ANDROID_KEY_PASSWORD**: JPで始まるパスワード（上と同じ）

設定方法：
1. GitHubリポジトリの「Settings」タブをクリック
2. 左サイドバーの「Secrets and variables」→「Actions」を選択
3. 「New repository secret」ボタンで上記の4つを追加

## Keystoreファイルについて

すでにプロジェクトには `android/app/stilya-keystore.jks` が存在し、ビルドに使用されています。
このファイルはGitHubには直接コミットされず、CI/CDパイプラインで `ANDROID_KEYSTORE_BASE64` からデコードされます。

## ローカル開発でKeystoreを更新したい場合

以下のスクリプトを実行します：

```bash
./scripts/update-keystore.sh
```

このスクリプトは：
1. 共有されたbase64データを `android/app/stilya-keystore.jks` にデコード
2. 適切なパーミッションを設定
3. `credentials.json` ファイルを更新

## トラブルシューティング

ビルドに関する問題が発生した場合は、以下のスクリプトでKeystoreと認証情報の状態を確認できます：

```bash
./scripts/debug-credentials.sh
```

また、以下のコマンドで最新のGitHub Actions設定を取得できます：

```bash
git pull origin main
```

---

詳細な質問があれば、プロジェクト管理者にお問い合わせください。
