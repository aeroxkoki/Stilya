// unified-phase3-sync-hq.js の修正方法

## 1. データベース構造の不整合

### 問題点
- スクリプトは`product_id`カラムに値を保存しようとしているが、実際のテーブルにはそのカラムが存在しない
- 実際は`id`カラムがプライマリキーかつ商品識別子として使用されている

### 修正箇所

#### 1. saveProductToDatabase関数の修正（1170行目付近）
```javascript
// 修正前
const { error } = await supabase
  .from('external_products')
  .upsert({
    product_id: product.productId,  // ❌ このカラムは存在しない
    title: product.title,
    // ...
  }, {
    onConflict: 'product_id'  // ❌ このカラムは存在しない
  });

// 修正後
const { error } = await supabase
  .from('external_products')
  .upsert({
    id: product.productId,  // ✅ idカラムに保存
    title: product.title,
    // ...
  }, {
    onConflict: 'id'  // ✅ idカラムで重複チェック
  });
```

#### 2. syncBrandProducts関数の修正（885行目付近）
```javascript
// 修正前
const { data: existingProducts } = await supabase
  .from('external_products')
  .select('product_id')  // ❌ このカラムは存在しない
  .eq('source_brand', brand.name)
  .eq('is_active', true);

const existingProductIds = new Set(existingProducts?.map(p => p.product_id) || []);

// 修正後
const { data: existingProducts } = await supabase
  .from('external_products')
  .select('id')  // ✅ idカラムを選択
  .eq('source_brand', brand.name)
  .eq('is_active', true);

const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
```

#### 3. 古いデータの無効化処理の修正（必要に応じて）
```javascript
// 修正前
.eq('product_id', productId)

// 修正後
.eq('id', productId)
```

## 2. ID形式の確認

### 現在のID形式
- 既存: `ソース:商品コード`（例: `locondo:12278018`）
- 新形式（スクリプト）: `ブランド名_商品名_価格`（例: `UNIQLO_ウルトラライトダウン_5990`）

### 推奨事項
- 既存のID形式と整合性を保つため、ID生成ロジックの見直しを検討
- または、新しいID形式への移行計画を策定

## 3. 完全な修正版の関数

```javascript
// データベース保存（修正版）
async function saveProductToDatabase(product) {
  try {
    // 追加画像をJSON形式で保存
    const metadata = {
      additionalImages: product.additionalImages || [],
      thumbnailUrl: product.thumbnailUrl || '',
      itemCaption: product.itemCaption || '',
      availability: product.availability,
      taxFlag: product.taxFlag
    };

    const { error } = await supabase
      .from('external_products')
      .upsert({
        id: product.productId,  // ✅ 修正: product_id → id
        title: product.title,
        price: product.price,
        image_url: product.imageUrl,
        affiliate_url: product.productUrl,  // product_url → affiliate_url にマッピング
        source: 'rakuten',
        source_brand: product.source_brand,
        brand: product.source_brand,  // brandカラムにも同じ値を設定
        category: product.brand_category,
        tags: product.ml_tags || [],
        // seasonal_tagsカラムが存在しない場合はtagsに統合
        priority: product.brand_priority,
        rating: product.reviewAverage,
        review_count: product.reviewCount,
        is_active: product.is_active,
        last_synced: product.last_synced,
        // metadataカラムが存在しない可能性があるため、必要に応じて削除
      }, {
        onConflict: 'id'  // ✅ 修正: product_id → id
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('  DB保存エラー:', error.message);
    throw error;
  }
}
```

## 4. 追加の確認事項

1. **metadataカラムの存在確認**
   - カラム一覧に`metadata`が含まれていないため、存在しない可能性がある
   - 存在しない場合は、その行を削除する必要がある

2. **seasonal_tagsカラムの存在確認**
   - 同様に、このカラムも存在しない可能性がある

3. **product_urlカラムの確認**
   - `affiliate_url`は存在するが、`product_url`は存在しない可能性がある
