# Supabase認証エラー解決ガイド

## 問題: Invalid login credentials

### エラーの原因
1. **既存のテストアカウントのパスワードが不明または変更された**
2. **Supabaseのパスワードポリシー変更による影響**
3. **メール確認が必要な設定になっている**

## 根本的な解決策

### 1. 新しいテストアカウントの作成

```bash
# 新しいテストユーザーを作成
node scripts/create-new-test-user.js
```

**最新の動作確認済みアカウント:**
- メール: `test1749564109932@stilya.com`
- パスワード: `StrongPass123!`

### 2. 認証診断の実行

```bash
# 認証システムの診断
node scripts/diagnose-auth.js
```

### 3. デバッグ情報の強化

`AuthContext.tsx`にデバッグ情報を追加済み：
- エラーの詳細情報をコンソールに出力
- エラーメッセージに最新のテストアカウント情報を表示

### 4. Supabaseダッシュボードでの確認事項

1. **Authentication → Settings**
   - Email Auth が有効になっているか
   - Confirm email が無効（開発環境の場合）
   - Password requirements を確認

2. **SQL Editor → Table Editor**
   - `users`テーブルが存在するか
   - RLSポリシーが適切に設定されているか

### 5. 開発環境での推奨設定

`.env`ファイル：
```env
EXPO_PUBLIC_SUPABASE_URL=https://ddypgpljprljqrblpuli.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. トラブルシューティングスクリプト

プロジェクトには以下の診断・修正スクリプトが用意されています：

- `scripts/create-new-test-user.js` - 新しいテストユーザー作成
- `scripts/diagnose-auth.js` - 認証システムの診断
- `scripts/test-supabase-connection.js` - Supabase接続テスト
- `scripts/check-supabase-config.sh` - 設定確認

## 今後の予防策

1. **パスワードポリシーの明確化**
   - 最低8文字以上
   - 大文字・小文字・数字・記号を含む

2. **テストアカウントの管理**
   - 定期的に新しいテストアカウントを作成
   - アカウント情報を`docs/TEST_ACCOUNTS.md`に記録

3. **エラーハンドリングの改善**
   - より詳細なエラーメッセージ
   - デバッグ情報の充実

4. **CI/CDでの自動テスト**
   - 認証フローの自動テスト
   - 定期的な接続チェック

## 本番環境への移行時の注意

1. メール確認を有効化
2. より強力なパスワードポリシーを設定
3. テストアカウントを削除
4. RLSポリシーの見直し
5. 環境変数の本番用設定への切り替え
