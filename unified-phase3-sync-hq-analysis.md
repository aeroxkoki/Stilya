# unified-phase3-sync-hq.js 変更影響分析（最終版）

## 1. 主要な変更点

### 1.1 productId生成方法の変更
**変更前**: 単純なitemCode使用
**変更後**: `${brand.name}_${normalizedTitle}_${product.price}`

```javascript
// 商品タイトルの正規化
const normalizedTitle = product.title
  .replace(/[【】\[\]（）\s]/g, '') // 記号除去
  .substring(0, 20); // 最初の20文字
const improvedProductId = `${brand.name}_${normalizedTitle}_${product.price}`;
```

### 1.2 重複防止ロジックの強化
- 既存商品のproduct_idをSetで管理
- 新規追加分もSetで管理して重複を防止

## 2. データベース構造の判明事項

### 2.1 external_productsテーブル
調査の結果、以下の構造であることが判明：
- `id` (TEXT): おそらく自動生成されるプライマリキー
- `product_id` (TEXT): unified-phase3-sync-hq.jsが生成する商品識別子（ユニークキー）

### 2.2 データフローの整理
1. **商品同期時（unified-phase3-sync-hq.js）**:
   - `product.productId`を生成
   - `product_id`カラムに保存
   - upsertのconflictも`product_id`で判定

2. **アプリでの商品取得時（productService.ts）**:
   - `id`フィールドを使用して重複チェック
   - Productインターフェースでは`id`として扱われる

3. **スワイプ記録時（swipeService.ts）**:
   - `product_id`パラメータを受け取る
   - swipesテーブルの`product_id`カラムに保存

## 3. 発見された潜在的な問題

### 3.1 外部キー制約の不整合
**fix-swipes-product-id-type.sql**では：
```sql
FOREIGN KEY (product_id) REFERENCES external_products(id)
```

しかし、実際のデータフローでは：
- アプリは`external_products.id`を使用
- 同期スクリプトは`external_products.product_id`を設定

**これは重大な不整合の可能性があります。**

### 3.2 ID形式の混在による影響
- 既存データ: 以前のID形式
- 新規データ: `ブランド名_商品名_価格`形式
- 同じ商品が異なるIDで登録される可能性

## 4. 推奨される緊急対応

### 4.1 データベース構造の確認（最優先）
```sql
-- external_productsテーブルの正確な構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'external_products'
ORDER BY ordinal_position;

-- プライマリキーとユニーク制約の確認
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'external_products';
```

### 4.2 外部キー制約の修正（必要に応じて）
もし`id`と`product_id`が別々のカラムであれば、正しい外部キー制約に修正が必要。

### 4.3 短期的な対策
1. **重複商品の監視**: 同じ商品が複数のIDで登録されていないか確認
2. **スワイプデータの整合性チェック**: 無効な参照がないか確認
3. **パフォーマンス監視**: 新しいID形式による検索性能への影響

## 5. 結論と次のステップ

現在の実装は機能的には動作する可能性が高いですが、以下の確認が必要です：

1. **データベース構造の正確な把握**
2. **外部キー制約の整合性確認**
3. **既存データとの互換性テスト**

**推奨アクション**:
1. Supabaseダッシュボードで実際のテーブル構造を確認
2. 開発環境でテストデータを使用して動作確認
3. 必要に応じてデータ移行スクリプトの準備

この分析に基づいて、本番環境への展開前に上記の確認作業を完了させることを強く推奨します。
