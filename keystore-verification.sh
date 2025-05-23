#!/bin/bash

# 🔐 Stilya Keystore 詳細検証レポート
# 実行日: $(date)

echo "🔐 STILYA KEYSTORE 詳細検証レポート"
echo "=================================================="
echo "実行日時: $(date)"
echo ""

# 1. Keystoreファイル検証
echo "📁 1. KEYSTOREファイル存在確認"
echo "----------------------------------------"
if [ -f "android/app/stilya-keystore.jks" ]; then
    echo "✅ メインkeystore: android/app/stilya-keystore.jks"
    ls -la android/app/stilya-keystore.jks
    echo "   サイズ: $(ls -lh android/app/stilya-keystore.jks | awk '{print $5}')"
    echo "   ファイルタイプ: $(file android/app/stilya-keystore.jks | cut -d: -f2)"
else
    echo "❌ メインkeystoreが見つかりません"
fi

if [ -f "android/app/debug.keystore" ]; then
    echo "✅ デバッグkeystore: android/app/debug.keystore"
    ls -la android/app/debug.keystore
else
    echo "❌ デバッグkeystoreが見つかりません"
fi

if [ -f "keystore-base64.txt" ]; then
    echo "✅ Base64エンコード済みkeystore: keystore-base64.txt"
    echo "   Base64データサイズ: $(wc -c < keystore-base64.txt) bytes"
else
    echo "❌ Base64 keystoreデータが見つかりません"
fi

echo ""

# 2. EAS.JSON設定確認
echo "⚙️  2. EAS.JSON設定確認"
echo "----------------------------------------"
if grep -q '"credentialsSource": "local"' eas.json; then
    echo "✅ credentialsSource: local が設定されています"
    echo "   設定箇所:"
    grep -n -A2 -B2 '"credentialsSource": "local"' eas.json
else
    echo "❌ credentialsSource: local 設定がありません"
fi

echo ""

# 3. BUILD.GRADLE署名設定確認
echo "🔧 3. BUILD.GRADLE署名設定確認"
echo "----------------------------------------"
if grep -q "signingConfig signingConfigs.release" android/app/build.gradle; then
    echo "✅ Release signing configが正しく設定されています"
else
    echo "❌ Release signing config設定に問題があります"
fi

if grep -q "storeFile file('stilya-keystore.jks')" android/app/build.gradle; then
    echo "✅ Keystoreファイルパスが正しく設定されています"
else
    echo "❌ Keystoreファイルパス設定に問題があります"
fi

echo ""

# 4. Github Actions設定確認
echo "🎯 4. GITHUB ACTIONS設定確認"
echo "----------------------------------------"
if grep -q "credentialsSource.*local" .github/workflows/build.yml; then
    echo "✅ GitHub ActionsでcredentialsSource設定を使用"
else
    echo "❌ GitHub ActionsでcredentialsSource設定が不明"
fi

if grep -q "stilya-keystore.jks" .github/workflows/build.yml; then
    echo "✅ GitHub ActionsでKeystoreファイル作成処理あり"
else
    echo "❌ GitHub ActionsでKeystoreファイル作成処理なし"
fi

echo ""

# 5. Base64データ整合性確認
echo "🔍 5. BASE64データ整合性確認"
echo "----------------------------------------"
if [ -f "keystore-base64.txt" ]; then
    # Base64からkeystoreを復元してテスト
    echo "Base64データから一時keystoreを作成中..."
    cat keystore-base64.txt | base64 -d > temp-verification-keystore.jks 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Base64デコードが成功しました"
        
        # ファイルサイズ比較
        original_size=$(stat -f%z android/app/stilya-keystore.jks 2>/dev/null)
        decoded_size=$(stat -f%z temp-verification-keystore.jks 2>/dev/null)
        
        if [ "$original_size" = "$decoded_size" ]; then
            echo "✅ ファイルサイズが一致しています ($original_size bytes)"
        else
            echo "⚠️  ファイルサイズが異なります (original: $original_size, decoded: $decoded_size)"
        fi
        
        # ファイル内容比較
        if diff android/app/stilya-keystore.jks temp-verification-keystore.jks >/dev/null 2>&1; then
            echo "✅ Base64データとオリジナルkeystoreが完全に一致しています"
        else
            echo "❌ Base64データとオリジナルkeystoreが異なります"
        fi
        
        # クリーンアップ
        rm -f temp-verification-keystore.jks
    else
        echo "❌ Base64デコードに失敗しました"
    fi
else
    echo "❌ Base64データファイルがありません"
fi

echo ""

# 6. 必要な環境変数チェック
echo "🌐 6. 必要な環境変数確認"
echo "----------------------------------------"
required_vars=(
    "EXPO_TOKEN"
    "ANDROID_KEYSTORE_BASE64"
    "ANDROID_KEY_ALIAS"
    "ANDROID_KEYSTORE_PASSWORD"
    "ANDROID_KEY_PASSWORD"
)

echo "ローカル環境での確認 (GitHub Secretsとは別):"
for var in "${required_vars[@]}"; do
    if [ -n "${!var}" ]; then
        echo "✅ $var: 設定されています"
    else
        echo "⚠️  $var: 設定されていません (GitHub Secretsで設定する必要があります)"
    fi
done

echo ""

# 7. 総合判定
echo "📋 7. 総合判定"
echo "----------------------------------------"
issues=0

# 重要なファイルの存在確認
if [ ! -f "android/app/stilya-keystore.jks" ]; then
    echo "❌ 重要: keystoreファイルが見つかりません"
    issues=$((issues + 1))
fi

if [ ! -f "keystore-base64.txt" ]; then
    echo "❌ 重要: Base64 keystoreデータが見つかりません"
    issues=$((issues + 1))
fi

# 設定確認
if ! grep -q '"credentialsSource": "local"' eas.json; then
    echo "❌ 重要: eas.jsonの設定に問題があります"
    issues=$((issues + 1))
fi

if ! grep -q "signingConfig signingConfigs.release" android/app/build.gradle; then
    echo "❌ 重要: build.gradleの署名設定に問題があります"
    issues=$((issues + 1))
fi

echo ""
if [ $issues -eq 0 ]; then
    echo "🎉 全体評価: 合格 ✅"
    echo "   Keystore設定は正常に構成されています。"
    echo "   GitHub Secretsの設定を確認後、ビルドテストを実行してください。"
else
    echo "⚠️  全体評価: 要修正"
    echo "   $issues 個の問題が見つかりました。上記の項目を確認してください。"
fi

echo ""
echo "📝 推奨アクション:"
echo "1. GitHub リポジトリの Settings > Secrets で以下を設定:"
echo "   - EXPO_TOKEN (Expo アカウントのアクセストークン)"
echo "   - ANDROID_KEYSTORE_BASE64 (keystore-base64.txtの内容)"
echo "   - ANDROID_KEY_ALIAS (keystoreのキーエイリアス名)"
echo "   - ANDROID_KEYSTORE_PASSWORD (keystoreのパスワード)"
echo "   - ANDROID_KEY_PASSWORD (キーのパスワード)"
echo ""
echo "2. developブランチでテストビルドを実行"
echo "3. 成功後、mainブランチでプロダクションビルドを実行"
echo ""
echo "=================================================="
echo "検証完了: $(date)"
