# Keystore設定ガイド

このドキュメントでは、Stilyaアプリのビルドに必要なKeystoreの設定方法について説明します。

## 概要

AndroidアプリをGoogle Play Storeで公開したり、EASビルドで署名付きAPKを生成したりするためには、Keystoreによるアプリの署名が必要です。Keystoreは、開発者の身元を証明し、アプリが改ざんされていないことを保証するための仕組みです。

## Keystoreの生成方法

### 自動生成スクリプトを使う（推奨）

1. プロジェクトルートディレクトリで以下のコマンドを実行します：

```bash
./scripts/generate-keystore.sh
```

2. プロンプトに従って、パスワードを入力します。
3. スクリプトが自動的に以下を生成します：
   - Keystoreファイル（`android/app/stilya-keystore.jks`）
   - credentials.jsonファイル
   - GitHub Secrets用のbase64エンコードされたKeystoreファイル

### 手動で生成する方法

以下のコマンドでKeystoreを手動で生成することもできます：

```bash
keytool -genkeypair -v \
  -keystore android/app/stilya-keystore.jks \
  -alias stilya-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD
```

## GitHub Actionsでの設定方法

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」に移動
2. 「New repository secret」をクリックして、以下の4つのシークレットを追加：
   - `ANDROID_KEYSTORE_BASE64`: base64エンコードされたKeystoreファイル
   - `ANDROID_KEY_ALIAS`: Keystoreのエイリアス名（通常は `stilya-key-alias`）
   - `ANDROID_KEYSTORE_PASSWORD`: Keystoreのパスワード
   - `ANDROID_KEY_PASSWORD`: キーのパスワード

## 重要な注意事項

- **Keystoreファイルとパスワードは安全に保管してください**
- Keystoreを紛失すると、アプリの更新が不可能になります
- Keystoreファイルを直接GitHubにコミットしないでください
- バックアップを複数の安全な場所に保管することを強く推奨します

## トラブルシューティング

ビルド時に「credentials.json does not exist in the project root directory」というエラーが発生する場合：

1. プロジェクトルートディレクトリに `credentials.json` ファイルが存在することを確認
2. `eas.json` ファイルで Android ビルド設定の `credentialsSource` が `"local"` になっていることを確認
3. Keystoreファイルが `android/app/stilya-keystore.jks` に存在することを確認

---

ご不明点があれば、プロジェクト管理者にお問い合わせください。
