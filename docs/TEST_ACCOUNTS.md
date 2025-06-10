# テストアカウント情報

## MVP開発用テストアカウント

### 最新のテストアカウント（動作確認済み）

```
メールアドレス: test1749564109932@stilya.com
パスワード: StrongPass123!
```

### 以前のテストアカウント（使用不可）

```
メールアドレス: test@stilya.com
パスワード: test123456
```

## テストアカウントの作成方法

新しいテストアカウントを作成する場合：

```bash
# 新しいテストユーザー作成スクリプト
node scripts/create-new-test-user.js
```

## 認証診断

認証に問題がある場合は、以下のスクリプトで診断できます：

```bash
# 認証診断スクリプト
node scripts/diagnose-auth.js
```

## Supabaseダッシュボード

- URL: https://supabase.com/dashboard/project/ddypgpljprljqrblpuli
- Authentication → Users でユーザー管理が可能
- Authentication → Settings で認証設定を確認

## 注意事項

- 開発環境ではメール確認を無効にすることを推奨
- パスワードは最低6文字以上（推奨: 8文字以上、大文字・小文字・数字・記号を含む）
- テスト完了後は本番環境に移行する前にテストアカウントを削除してください

## トラブルシューティング

「Invalid login credentials」エラーが発生する場合：

1. **新しいテストユーザーを作成**
   ```bash
   node scripts/create-new-test-user.js
   ```

2. **Supabaseダッシュボードで確認**
   - Email Confirmations が無効になっているか
   - パスワードポリシーが適切か

3. **環境変数を確認**
   ```bash
   cat .env | grep SUPABASE
   ```
