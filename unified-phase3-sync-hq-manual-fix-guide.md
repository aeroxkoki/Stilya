# unified-phase3-sync-hq.js 修正手順

## 手動で修正が必要な箇所

### 1. syncBrandProducts関数（890行目付近）
```javascript
// 変更前
.select('product_id')
// 変更後
.select('id')

// 変更前
const existingProductIds = new Set(existingProducts?.map(p => p.product_id) || []);
// 変更後
const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
```

### 2. saveProductToDatabase関数（1173行目付近）
既存の関数を以下に完全に置き換えてください：

```javascript
// データベース保存（修正版）
async function saveProductToDatabase(product) {
  try {
    // すべてのタグを統合
    const allTags = [
      ...(product.ml_tags || []),
      ...(product.seasonal_tags || []),
      ...(product.source_brand ? [product.source_brand] : [])
    ].filter(tag => tag && tag.length > 0);

    const { error } = await supabase
      .from('external_products')
      .upsert({
        id: product.productId, // product_id → id に変更
        title: product.title,
        price: product.price,
        brand: product.source_brand, // brandカラムに設定
        image_url: product.imageUrl, // 高画質画像URL
        affiliate_url: product.productUrl, // product_url → affiliate_url に変更
        source: 'rakuten',
        source_brand: product.source_brand,
        tags: [...new Set(allTags)], // 重複を除去
        category: product.brand_category || 'fashion', // デフォルト値を設定
        priority: product.brand_priority || 999, // brand_priority → priority
        rating: product.reviewAverage, // review_average → rating
        review_count: product.reviewCount,
        is_active: product.is_active !== false, // デフォルトtrue
        last_synced: new Date().toISOString(),
        // 以下のカラムは存在しないため削除
        // metadata, seasonal_tags, recommendation_score, 
        // target_age, price_range, brand_category
      }, {
        onConflict: 'id' // product_id → id に変更
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

## 修正のチェックリスト

- [ ] syncBrandProducts関数の`product_id`を`id`に変更（2箇所）
- [ ] saveProductToDatabase関数を完全に置き換え
- [ ] 変更後にドライランモードでテスト

## テストコマンド

```bash
# ドライランモードで実行
cd /Users/koki_air/Documents/GitHub/Stilya
DRY_RUN=true SYNC_MODE=test node scripts/sync/unified-phase3-sync-hq.js
```
