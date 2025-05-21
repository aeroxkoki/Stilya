#!/bin/bash
# create-dummy-keystore.sh
# テスト用ダミーKeystoreを作成するスクリプト

# 安全なランダムデータでKeystoreファイルを模倣
mkdir -p android/app
dd if=/dev/random of=android/app/stilya-keystore.jks bs=1k count=3

# Base64エンコード
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  base64 -i android/app/stilya-keystore.jks > keystore-base64.txt
else
  # Linux/その他
  base64 android/app/stilya-keystore.jks > keystore-base64.txt
fi

# credentials.jsonの作成
cat > credentials.json << EOL
{
  "android": {
    "keystore": {
      "keystorePath": "android/app/stilya-keystore.jks",
      "keystorePassword": "jpn3025Koki",
      "keyAlias": "stilya-key-alias",
      "keyPassword": "jpn3025Koki"
    }
  }
}
EOL

echo "ダミーKeystoreとcredentials.jsonが作成されました。"
echo "keystore-base64.txtの内容をGitHub Secretsに設定してください。"
