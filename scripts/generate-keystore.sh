#!/bin/bash
# generate-keystore.sh
# Stilyaプロジェクト用Keystore生成スクリプト

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Stilya用Keystore生成ツール ====${NC}"
echo "このスクリプトはAndroidアプリ署名用のKeystoreを生成します"

# パスワードの設定
read -p "Keystoreのパスワードを入力してください: " STORE_PASS
if [ -z "$STORE_PASS" ]; then
  echo -e "${YELLOW}パスワードが入力されていません。デフォルト値 'stilyastore' を使用します${NC}"
  STORE_PASS="stilyastore"
fi

read -p "キーのパスワードを入力してください（Enterでストアと同じパスワードを使用）: " KEY_PASS
if [ -z "$KEY_PASS" ]; then
  echo -e "${YELLOW}キーパスワードが入力されていません。Keystoreパスワードと同じ値を使用します${NC}"
  KEY_PASS=$STORE_PASS
fi

# エイリアス名
KEY_ALIAS="stilya-key-alias"

# 出力先ディレクトリの作成
mkdir -p android/app

# Keystoreファイルのパス
KEYSTORE_PATH="android/app/stilya-keystore.jks"

echo -e "${BLUE}Keystore生成中...${NC}"
echo "パス: $KEYSTORE_PATH"
echo "エイリアス: $KEY_ALIAS"

# Keystoreの生成
keytool -genkeypair -v \
  -keystore $KEYSTORE_PATH \
  -alias $KEY_ALIAS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass $STORE_PASS \
  -keypass $KEY_PASS \
  -dname "CN=Stilya App, OU=Mobile Development, O=Stilya, L=Toyonaka, S=Osaka, C=JP"

# 生成結果の確認
if [ -f "$KEYSTORE_PATH" ]; then
  echo -e "${GREEN}✓ Keystoreが正常に生成されました${NC}"
  ls -la $KEYSTORE_PATH

  # credentials.jsonファイルの生成
  echo -e "${BLUE}credentials.json を生成しています...${NC}"
  echo '{
  "android": {
    "keystore": {
      "keystorePath": "'"$KEYSTORE_PATH"'",
      "keystorePassword": "'"$STORE_PASS"'",
      "keyAlias": "'"$KEY_ALIAS"'",
      "keyPassword": "'"$KEY_PASS"'"
    }
  }
}' > credentials.json

  echo -e "${GREEN}✓ credentials.json が正常に生成されました${NC}"
  ls -la credentials.json

  # base64エンコード版の生成 (GitHub Secrets用)
  echo -e "${BLUE}GitHub Secrets用にKeystoreをbase64エンコードしています...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    base64 -i $KEYSTORE_PATH > keystore-base64.txt
  else
    # Linux/その他
    base64 $KEYSTORE_PATH > keystore-base64.txt
  fi

  echo -e "${GREEN}✓ base64エンコードされたKeystoreが keystore-base64.txt に保存されました${NC}"
  echo -e "${YELLOW}このファイルの内容をGitHub Secretsの ANDROID_KEYSTORE_BASE64 に設定してください${NC}"
  
  # GitHub Secretsの設定ガイド表示
  echo -e "${BLUE}==== GitHub Secrets設定ガイド ====${NC}"
  echo "1. GitHubリポジトリの Settings > Secrets and variables > Actions を開く"
  echo "2. 以下の4つのシークレットを追加:"
  echo "   - ANDROID_KEYSTORE_BASE64: keystore-base64.txt の内容"
  echo "   - ANDROID_KEY_ALIAS: $KEY_ALIAS"
  echo "   - ANDROID_KEYSTORE_PASSWORD: $STORE_PASS"
  echo "   - ANDROID_KEY_PASSWORD: $KEY_PASS"
  echo ""
  echo -e "${YELLOW}重要: これらの情報を安全な場所に保管してください。紛失するとアプリの更新ができなくなります！${NC}"
else
  echo -e "${YELLOW}エラー: Keystoreの生成に失敗しました${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}処理が完了しました！${NC}"
