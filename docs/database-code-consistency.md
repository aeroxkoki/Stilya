# データベーススキーマとコードの整合性チェック

## external_products テーブル

### ✅ 完全に一致しているフィールド：
- `id` (text) - Product.id と一致
- `title` (text) - Product.title と一致  
- `price` (integer) - Product.price と一致
- `brand` (text) - Product.brand と一致
- `image_url` (text) - Product.imageUrl/image_url と一致
- `description` (text) - Product.description と一致
- `tags` (text[]) - Product.tags と一致
- `category` (text) - Product.category と一致
- `affiliate_url` (text) - Product.affiliateUrl/affiliate_url と一致
- `source` (text) - Product.source と一致
- `is_used` (boolean) - Product.isUsed/is_used と一致 ✅
- `created_at` (timestamptz) - Product.createdAt/created_at と一致

### ✅ 追加フィールド（問題なし）：
DBには以下の追加フィールドがありますが、これらは拡張用で問題なし：
- `genre_id` (integer)
- `is_active` (boolean) 
- `last_synced` (timestamptz)
- `updated_at` (timestamptz)
- `original_price` (numeric) - セール価格対応
- `discount_percentage` (integer) - 割引率
- `is_sale` (boolean) - セール中フラグ
- `rating` (numeric) - レビュー評価
- `review_count` (integer) - レビュー数
- `priority` (integer) - 優先度
- `source_brand` (varchar)

## 型の整合性：
- `price`: DB(integer) ⇔ TypeScript(number) ✅
- `tags`: DB(text[]) ⇔ TypeScript(string[]) ✅
- `is_used`: DB(boolean) ⇔ TypeScript(boolean) ✅

## コード内の対応：
```typescript
// Product型定義
export interface Product {
  imageUrl?: string;  // API形式
  image_url?: string; // DB形式
  isUsed?: boolean;   // API形式
  is_used?: boolean;  // DB形式
  // ...
}

// 正規化処理
const normalizeProduct = (dbProduct: any): Product => {
  const originalImageUrl = dbProduct.image_url || dbProduct.imageUrl || '';
  const optimizedUrl = originalImageUrl ? optimizeImageUrl(originalImageUrl) : '';
  
  return {
    imageUrl: optimizedUrl, // 統一してimageUrlを使用
    isUsed: dbProduct.is_used || false, // 中古品フラグ
    // ...
  };
};
```

## 結論：
データベースとコードの整合性は完全に保たれています。
- 画像URLはすべて最適化済み
- 中古品フラグ（is_used）も正しく実装
- API形式とDB形式の両方に対応
- 型の変換も適切に処理
