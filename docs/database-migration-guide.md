# データベーススキーマ統一移行ガイド

## 概要
このドキュメントは、Stilyaプロジェクトのデータベーススキーマを統一する手順を説明します。
`products`テーブルと`external_products`テーブルの混在を解消し、`external_products`に統一します。

## 移行の目的
- データ型の不整合を解消（UUID vs TEXT）
- テーブル間のリレーションを正常化
- アプリケーションエラーの根本的解決

## 移行手順

### 1. 事前準備
- Supabaseダッシュボードへのアクセス権限を確認
- 現在のデータのバックアップを取得

### 2. 移行スクリプトの実行
Supabaseダッシュボードの SQL エディタで以下のファイルを実行：

```sql
-- ファイル: supabase/migrations/004_unify_products_schema.sql
```

このスクリプトは以下を実行します：
1. 既存データのバックアップ
2. 外部キー制約の削除
3. カラム型の変更（UUID → TEXT）
4. 新しい外部キー制約の追加
5. 古い`products`テーブルの削除

### 3. アプリケーションコードの変更
以下のファイルが更新されています：
- `src/services/supabase.ts` - テーブル定義の更新
- `src/services/recommendationService.ts` - クエリの修正
- `src/navigation/ReportNavigator.tsx` - スクリーン名の重複解消

### 4. 動作確認
1. アプリを再起動
2. スワイプ機能の動作確認
3. レコメンド機能の動作確認
4. エラーログの確認

### 5. バックアップの削除（オプション）
移行が正常に完了したことを確認後：
```sql
DROP TABLE IF EXISTS swipes_backup;
```

## トラブルシューティング

### エラー: "relation does not exist"
- 移行スクリプトが正しく実行されていない可能性があります
- Supabaseダッシュボードで`external_products`テーブルの存在を確認してください

### エラー: "foreign key constraint violation"
- データの不整合がある可能性があります
- バックアップから復元して再試行してください

## ロールバック手順
問題が発生した場合は、以下の手順でロールバックできます：

1. バックアップテーブルから復元
```sql
-- swipesテーブルを復元
DROP TABLE swipes;
ALTER TABLE swipes_backup RENAME TO swipes;
```

2. アプリケーションコードを以前のバージョンに戻す
```bash
git checkout HEAD~1
```

## 完了後の確認事項
- [ ] エラーログが解消されている
- [ ] すべての機能が正常に動作している
- [ ] パフォーマンスの低下がない

## 更新履歴
- 2025-06-06: 初版作成
