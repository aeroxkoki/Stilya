# Stilya - 中古品フィルター機能実装ガイド

## 概要

このドキュメントは、Stilyaアプリの中古品フィルター機能の実装状況と設定手順をまとめたものです。

## 実装状況

### ✅ 実装済み

#### フロントエンド
- **FilterModal.tsx**: 「商品の状態」セクション実装済み（新品のみ/すべて）
- **SwipeCard.tsx**: 中古品ラベル表示機能実装済み
- **ProductCard.tsx**: 中古品ラベル表示機能実装済み
- **型定義**: Product型に`isUsed`フィールド、FilterOptions型に`includeUsed`フィールド定義済み

#### バックエンド
- **productService.ts**: 
  - 中古品フィルタリングロジック実装済み（デフォルトは新品のみ）
  - normalizeProduct関数で`isUsed`フィールドのマッピング実装済み
- **rakutenService.ts**: 
  - `isUsedProduct`関数による中古品判定ロジック実装済み
  - 商品タイトルとショップ名から自動判定

### ❌ 未実装

#### データベース
- **is_usedカラム**: external_productsテーブルにカラムが存在しない
- **インデックス**: パフォーマンス向上のためのインデックスが未作成

## セットアップ手順

### 1. データベースの更新

Supabaseダッシュボードで以下のSQLを実行してください：

```sql
-- 中古品フィルター機能のためのカラム追加
-- external_productsテーブルにis_usedカラムを追加

-- is_usedカラムの追加（中古品フラグ）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT false;

-- パフォーマンス向上のためのインデックス作成
CREATE INDEX IF NOT EXISTS idx_external_products_is_used 
ON external_products (is_used);

-- 既存データの更新（商品名とショップ名から中古品を判定）
UPDATE external_products
SET is_used = true
WHERE is_used = false
  AND (
    -- タイトルに中古関連キーワードが含まれる
    LOWER(title) LIKE '%中古%'
    OR LOWER(title) LIKE '%used%'
    OR LOWER(title) LIKE '%ユーズド%'
    OR LOWER(title) LIKE '%セカンドハンド%'
    OR LOWER(title) LIKE '%リユース%'
    -- ブランド/ショップ名に中古専門店が含まれる
    OR LOWER(brand) LIKE '%セカンドストリート%'
    OR LOWER(brand) LIKE '%メルカリ%'
    OR LOWER(brand) LIKE '%ラクマ%'
    OR LOWER(brand) LIKE '%2nd street%'
    OR LOWER(brand) LIKE '%リサイクル%'
  );

-- 統計情報を確認
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_used = true THEN 1 END) as used_products,
    COUNT(CASE WHEN is_used = false THEN 1 END) as new_products,
    ROUND(COUNT(CASE WHEN is_used = true THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as used_percentage
FROM external_products
WHERE is_active = true;
```

### 2. 実行手順

1. [Supabaseダッシュボード](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. SQL Editor に移動
4. 上記のSQLをコピー＆ペースト
5. "Run" ボタンをクリック

### 3. 確認方法

データベースの更新後、以下のコマンドで確認できます：

```bash
node scripts/check-is-used-column.js
```

## 機能の動作

### フィルタリング

- **デフォルト**: 新品のみ表示
- **「すべて」選択時**: 新品と中古品の両方を表示

### 中古品判定ロジック

以下のキーワードやショップ名を含む商品は自動的に中古品として判定されます：

**キーワード**:
- 中古
- used
- ユーズド
- セカンドハンド
- リユース
- アウトレット

**ショップ名**:
- セカンドストリート
- メルカリ
- ラクマ
- 2nd street
- リサイクル

### UI表示

- **SwipeCard**: 左上にオレンジ色の「中古」ラベル表示
- **ProductCard**: 左上にオレンジ色の「中古」ラベル表示
- **FilterModal**: 「商品の状態」セクションで新品のみ/すべてを選択可能

## トラブルシューティング

### Q: 中古品フィルターが機能しない

A: 以下を確認してください：
1. データベースに`is_used`カラムが追加されているか
2. 既存の商品データに対してUPDATEクエリが実行されているか
3. フロントエンドで`includeUsed`パラメータが正しく渡されているか

### Q: 新しく追加した商品に中古品フラグが付かない

A: 楽天APIから取得した商品は、rakutenService.tsの`isUsedProduct`関数で自動判定されます。判定ロジックに含まれないキーワードやショップ名の場合は、手動でデータベースを更新する必要があります。

## 今後の改善案

1. **より高度な中古品判定**
   - 機械学習モデルによる判定
   - 価格帯による判定（同一商品の新品価格との比較）

2. **中古品の状態表示**
   - 「未使用に近い」「目立った傷なし」などの状態表示
   - 中古品の詳細な状態説明

3. **フィルター拡張**
   - 中古品のみ表示オプション
   - 価格差によるソート（新品価格との差額）

## 関連ファイル

- `/src/components/recommend/FilterModal.tsx` - フィルターUI
- `/src/components/swipe/SwipeCard.tsx` - スワイプカードUI
- `/src/components/common/ProductCard.tsx` - 商品カードUI
- `/src/services/productService.ts` - 商品サービス
- `/src/services/rakutenService.ts` - 楽天APIサービス
- `/src/types/product.ts` - 型定義
- `/scripts/database/add-used-products-column.sql` - データベース更新SQL
