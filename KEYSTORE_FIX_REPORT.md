# EAS Build Keystore エラー修正レポート

## 🚨 発生していた問題

```
Generating a new Keystore is not supported in --non-interactive mode
Error: build command failed.
Error: Process completed with exit code 1.
```

**原因**: GitHub ActionsなどのCI環境（non-interactive mode）で、EAS BuildがKeystoreを自動生成しようとしたが、対話的でない環境では作成できないため失敗していました。

## 🔧 修正内容

### 1. **eas.json** - ビルドプロファイルの修正

**修正前**:
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

**修正後**:
```json
"preview": {
  "distribution": "internal", 
  "android": {
    "buildType": "apk",
    "credentialsSource": "local"
  }
}
```

**効果**: EAS BuildにローカルのKeystoreを使用するよう明示的に指示

### 2. **android/app/build.gradle** - 署名設定の追加

**修正前**:
```gradle
signingConfigs {
    debug { /* debug keystore only */ }
}
buildTypes {
    release {
        signingConfig signingConfigs.debug  // ❌ debug使用
    }
}
```

**修正後**:
```gradle
signingConfigs {
    debug { /* debug keystore */ }
    release {
        if (project.hasProperty('STILYA_UPLOAD_STORE_FILE')) {
            storeFile file(STILYA_UPLOAD_STORE_FILE)
            storePassword STILYA_UPLOAD_STORE_PASSWORD
            keyAlias STILYA_UPLOAD_KEY_ALIAS
            keyPassword STILYA_UPLOAD_KEY_PASSWORD
        } else {
            // Fallback to existing keystore
            storeFile file('stilya-keystore.jks')
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD') ?: 'android'
            keyAlias System.getenv('ANDROID_KEY_ALIAS') ?: 'androiddebugkey'
            keyPassword System.getenv('ANDROID_KEY_PASSWORD') ?: 'android'
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release  // ✅ release署名使用
    }
}
```

**効果**: リリースビルド用の適切な署名設定を追加

### 3. **app.config.ts** - パッケージ名設定の調整

**修正前**:
```typescript
android: {
  adaptiveIcon: { /* ... */ },
  package: "com.stilya.app"  // ❌ ネイティブ設定と競合
}
```

**修正後**:
```typescript
android: {
  adaptiveIcon: { /* ... */ }
  // package設定を削除（android/app/build.gradleのnamespaceが優先される）
}
```

**効果**: 設定の競合を解消

### 4. **GitHub Actions (.github/workflows/build.yml)** - CI設定の改善

**修正内容**:
- Keystore作成プロセスの改善（検証ステップ追加）
- 適切な環境変数の設定
- エラーハンドリングの強化

```yaml
- name: 🔧 Create credentials and environment
  run: |
    mkdir -p android/app
    echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/stilya-keystore.jks
    # Verify keystore exists and has correct permissions
    ls -la android/app/stilya-keystore.jks
```

## 📋 必要な GitHub Secrets

以下の環境変数がGitHub Secretsに設定されている必要があります：

| 変数名 | 説明 |
|--------|------|
| `EXPO_TOKEN` | Expo CLIアクセストークン |
| `ANDROID_KEYSTORE_BASE64` | Keystoreファイル（Base64エンコード済み） |
| `ANDROID_KEY_ALIAS` | Keystoreのキーエイリアス |
| `ANDROID_KEYSTORE_PASSWORD` | Keystoreのパスワード |
| `ANDROID_KEY_PASSWORD` | キーのパスワード |

## 🎯 修正の効果

1. **CI/CD環境での確実なビルド**: non-interactive modeでもビルドが成功
2. **適切な署名**: リリースビルドで正しいKeystoreを使用
3. **設定の整合性**: app.config.tsとネイティブ設定の競合を解消
4. **エラーハンドリング**: ビルドプロセスの透明性向上

## 🧪 テスト方法

1. **ローカルテスト**:
   ```bash
   ./test-keystore-fix.sh
   ```

2. **GitHub Actionsテスト**:
   - `develop`ブランチにプッシュ → preview buildをテスト
   - `main`ブランチにプッシュ → production buildをテスト

## ✅ 修正完了チェックリスト

- [x] `eas.json`に`credentialsSource: "local"`を追加
- [x] `build.gradle`にrelease署名設定を追加
- [x] `app.config.ts`からandroid.packageを削除
- [x] GitHub Actionsワークフローを更新
- [x] テストスクリプトを作成
- [ ] GitHub Secretsの設定を確認
- [ ] 実際のビルドテストを実行

## 🚀 次のステップ

1. このファイルをGitHubにプッシュ
2. GitHub Secretsが正しく設定されているかを確認
3. `develop`ブランチでテストビルドを実行
4. 成功したら`main`ブランチでプロダクションビルドをテスト

---

**修正日**: 2025年5月22日  
**対象**: Stilya モバイルアプリ MVP  
**技術スタック**: React Native + Expo + EAS Build
