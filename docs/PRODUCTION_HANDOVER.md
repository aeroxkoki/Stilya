# Production to Development Handover Document
# 本番環境への引き継ぎドキュメント

## 概要
このドキュメントは、Stilyaアプリの開発環境から本番環境への移行時に必要な手順と注意事項をまとめたものです。

## 1. 現在の開発環境の状況

### 修正内容
1. **Supabase接続エラーの対応**
   - `src/services/supabase.ts`を修正
   - ネットワークエラーのデバッグ機能を追加
   - エラーハンドリングの改善

2. **UIコンポーネントの修正**
   - `src/screens/auth/AuthScreen.tsx`のアイコン表示エラーを修正
   - TextInputのleftIconプロパティにReact要素を渡すように変更

3. **開発用モックサービス**
   - `src/services/devSupabase.ts`を作成（使用していません）

## 2. 本番環境への移行手順

### 2.1 環境変数の確認
```bash
# .envファイルの内容を確認
cat .env

# 以下の環境変数が正しく設定されていることを確認
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2.2 デバッグコードの削除

1. **supabase.tsのデバッグコードを削除**
```typescript
// 以下のコンソールログを削除またはコメントアウト
console.log('[supabase.ts] 1. ファイル読み込み開始');
console.log('[supabase.ts] 2. インポート完了');
// ... その他のデバッグログ

// fetchインターセプトのコードを削除（66-88行目）
if (__DEV__) {
  // このブロック全体を削除
}
```

2. **本番用のSupabaseクライアント設定**
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: false, // 本番環境ではfalseに設定
  },
  realtime: {
    enabled: true, // 必要に応じてRealtimeを有効化
  },
  global: {
    headers: {
      'X-Client-Info': 'stilya-app/1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
});
```

### 2.3 不要なファイルの削除
```bash
# 開発用モックサービスを削除
rm src/services/devSupabase.ts
```

### 2.4 ビルド前のチェックリスト

- [ ] すべてのデバッグログを削除
- [ ] 環境変数が本番用に設定されている
- [ ] `__DEV__`に依存するコードが適切に処理されている
- [ ] TypeScriptのエラーがない
- [ ] ESLintのエラーがない

## 3. ネットワーク接続問題の解決

### 3.1 開発環境での問題
Expo開発環境では、以下の理由でSupabaseへの接続が失敗することがあります：
- Expo GoアプリのネットワークポリシーRestrictions
- Metro Bundlerのプロキシ設定
- HTTPSとHTTPの混在

### 3.2 解決策
1. **Expo CLIの再起動**
```bash
# Metro Bundlerをクリアして再起動
npx expo start -c
```

2. **ネットワーク設定の確認**
- VPNを無効化
- ファイアウォールの設定を確認
- プロキシ設定を確認

3. **代替の開発方法**
```bash
# Expo Goの代わりに開発ビルドを使用
npx expo prebuild
npx expo run:ios  # または run:android
```

## 4. 本番ビルドの作成

### 4.1 EAS Buildの設定
```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

### 4.2 ビルドコマンド
```bash
# 本番ビルドの作成
eas build --platform all --profile production
```

## 5. テスト手順

### 5.1 ローカルテスト
```bash
# テストスクリプトの実行
npm run test:local
```

### 5.2 本番環境でのテスト項目
- [ ] ユーザー登録・ログイン機能
- [ ] 商品データの取得
- [ ] スワイプ機能
- [ ] 推薦機能
- [ ] アフィリエイトリンクの動作

## 6. トラブルシューティング

### 問題: Network request failed
**原因**: Expo開発環境でのネットワーク制限
**解決策**: 
1. 開発ビルドを使用
2. 実機でのテスト
3. VPN/プロキシの無効化

### 問題: AsyncStorage errors
**原因**: AsyncStorageの初期化問題
**解決策**: アプリを完全に再起動

### 問題: 認証エラー
**原因**: Supabaseの設定ミス
**解決策**: 
1. Supabaseダッシュボードで認証設定を確認
2. URLとAPIキーが正しいか確認

## 7. 連絡先

問題が発生した場合は、以下の情報と共に開発チームに連絡してください：
- エラーログ
- 再現手順
- 環境情報（OS、Expoバージョンなど）

---
最終更新日: 2025年1月
