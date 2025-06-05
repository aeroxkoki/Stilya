# Supabase接続診断ガイド

## 概要
Stilyaアプリ内でSupabaseの接続状態を診断するための機能です。

## アクセス方法

1. アプリを開発モードで起動します：
   ```bash
   npm start
   ```

2. アプリ内で右下の開発メニューボタン（🛠）をタップ

3. 「🔌 Supabase接続テスト」をタップ

## テスト項目

### 1. 環境変数チェック
- `EXPO_PUBLIC_SUPABASE_URL`と`EXPO_PUBLIC_SUPABASE_ANON_KEY`が設定されているか確認

### 2. URL形式チェック
- Supabase URLが有効な形式かチェック

### 3. 基本接続テスト
- Supabaseクライアントが正常に動作するか確認

### 4. REST APIエンドポイント
- Supabase REST APIへの接続を確認

### 5. 認証状態
- 現在のログイン状態を確認

### 6. テーブルアクセステスト
以下のテーブルへのアクセス権限を確認：
- `users`
- `products`
- `swipes`
- `favorites`
- `click_logs`

## トラブルシューティング

### 環境変数が未設定の場合
1. `.env`ファイルを確認
2. 以下の形式で設定されているか確認：
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 接続エラーの場合
1. Supabaseプロジェクトが一時停止していないか確認
2. ネットワーク接続を確認
3. Supabaseダッシュボードで設定を確認

### テーブルアクセスエラーの場合
1. Supabaseダッシュボードで各テーブルが作成されているか確認
2. Row Level Security (RLS) ポリシーを確認

## Supabase再開手順

もしSupabaseプロジェクトが一時停止している場合：

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 「Resume project」または「Restore project」をクリック
4. 数分待つ（プロジェクトの起動には時間がかかります）
5. アプリ内でSupabase接続テストを再実行

## よくある質問

### Q: テスト結果が全て赤い（エラー）
A: まずSupabaseプロジェクトが稼働中か確認してください。一時停止している場合は上記の再開手順を実行してください。

### Q: 認証は成功するがテーブルアクセスでエラー
A: テーブルが作成されていない可能性があります。Supabaseダッシュボードで必要なテーブルを作成してください。

### Q: URLが無効と表示される
A: `.env`ファイルのSupabase URLが正しい形式か確認してください。`https://`で始まる必要があります。

## 連絡先
問題が解決しない場合は、プロジェクトのIssueで報告してください。
