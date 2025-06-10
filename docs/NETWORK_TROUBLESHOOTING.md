# Network Connection Troubleshooting Guide

## 実機でのNetwork Request Failedエラーの解決方法

### 問題の概要
実機テストで「Network request failed」エラーが発生し、Supabaseに接続できない問題が報告されています。

### 現在の診断結果
- ✅ ネットワーク接続: 正常
- ✅ インターネット到達性: 確認済み
- ❌ Supabase URL到達性: Network request failed
- ✅ Supabase認証: 成功（矛盾）
- ❌ データベース接続: TypeError: Network request failed

### 実施済みの修正

1. **環境変数の設定を修正**
   - オンラインSupabaseのURLをデフォルトで使用
   - ローカルSupabaseは明示的に指定した場合のみ使用

2. **カスタムfetch実装**
   - React Native用のfetch設定を追加
   - URLを文字列に変換
   - 適切なヘッダーを設定

3. **接続診断ツールの改善**
   - HTTPS接続テスト（Google）を追加
   - より詳細なエラー情報を表示

### 追加の確認事項

#### 1. アプリの再ビルド
```bash
# キャッシュをクリア
npx expo start --clear

# 開発ビルドを再実行
npx expo run:ios
# または
npx expo run:android
```

#### 2. ネットワーク設定の確認

**iOS の場合:**
- Info.plistでNSAllowsArbitraryLoadsがtrueになっていることを確認
- Supabaseのドメインが例外に追加されていることを確認

**Android の場合:**
- android/app/src/main/AndroidManifest.xmlに以下を追加:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

#### 3. Supabase URLの確認
```bash
# .envファイルを確認
cat .env | grep SUPABASE

# 正しい形式:
EXPO_PUBLIC_SUPABASE_URL=https://[プロジェクトID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[アノンキー]
```

#### 4. デバッグ情報の収集

開発メニューから「🩺 詳細接続診断」を実行し、以下を確認:

1. **環境変数チェック**
   - URLが正しく設定されているか
   - キーが設定されているか

2. **HTTPS接続テスト（Google）**
   - 基本的なHTTPS接続が機能しているか

3. **Supabase URL到達性**
   - 具体的なエラーメッセージ
   - エラースタック

### 考えられる原因と対処法

#### 1. 証明書の問題
- Supabaseの証明書が実機で信頼されていない可能性
- 対処: 最新のExpo SDKとReact Nativeバージョンを使用

#### 2. プロキシ/ファイアウォール
- 企業ネットワークやVPNが接続をブロックしている可能性
- 対処: 別のネットワークで試す

#### 3. React Nativeのfetch実装の問題
- 特定のバージョンでの互換性問題
- 対処: React Nativeのバージョンを更新

### 次のステップ

1. **詳細なログを確認**
   ```bash
   # Metroバンドラーのログを確認
   npx expo start --clear
   ```

2. **Supabaseサポートに連絡**
   - プロジェクトIDと具体的なエラーメッセージを提供

3. **代替案を検討**
   - 一時的にaxiosライブラリを使用
   - カスタムHTTPクライアントの実装

### 関連ファイル
- `/src/services/supabase.ts` - Supabase接続設定
- `/src/utils/env.ts` - 環境変数管理
- `/src/components/dev/ConnectionDiagnostics.tsx` - 接続診断ツール
- `/src/lib/network-polyfill.ts` - ネットワーク設定

### 参考情報
- [React Native Networking](https://reactnative.dev/docs/network)
- [Expo Network](https://docs.expo.dev/versions/latest/sdk/network/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/with-react-native)
