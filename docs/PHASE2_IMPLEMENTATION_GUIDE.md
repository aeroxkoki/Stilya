# Phase 2実装ガイド: 商品スコアリング・季節性・価格帯最適化

## 概要

Phase 2では、Stilyaの推薦精度を向上させるための高度なアルゴリズムを実装しました。これにより、ユーザーの嗜好、季節性、価格帯を考慮した商品推薦が可能になります。

## 実装内容

### 1. 商品スコアリングシステム (`src/utils/productScoring.ts`)

#### 1.1 スコア構成要素

| スコア種別 | 重み | 説明 |
|-----------|------|------|
| ブランドスコア | 15% | MVPブランドの優先度（1-100点） |
| 新鮮度スコア | 10% | 商品の更新日時からの経過（0-100点） |
| 季節性スコア | 15% | 現在の季節との適合性（0-100点） |
| 価格スコア | 20% | ユーザーの価格嗜好との適合性（0-100点） |
| パーソナルスコア | 35% | タグ・ブランドの一致度（0-100点） |
| 人気度スコア | 5% | レビュー・評価（現在は固定値） |

#### 1.2 季節タグマッピング
```typescript
const SEASONAL_TAGS = {
  spring: ['春', '春夏', 'ライト', '薄手', 'パステル', 'シャツ', 'カーディガン'],
  summer: ['夏', '春夏', 'ノースリーブ', 'サンダル', 'UV', '半袖', 'ショート'],
  autumn: ['秋', '秋冬', 'ニット', 'カーディガン', 'ブーツ', 'ジャケット', 'チェック'],
  winter: ['冬', '秋冬', 'コート', 'ダウン', '厚手', 'ニット', 'マフラー', 'ブーツ']
};
```

### 2. ユーザー嗜好学習サービス (`src/services/userPreferenceService.ts`)

#### 2.1 価格嗜好の学習
- Yesスワイプした商品の価格から統計的に価格帯を算出
- 四分位数を使用して外れ値を除外
- 価格分布（プチプラ/ミドル/プレミアム）を計算

#### 2.2 タグ・ブランド嗜好の学習
- ポジティブシグナル（Yesスワイプ）とネガティブシグナル（Noスワイプ）を考慮
- 重み付きスコアリング: `positive - negative * 0.5`
- 上位10タグ、上位5ブランドを抽出

### 3. 拡張商品取得API (`src/services/productService.ts`)

#### 3.1 新しいAPI関数

| 関数名 | 機能 | 使用場面 |
|--------|------|----------|
| `fetchScoredProducts` | 総合スコアリング | メイン推薦 |
| `fetchSeasonalProducts` | 季節商品のみ | 季節特集 |
| `fetchProductsInPriceRange` | 価格帯フィルター | 予算内商品 |

#### 3.2 fetchScoredProductsのオプション
```typescript
options?: {
  enableSeasonalFilter?: boolean;  // 季節フィルター
  enablePriceFilter?: boolean;     // 価格フィルター
  priceFlexibility?: number;       // 価格の柔軟性（1.2 = 20%の余裕）
}
```

### 4. パーソナライズ商品取得フック (`src/hooks/usePersonalizedProducts.ts`)

#### 4.1 使用方法
```typescript
// デフォルト（総合スコアリング）
const { products, handleSwipe } = usePersonalizedProducts();

// 季節商品のみ
const { products } = usePersonalizedProducts({ mode: 'seasonal' });

// 価格帯最適化
const { products } = usePersonalizedProducts({ 
  mode: 'price',
  priceFlexibility: 1.3 // 30%の余裕
});

// すべての最適化を有効化
const { products } = usePersonalizedProducts({ mode: 'all' });
```

## 使用例

### 1. スワイプ画面での実装
```tsx
import { usePersonalizedProducts } from '@/hooks/usePersonalizedProducts';

export function SwipeScreen() {
  const { 
    currentProduct, 
    handleSwipe,
    isLoading 
  } = usePersonalizedProducts({ mode: 'all' });

  return (
    <SwipeCard
      product={currentProduct}
      onSwipe={handleSwipe}
      loading={isLoading}
    />
  );
}
```

### 2. 季節特集画面
```tsx
export function SeasonalCollection() {
  const { products } = usePersonalizedProducts({ 
    mode: 'seasonal' 
  });

  return (
    <ProductGrid products={products} title="今季のおすすめ" />
  );
}
```

### 3. 価格帯別商品表示
```tsx
export function BudgetFriendlyItems() {
  const { products } = usePersonalizedProducts({ 
    mode: 'price',
    priceFlexibility: 1.1 // 10%の余裕のみ
  });

  return (
    <ProductList products={products} title="あなたの予算内アイテム" />
  );
}
```

## パフォーマンス最適化

### 1. スコアリングプール
- 表示数の3倍の商品を取得してスコアリング
- 上位商品のみを表示することで品質向上

### 2. フィルタリング順序
1. 価格フィルター（計算コストが低い）
2. 季節フィルター（タグマッチング）
3. スコアリング（最も計算コストが高い）

### 3. キャッシング戦略
- ユーザー嗜好データは初回取得後メモリに保持
- スワイプごとに嗜好データを更新（将来実装）

## デバッグ情報

スコア情報は開発環境でコンソールに出力されます：
```
[ProductService] Top 5 products scores:
1. ベーシックTシャツ (UNIQLO)
   Total: 85, Personal: 90, Price: 95
2. フローラルワンピース (GU)
   Total: 78, Personal: 75, Price: 88
```

## 今後の拡張予定

### Phase 3で実装予定
1. **リアルタイム学習**: スワイプごとに嗜好モデルを更新
2. **A/Bテスト機能**: アルゴリズムの効果測定
3. **画像類似度**: CLIPモデルによる視覚的類似性

### 改善ポイント
1. **人気度スコア**: 楽天APIからレビュー数・評価を取得
2. **在庫考慮**: 在庫切れリスクの低い商品を優先
3. **多様性確保**: 同じブランド・カテゴリの連続表示を防ぐ

## 設定とカスタマイズ

### スコア重み付けの調整
```typescript
// productScoring.ts内のweightsを調整
const weights = {
  brand: 0.15,      // ブランド重視なら増やす
  freshness: 0.10,  // 新商品重視なら増やす
  seasonal: 0.15,   // 季節感重視なら増やす
  price: 0.20,      // 価格重視なら増やす
  personal: 0.35,   // パーソナライズ重視なら増やす
  popularity: 0.05  // 人気重視なら増やす
};
```

### 季節タグのカスタマイズ
地域や気候に応じて`SEASONAL_TAGS`を調整可能です。

## トラブルシューティング

### Q: スコアリングが遅い
A: `fetchScoredProducts`の取得数を減らすか、フィルターを限定してください。

### Q: 季節商品が表示されない
A: 商品タグに季節タグが含まれているか確認してください。

### Q: 価格フィルターが効かない
A: ユーザーのスワイプ履歴が少ない場合、デフォルト価格帯（2,000-20,000円）が使用されます。