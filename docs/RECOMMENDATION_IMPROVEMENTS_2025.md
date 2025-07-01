# 商品推薦アルゴリズム改善レポート

## 概要
商品推薦システムの多様性向上とネガティブシグナル（Noスワイプ）の学習強化を実装しました。これにより、ユーザーの好みをより正確に学習し、多様で興味深い商品を提案できるようになります。

## 実装内容

### 1. ネガティブシグナルの活用強化

#### 1.1 スワイプ品質の考慮
```typescript
// スワイプの品質を考慮して商品IDを分類
swipes.forEach(swipe => {
  const weight = swipe.is_instant_decision ? 1.5 : 1.0; // 即決は重み付けを高く
  
  if (swipe.result === 'yes') {
    weightedLikedIds.push({ id: swipe.product_id, weight });
  } else {
    weightedDislikedIds.push({ id: swipe.product_id, weight });
  }
});
```

- 即座の判断（1秒以内）は確信度が高いとして1.5倍の重み付け
- 通常の判断は1.0倍の重み

#### 1.2 ネガティブスコアの計算
```typescript
private static calculateNegativeScore(
  product: Product,
  dislikedTags: string[],
  dislikedBrands: string[],
  dislikedCategories: string[]
): number {
  let negativeScore = 0;
  const tags = product.tags || [];
  
  // dislikedTagsとのマッチング
  const matchedTags = tags.filter(tag => dislikedTags.includes(tag));
  negativeScore += matchedTags.length * 0.3; // タグごとに0.3ペナルティ
  
  // dislikedBrandのチェック
  if (product.brand && dislikedBrands.includes(product.brand)) {
    negativeScore += 0.5; // ブランドペナルティ
  }
  
  // dislikedCategoryのチェック
  if (product.category && dislikedCategories.includes(product.category)) {
    negativeScore += 0.4; // カテゴリペナルティ
  }
  
  return Math.min(negativeScore, 1.0);
}
```

#### 1.3 総合スコアへの反映
```typescript
// 総合スコア（ネガティブスコアを減算）
const totalScore = (
  tagScore * weights.tag +
  categoryScore * weights.category +
  brandScore * weights.brand +
  priceScore * weights.price +
  seasonalScore * weights.seasonal +
  popularityScore * weights.popularity
) * (1 - negativeScore * weights.negative); // ネガティブスコアによる減衰
```

### 2. 多様性の拡張

#### 2.1 スタイルタグの多様性
```typescript
// スタイルタグの定義
const stylePatterns = [
  'カジュアル', 'フォーマル', 'ストリート', 'モード', 'ナチュラル',
  'フェミニン', 'クール', 'エレガント', 'スポーティ', 'ガーリー',
  'シンプル', 'ベーシック', 'トレンド', 'レトロ', 'ヴィンテージ'
];

// スタイルの重複をチェック
const styleOverlapCount = productStyles.filter(style => 
  recentStyles.filter(s => s === style).length >= maxSameStyle
).length;
```

#### 2.2 多様性パラメータ
- **maxSameCategory**: 2（同じカテゴリの連続上限）
- **maxSameBrand**: 2（同じブランドの連続上限）
- **maxSamePriceRange**: 3（同じ価格帯の連続上限）
- **maxSameStyle**: 2（同じスタイルの連続上限）★新規追加
- **windowSize**: 5（チェック対象の直近商品数）

### 3. 動的重み付けの改善

#### 3.1 学習段階別の重み付け
```typescript
// スワイプ数が少ない場合（10件未満）
if (swipeCount < 10) {
  return {
    tag: 1.0,
    category: 1.0,
    brand: 0.5,
    price: 1.0,
    seasonal: 1.5,
    popularity: 2.0,
    negative: 0.5 // ネガティブシグナルは弱め
  };
}

// 中期（10-50件）
else if (swipeCount < 50) {
  return {
    tag: 2.0,
    category: 1.5,
    brand: 0.8,
    price: 1.2,
    seasonal: 1.8,
    popularity: 1.5,
    negative: 1.0 // ネガティブシグナルを考慮
  };
}

// 通常（50件以上）
return {
  tag: 3.0,
  category: 2.0,
  brand: 1.0,
  price: 1.5,
  seasonal: 2.0,
  popularity: 1.0,
  negative: 1.5 // ネガティブシグナルを強く考慮
};
```

### 4. ネガティブフィルタリング

#### 4.1 クエリレベルでの除外
```typescript
// ネガティブフィルタリング：嫌いなブランドを除外
if (preferences.dislikedBrands && preferences.dislikedBrands.length > 0) {
  baseQuery.not('brand', 'in', `(${preferences.dislikedBrands.join(',')})`);
}
```

## 効果

### 期待される改善効果

1. **推薦精度の向上**
   - ユーザーが避けたい商品タイプを学習
   - より的確な商品提案が可能に

2. **多様性の向上**
   - スタイルの偏りを防止
   - 飽きにくい商品ラインナップ

3. **学習効率の改善**
   - 即決スワイプを重視した学習
   - より少ないスワイプで好みを把握

### パフォーマンスへの影響

- 追加の計算処理は最小限
- データベースクエリの最適化により影響を軽減
- キャッシュ可能な計算結果

## 今後の拡張案

1. **機械学習モデルの導入**
   - 現在のルールベースから機械学習へ移行
   - より複雑なパターンの学習

2. **コンテキスト考慮**
   - 時間帯、曜日、季節による調整
   - ユーザーの購買履歴との連携

3. **A/Bテスト機能**
   - アルゴリズムの効果測定
   - 継続的な改善サイクル

## 技術詳細

### 変更ファイル
- `src/services/recommendationService.ts` - メインの推薦ロジック
- `src/types/index.ts` - UserPreferenceインターフェースの拡張

### データベース依存
- `swipes`テーブルの`swipe_time_ms`と`is_instant_decision`フィールドを活用
- 既存のテーブル構造との完全な互換性を維持

### バックワード互換性
- 既存のAPIインターフェースは変更なし
- オプショナルフィールドとして実装し、既存データとの互換性を確保

## まとめ

本改善により、Stilyaの商品推薦システムは、ユーザーの好みだけでなく「嫌い」も学習し、より精度の高い、多様性のある商品提案が可能になりました。これにより、ユーザーエンゲージメントの向上と、より良いショッピング体験の提供が期待できます。
