# unified-phase3-sync-hq.js 完全修正ガイド

## 🔴 重大な問題: データベース構造の不一致

### 存在しないカラムの一覧
スクリプトが使用しようとしているが、実際には存在しないカラム：
- `product_id` → `id`を使用
- `product_url` → `affiliate_url`を使用
- `brand_priority` → 削除
- `brand_category` → `category`を使用
- `target_age` → 削除
- `price_range` → 削除
- `ml_tags` → 削除
- `seasonal_tags` → 削除（通常の`tags`に統合）
- `recommendation_score` → 削除
- `review_average` → `rating`を使用
- `metadata` → 削除

## 📝 必要な修正箇所

### 1. syncBrandProducts関数（885行目付近）
```javascript
// 修正前
const { data: existingProducts } = await supabase
  .from('external_products')
  .select('product_id')  // ❌ 存在しない
  .eq('source_brand', brand.name)
  .eq('is_active', true);

const existingProductIds = new Set(existingProducts?.map(p => p.product_id) || []);

// 修正後
const { data: existingProducts } = await supabase
  .from('external_products')
  .select('id')  // ✅ 正しいカラム名
  .eq('source_brand', brand.name)
  .eq('is_active', true);

const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
```

### 2. saveProductToDatabase関数（1159行目付近）
```javascript
// 修正後の完全版
async function saveProductToDatabase(product) {
  try {
    // 季節タグを通常のタグに統合
    const allTags = [
      ...(product.ml_tags || []),
      ...(product.seasonal_tags || [])
    ];

    const { error } = await supabase
      .from('external_products')
      .upsert({
        id: product.productId,  // ✅ product_id → id
        title: product.title,
        price: product.price,
        brand: product.source_brand,  // ✅ brandカラムに設定
        image_url: product.imageUrl,
        affiliate_url: product.productUrl,  // ✅ product_url → affiliate_url
        source: 'rakuten',
        source_brand: product.source_brand,
        tags: allTags,  // ✅ すべてのタグを統合
        category: product.brand_category || 'fashion',  // ✅ デフォルト値を設定
        priority: product.brand_priority || 999,  // ✅ brand_priority → priority
        rating: product.reviewAverage,  // ✅ review_average → rating
        review_count: product.reviewCount,
        is_active: product.is_active !== false,  // ✅ デフォルトtrue
        last_synced: new Date().toISOString(),
        // 削除: metadata, seasonal_tags, recommendation_score, target_age, price_range
      }, {
        onConflict: 'id'  // ✅ product_id → id
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

### 3. enhanceProductData関数の修正（1025行目付近）
```javascript
// 修正前の一部
source_brand: brand.name,
brand_priority: brand.priority,
brand_category: brand.category,
target_age: brand.targetAge,
price_range: brand.priceRange,
ml_tags: mlTags,
seasonal_tags: seasonalTags,
recommendation_score: recommendationScore,

// 修正後
source_brand: brand.name,
priority: brand.priority,  // brand_priority → priority
category: brand.category,  // brand_category → category
tags: [...mlTags, ...seasonalTags],  // すべてのタグを統合
rating: product.reviewAverage,  // そのまま使用
// 削除: target_age, price_range, recommendation_score
```

### 4. 既存データの無効化処理（もし存在する場合）
```javascript
// 修正前
.update({ is_active: false })
.eq('product_id', productId)

// 修正後
.update({ is_active: false })
.eq('id', productId)
```

## 🚨 ID形式の問題

### 現在のデータベースのID形式
- `locondo:12278018`
- `0101marui:12924322`
- パターン: `ソース:商品コード`

### スクリプトが生成するID形式
- `UNIQLO_ウルトラライトダウン_5990`
- パターン: `ブランド名_商品名_価格`

### 推奨される修正
```javascript
// ID生成ロジックを既存形式に合わせる
const improvedProductId = `rakuten:${product.itemCode}`;
// または
const improvedProductId = `${brand.name.toLowerCase()}:${product.itemCode}`;
```

## 📋 修正チェックリスト

- [ ] syncBrandProducts関数の`product_id`を`id`に変更
- [ ] saveProductToDatabase関数の全カラムマッピングを修正
- [ ] enhanceProductData関数の不要なフィールドを削除
- [ ] ID生成ロジックを既存形式に合わせる（任意）
- [ ] エラーハンドリングのテスト
- [ ] ドライランモードでのテスト実行

## ⚡ クイック修正スクリプト

最小限の修正で動作させるための変更：
1. `product_id` → `id` の置換（3箇所）
2. `onConflict: 'product_id'` → `onConflict: 'id'`
3. 存在しないカラムの削除またはコメントアウト

これらの修正を適用することで、スクリプトが正常に動作するようになります。
