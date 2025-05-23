# Android Keystore Setup for Stilya

このドキュメントは、Stilya アプリのAndroidビルド用キーストアの設定方法を説明します。

## キーストア情報

- **キーストアファイル**: `stilya-keystore.jks`
- **キーエイリアス**: `stilya-key-alias`
- **キーストアパスワード**: `jpn3025Koki`
- **キーパスワード**: `jpn3025Koki`

## GitHub Secrets の設定

GitHub Actions でビルドを実行するために、以下のSecretsを設定する必要があります：

1. **ANDROID_KEYSTORE_BASE64**
   - `keystore-base64.txt` ファイルの内容をコピーして設定
   - または以下のコマンドで生成:
   ```bash
   base64 -i stilya-keystore.jks
   ```

2. **ANDROID_KEY_ALIAS**
   - 値: `stilya-key-alias`

3. **ANDROID_KEYSTORE_PASSWORD**
   - 値: `jpn3025Koki`

4. **ANDROID_KEY_PASSWORD**
   - 値: `jpn3025Koki`

5. **EXPO_TOKEN**
   - Expo アカウントのアクセストークン

## ローカルビルドの実行

ローカルでビルドを実行する場合：

```bash
# EAS ビルド（Android）
npm run eas:build:android

# または直接実行
npx eas build --platform android --profile preview --local
```

## キーストアの再生成

キーストアファイルを再生成する必要がある場合：

```bash
# 既存のキーストアをバックアップ
mv stilya-keystore.jks stilya-keystore.jks.backup

# 新しいキーストアを生成
keytool -genkey -v -keystore stilya-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias stilya-key-alias \
  -storepass jpn3025Koki \
  -keypass jpn3025Koki \
  -dname "CN=Stilya Dev, OU=Development, O=Stilya Inc, L=Toyonaka, ST=Osaka, C=JP"

# Base64エンコード
base64 -i stilya-keystore.jks -o keystore-base64.txt
```

## セキュリティ注意事項

- キーストアファイルは絶対にGitリポジトリにコミットしないでください
- `.gitignore` に `*.jks` が含まれていることを確認してください
- 本番環境では異なるキーストアを使用することを推奨します
- パスワードは安全に管理し、定期的に変更してください

## トラブルシューティング

### "toDerInputStream rejects tag type" エラー

このエラーが発生した場合、キーストアファイルが破損している可能性があります：

1. キーストアファイルを削除
2. 上記の手順で新しいキーストアを生成
3. GitHub Secretsを更新
4. ビルドを再実行

### キーストアの検証

キーストアが正しく生成されているか確認：

```bash
keytool -list -v -keystore stilya-keystore.jks -storepass jpn3025Koki
```

正常な場合、以下のような出力が表示されます：
- キーストアのタイプ: PKCS12
- エントリ数: 1
- エイリアス: stilya-key-alias
