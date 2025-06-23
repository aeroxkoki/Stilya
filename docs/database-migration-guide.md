# Stilya データベーススキーマ移行ガイド

## 背景

Stilyaプロジェクトでは、当初`products`テーブル（UUID型のプライマリキー）を使用していましたが、楽天APIなどの外部商品データに対応するため、`external_products`テーブル（TEXT型のプライマリキー）に移行しました。

この移行により、以下の問題が発生しました：

1. **外部キー制約違反**: スワイプデータが古い`products`テーブルのUUID形式のIDを参照していた
2. **データ型の不一致**: `swipes.product_id`がUUID→TEXTに変更されたが、既存データが残存
3. **オフラインデータの不整合**: オフラインで保存されたスワイプデータが同期時にエラーを引き起こす

## 解決策

### 1. 即時対応（実装済み）

`syncOfflineSwipes`関数を修正し、同期前に商品IDの存在確認を行うようにしました：

```typescript
// src/services/swipeService.ts
const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
const validSwipes = offlineSwipes.filter(swipe => 
  existingProductIds.has(swipe.productId)
);
```

### 2. 根本的解決（実行推奨）

データベーススキーマを完全に統一するため、以下のスクリプトを実行してください：

```bash
# データベースの現在の状態を確認
node scripts/database/migrate-schema.js

# SQLでの直接実行も可能
# Supabase SQL Editorで scripts/database/migrate-to-external-products.sql を実行
```

このスクリプトは以下を実行します：
- UUID形式の古いスワイプデータを削除
- `external_products`に存在しない無効なスワイプデータを削除
- `favorites`と`click_logs`テーブルも同様にクリーンアップ

## テーブル構造

### 現在の正しい構造

```sql
-- external_products（アクティブ）
CREATE TABLE external_products (
  id TEXT PRIMARY KEY,  -- 楽天商品IDなど
  title TEXT,
  price NUMERIC,
  -- その他のカラム
);

-- swipes
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id TEXT REFERENCES external_products(id),  -- TEXT型
  result TEXT CHECK (result IN ('yes', 'no')),
  created_at TIMESTAMP
);
```

### 廃止されたテーブル

```sql
-- products（廃止）
-- このテーブルは使用しないでください
CREATE TABLE products_deprecated (
  id UUID PRIMARY KEY,  -- 古い形式
  -- ...
);
```

## 開発時の注意事項

1. **商品データの取得元**
   - 必ず`external_products`テーブルを使用する
   - `products`テーブルは参照しない

2. **商品IDの形式**
   - TEXT型（例: "rakuten_12345678"）
   - UUID形式は使用しない

3. **オフラインデータの扱い**
   - アプリ起動時に自動的にクリーンアップされる
   - 開発メニューから手動でクリアも可能

## トラブルシューティング

### エラー: "Key is not present in table \"external_products\""

原因：古い形式の商品IDがスワイプデータに含まれている

解決策：
1. 開発メニューから「オフラインデータクリア」を実行
2. または`node scripts/database/migrate-schema.js`を実行

### データベースの状態確認

```sql
-- 問題のあるデータを確認
SELECT COUNT(*) FROM swipes 
WHERE product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
```

## 今後の方針

1. `products`テーブルは完全に廃止
2. すべての商品関連処理は`external_products`テーブルを使用
3. 新規開発時は必ずTEXT型の商品IDを使用
