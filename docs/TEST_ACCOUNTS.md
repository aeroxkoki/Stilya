# テストアカウント情報

## MVP開発用テストアカウント

以下のアカウントでログインテストができます：

```
メールアドレス: test@stilya.com
パスワード: test123456
```

## テストアカウントの作成方法

新しいテストアカウントを作成する場合：

```bash
# スクリプトを使用して作成
node scripts/create-test-user.js
```

または、アプリ内の「アカウントを作成する」から新規登録できます。

## Supabaseダッシュボード

- URL: https://supabase.com/dashboard/project/ddypgpljprljqrblpuli
- Authentication → Users でユーザー管理が可能

## 注意事項

- 開発環境ではメール確認が無効になっている場合があります
- Supabaseダッシュボードで設定を確認してください
- テスト完了後は本番環境に移行する前にテストアカウントを削除してください
