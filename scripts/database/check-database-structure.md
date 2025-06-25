# Stilya データベース構造確認手順書

## 1. 確認方法の選択

### 方法A: Supabase Dashboard（推奨）
最も簡単で視覚的に確認できる方法です。

### 方法B: Supabase CLI
ローカル環境から直接確認できます。

### 方法C: SQL クエリ
詳細な情報を取得できます。

## 2. Supabase Dashboard での確認手順

### 2.1 ログイン
1. https://app.supabase.com にアクセス
2. プロジェクトを選択

### 2.2 Table Editor で確認
1. 左側メニューから「Table Editor」を選択
2. 以下のテーブルを確認：
   - `external_products`
   - `swipes`
   - `products`（もし存在すれば）

### 2.3 確認すべき項目

#### external_products テーブル
- [ ] カラム一覧をスクリーンショット
- [ ] Primary Key がどのカラムか確認
- [ ] `id` カラムの存在とデータ型
- [ ] `product_id` カラムの存在とデータ型
- [ ] Unique制約の確認
- [ ] サンプルデータを5件程度確認

#### swipes テーブル
- [ ] `product_id` カラムのデータ型
- [ ] Foreign Key 制約の確認
- [ ] どのテーブルのどのカラムを参照しているか

## 3. Supabase CLI での確認手順

### 3.1 プロジェクトに接続
```bash
cd /Users/koki_air/Documents/GitHub/Stilya

# Supabase にログイン
supabase login

# プロジェクトをリンク（初回のみ）
supabase link --project-ref [YOUR_PROJECT_REF]
```

### 3.2 データベース情報の取得
```bash
# データベースに直接接続
supabase db remote commit
```

## 4. SQL クエリによる詳細確認

### 4.1 SQL Editor での実行手順
1. Supabase Dashboard の左側メニューから「SQL Editor」を選択
2. 新しいクエリを作成
3. `comprehensive-structure-check.sql` の内容をコピー＆ペースト
4. 各セクションを個別に実行して結果を確認

### 4.2 重要な確認ポイント

#### A. ID構造の確認
```sql
-- external_productsのidとproduct_idの関係を確認
SELECT 
    id,
    product_id,
    title,
    source_brand,
    created_at
FROM external_products
LIMIT 10;
```

**確認事項**:
- `id` と `product_id` は同じ値か、異なる値か？
- どちらがプライマリキーか？
- どちらがアプリケーションで使用されているか？

#### B. 外部キー制約の確認
```sql
-- swipesテーブルがどのカラムを参照しているか確認
SELECT
    tc.constraint_name,
    kcu.column_name as "swipes.product_id が参照する列",
    ccu.table_name AS "参照先テーブル",
    ccu.column_name AS "参照先カラム"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'swipes'
    AND kcu.column_name = 'product_id';
```

**確認事項**:
- swipes.product_id → external_products.id を参照？
- それとも swipes.product_id → external_products.product_id を参照？

#### C. ID形式の分析
```sql
-- 新旧のID形式を確認
SELECT 
    CASE 
        WHEN product_id LIKE 'UNIQLO_%' THEN 'UNIQLO形式'
        WHEN product_id LIKE 'GU_%' THEN 'GU形式'
        WHEN product_id LIKE '%_%_%' THEN '新形式（ブランド_タイトル_価格）'
        WHEN product_id ~ '^[0-9]+$' THEN '数値のみ（楽天商品コード）'
        ELSE 'その他'
    END as "ID形式",
    COUNT(*) as "件数",
    MAX(created_at) as "最新追加日"
FROM external_products
GROUP BY 1
ORDER BY 3 DESC;
```

## 5. 実行結果の記録

### 5.1 記録テンプレート
```markdown
# データベース構造確認結果

## 実行情報
- 実行日時: 2024-XX-XX HH:MM
- 実行者: [名前]
- Supabase Project: [プロジェクト名]

## 1. external_products テーブル

### プライマリキー
- カラム名: [id or product_id]
- データ型: [text/uuid/etc]

### カラム構成
| カラム名 | データ型 | NULL許可 | 備考 |
|---------|---------|----------|------|
| id | | | |
| product_id | | | |
| ... | | | |

### サンプルデータ
```
[ここにサンプルデータを貼り付け]
```

## 2. swipes テーブル

### 外部キー制約
- 参照元: swipes.product_id
- 参照先: external_products.[id or product_id]
- 削除ルール: [CASCADE/RESTRICT/etc]

## 3. 発見された問題点
- [ ] 問題1: 
- [ ] 問題2: 

## 4. 推奨アクション
1. 
2. 
```

### 5.2 結果の保存
1. 実行結果をMarkdownファイルとして保存
2. スクリーンショットを含める
3. チームと共有

## 6. トラブルシューティング

### Q1: Supabase CLIが動作しない
A: 以下を確認してください：
- Node.js がインストールされているか
- `npm install -g supabase` でCLIをインストール
- `supabase --version` でバージョン確認

### Q2: SQLクエリがタイムアウトする
A: 大量のデータがある場合は、LIMIT句を追加して実行してください。

### Q3: 権限エラーが発生する
A: Supabaseのダッシュボードで、使用しているロールの権限を確認してください。

## 7. 次のステップ

確認結果に基づいて：
1. 不整合が発見された場合 → 修正スクリプトの作成
2. 問題がない場合 → 本番環境への展開準備
3. 不明な点がある場合 → 追加調査の実施
