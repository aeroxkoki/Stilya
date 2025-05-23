# Stilya - Supabase セットアップガイド

## 前提条件

1. [Supabase](https://supabase.com/)でアカウントを作成済み
2. 新しいプロジェクトを作成済み

## セットアップ手順

### 1. データベースのセットアップ

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左側のメニューから「SQL Editor」を選択
4. `setup.sql`ファイルの内容をコピーして実行

```sql
-- setup.sqlの内容をここに貼り付けて実行
```

### 2. 環境変数の設定

1. Supabaseダッシュボードから以下の情報を取得：
   - Project Settings → API → Project URL
   - Project Settings → API → anon/public key

2. プロジェクトルートの`.env`ファイルを更新：

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_actual_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

### 3. 認証の設定

1. Supabaseダッシュボードで Authentication → Providers を選択
2. Email/Password認証を有効化
3. （オプション）Google、Appleなどのソーシャル認証も設定可能

### 4. ストレージの設定（画像用）

1. Storage → Create a new bucket
2. バケット名：`product-images`
3. Public bucketとして設定（商品画像は公開アクセス可能にする）

### 5. Row Level Security (RLS) の確認

setup.sqlで設定済みですが、以下を確認：

- `users`：ユーザー自身のデータのみアクセス可能
- `products`：全ユーザーが閲覧可能
- `swipes`：ユーザー自身のスワイプのみアクセス可能
- `favorites`：ユーザー自身のお気に入りのみアクセス可能

## テスト用データ

setup.sqlにはテスト用の商品データが含まれています。本番環境では以下の手順で実際のデータを登録：

1. LinkShare/楽天APIからデータを取得
2. `src/batch/productSyncBatch.ts`を実行してデータベースに登録

## トラブルシューティング

### 接続エラーが発生する場合

1. 環境変数が正しく設定されているか確認
2. Supabaseプロジェクトが起動しているか確認
3. ネットワーク接続を確認

### 認証エラーが発生する場合

1. anon keyが正しいか確認
2. RLSポリシーが適切に設定されているか確認
3. ユーザーが正しくログインしているか確認

## 本番環境への移行

1. 環境変数を本番用に更新
2. Supabaseの本番プロジェクトを作成
3. EAS Secretsに環境変数を登録：

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "your_production_url"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_production_key"
```