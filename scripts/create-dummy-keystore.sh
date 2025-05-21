#!/bin/bash
# Stilya用ダミーキーストア生成スクリプト

echo "🔑 Creating dummy keystore for development..."

# 作業ディレクトリの確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ディレクトリ作成
mkdir -p "$PROJECT_ROOT/android/app"

# キーストアパス
KEYSTORE_PATH="$PROJECT_ROOT/android/app/stilya-keystore.jks"

# キーストアが既に存在する場合はスキップ
if [ -f "$KEYSTORE_PATH" ]; then
  echo "✅ Keystore already exists at: $KEYSTORE_PATH"
  exit 0
fi

# keytool コマンドの存在を確認
if ! command -v keytool &> /dev/null; then
  echo "⚠️ keytool command not found. Using dummy keystore content."
  
  # バイナリダミーファイルを生成
  dd if=/dev/urandom of="$KEYSTORE_PATH" bs=1024 count=4
  
  echo "✅ Created dummy keystore at: $KEYSTORE_PATH"
  echo "⚠️ Note: This is a non-functional dummy keystore for CI only."
  exit 0
fi

# keytoolでキーストア作成
keytool -genkeypair \
  -alias androiddebugkey \
  -keypass android \
  -keystore "$KEYSTORE_PATH" \
  -storepass android \
  -dname "CN=Android Debug,O=Android,C=US" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -deststoretype pkcs12

if [ $? -eq 0 ]; then
  echo "✅ Created valid development keystore at: $KEYSTORE_PATH"
  ls -la "$KEYSTORE_PATH"
else
  echo "⚠️ Failed to create keystore using keytool. Creating dummy keystore."
  dd if=/dev/urandom of="$KEYSTORE_PATH" bs=1024 count=4
  echo "✅ Created dummy keystore at: $KEYSTORE_PATH"
fi

# credentials.jsonが存在しない場合は作成
CREDENTIALS_PATH="$PROJECT_ROOT/credentials.json"
if [ ! -f "$CREDENTIALS_PATH" ]; then
  echo "📝 Creating credentials.json..."
  cat > "$CREDENTIALS_PATH" << EOF
{
  "android": {
    "keystore": {
      "keystorePath": "android/app/stilya-keystore.jks",
      "keystorePassword": "android",
      "keyAlias": "androiddebugkey",
      "keyPassword": "android"
    }
  }
}
EOF
  chmod 644 "$CREDENTIALS_PATH"
  echo "✅ Created credentials.json with default development values"
fi

echo "🔐 Keystore setup completed"