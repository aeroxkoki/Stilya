# GitHub Secrets 設定ガイド

このドキュメントでは、Stilya プロジェクトの GitHub Actions を正常に動作させるために必要な Secrets の設定方法を説明します。

## 必須 Secrets

以下の Secrets を GitHub リポジトリの Settings > Secrets and variables > Actions から設定してください：

### 1. SUPABASE_URL
- **説明**: Supabase プロジェクトの URL
- **取得方法**: Supabase ダッシュボード > Settings > API > Project URL
- **形式**: `https://xxxxxxxxxxxxx.supabase.co`

### 2. SUPABASE_ANON_KEY
- **説明**: Supabase の匿名キー（anon key）
- **取得方法**: Supabase ダッシュボード > Settings > API > Project API keys > anon public
- **形式**: 長い文字列（JWT トークン）

### 3. VALUECOMMERCE_TOKEN（オプション）
- **説明**: ValueCommerce API のアクセストークン
- **取得方法**: ValueCommerce 管理画面から取得
- **注意**: 現在は無効化されているため、設定は任意です

### 4. VALUECOMMERCE_ENABLED（オプション）
- **説明**: ValueCommerce 同期の有効/無効フラグ
- **値**: `true` または `false`
- **デフォルト**: `false`

## 設定手順

1. GitHub リポジトリページを開く
2. Settings タブをクリック
3. 左サイドバーから Security > Secrets and variables > Actions を選択
4. "New repository secret" ボタンをクリック
5. Name と Secret value を入力
6. "Add secret" をクリック

## 設定確認

すべての Secrets が正しく設定されているか確認するには：

```bash
# GitHub Actions のワークフローを手動実行
gh workflow run "Daily Maintenance Patch" --ref main

# または GitHub UI から Actions タブで手動実行
```

## トラブルシューティング

### エラー: 環境変数が設定されていません
- SUPABASE_URL と SUPABASE_ANON_KEY が正しく設定されているか確認
- Secrets の名前が正確に一致しているか確認（大文字小文字も含む）

### エラー: ValueCommerce API エラー
- VALUECOMMERCE_ENABLED を `false` に設定するか、未設定にする
- または VALUECOMMERCE_TOKEN を正しく設定する

## セキュリティ注意事項

- Secrets の値をコードやログに直接出力しない
- Secrets の値を他の人と共有しない
- 定期的に API キーをローテーションする

## 環境変数の優先順位

スクリプトは以下の優先順位で環境変数を読み込みます：

1. `SUPABASE_URL` または `EXPO_PUBLIC_SUPABASE_URL`
2. `SUPABASE_ANON_KEY` または `EXPO_PUBLIC_SUPABASE_ANON_KEY`

どちらか一方が設定されていれば動作します。
