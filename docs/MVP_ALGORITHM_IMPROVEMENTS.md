# MVP戦略実装とアルゴリズム改良提案

## 実装内容

### 1. MVPブランド戦略の実装

#### 1.1 楽天商品同期スクリプト
- **ファイル**: `scripts/sync-mvp-brands.js`
- **機能**: 
  - 優先ブランド（UNIQLO、GU、coca、pierrot、URBAN RESEARCH）のみを取得
  - ブランド別の最大商品数制限
  - 優先度（priority）フィールドの自動設定

#### 1.2 データベーススキーマ更新
- **ファイル**: `scripts/add-mvp-fields.sql`
- **追加フィールド**:
  - `priority` (INTEGER): ブランド優先度（1が最高）
  - `source_brand` (VARCHAR): 正規化されたブランド名
  - インデックスの追加で検索性能向上

#### 1.3 商品取得ロジックの改善
- **ファイル**: `src/services/productService.ts`
- **改善点**:
  - 優先度順での商品表示
  - パーソナライズ推薦機能の追加（`fetchPersonalizedProducts`）

#### 1.4 GitHub Actions設定
- **ファイル**: `.github/workflows/mvp-brand-sync.yml`
- **機能**:
  - 毎日2回の自動同期
  - MVPモードと全ブランドモードの切り替え可能

## アルゴリズム改良提案

### 1. 商品スコアリングシステム

```typescript
interface ProductScore {
  productId: string;
  baseScore: number;      // 基本スコア（0-100）
  brandScore: number;     // ブランドスコア（優先度ベース）
  freshness: number;      // 新鮮度スコア（更新日時ベース）
  popularity: number;     // 人気度スコア（レビュー数・評価）
  personalScore: number;  // パーソナルスコア（ユーザー嗜好）
  totalScore: number;     // 総合スコア
}

// スコア計算例
function calculateProductScore(
  product: Product, 
  userPreferences: UserPreferences
): ProductScore {
  const brandScore = (4 - (product.priority || 4)) * 25; // 0-75
  const freshness = calculateFreshness(product.lastSynced); // 0-100
  const popularity = product.reviewCount ? 
    (product.rating * 20) * Math.log(product.reviewCount + 1) : 50;
  const personalScore = calculatePersonalMatch(product, userPreferences);
  
  const totalScore = 
    brandScore * 0.2 + 
    freshness * 0.1 + 
    popularity * 0.3 + 
    personalScore * 0.4;
    
  return { productId: product.id, brandScore, freshness, popularity, personalScore, totalScore };
}
```

### 2. 季節性を考慮した推薦

```typescript
// 季節タグマッピング
const SEASONAL_TAGS = {
  spring: ['春', '春夏', 'ライト', '薄手', 'パステル'],
  summer: ['夏', '春夏', 'ノースリーブ', 'サンダル', 'UV'],
  autumn: ['秋', '秋冬', 'ニット', 'カーディガン', 'ブーツ'],
  winter: ['冬', '秋冬', 'コート', 'ダウン', '厚手']
};

// 現在の季節に合った商品を優先
function applySeasonalBoost(products: Product[]): Product[] {
  const currentSeason = getCurrentSeason();
  const seasonalTags = SEASONAL_TAGS[currentSeason];
  
  return products.map(product => ({
    ...product,
    seasonalScore: product.tags.some(tag => 
      seasonalTags.includes(tag)
    ) ? 1.2 : 1.0
  }));
}
```

### 3. 価格帯最適化

```typescript
interface PricePreference {
  userId: string;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  priceDistribution: {
    budget: number;    // < 5,000円
    mid: number;       // 5,000-15,000円
    premium: number;   // > 15,000円
  };
}

// ユーザーの価格嗜好を学習
async function learnPricePreference(userId: string): Promise<PricePreference> {
  const swipeHistory = await getPositiveSwipes(userId);
  const prices = swipeHistory.map(s => s.product.price);
  
  return {
    userId,
    averagePrice: calculateAverage(prices),
    priceRange: {
      min: Math.min(...prices) * 0.7,
      max: Math.max(...prices) * 1.3
    },
    priceDistribution: calculateDistribution(prices)
  };
}
```

### 4. A/Bテスト機能

```typescript
interface ExperimentConfig {
  id: string;
  name: string;
  variants: {
    control: { algorithm: 'default' };
    treatment: { algorithm: 'personalized' };
  };
  allocation: number; // 0-1 (割合)
  metrics: string[];  // CTR, CVR, etc.
}

// ユーザーを実験グループに割り当て
function assignExperimentGroup(userId: string, experiment: ExperimentConfig): string {
  const hash = simpleHash(userId + experiment.id);
  return hash % 100 < experiment.allocation * 100 ? 'treatment' : 'control';
}
```

### 5. リアルタイム学習

```typescript
// スワイプイベントからリアルタイムで学習
class RealtimeLearning {
  private userModel: Map<string, UserModel> = new Map();
  
  async processSwipe(userId: string, productId: string, result: 'yes' | 'no') {
    const product = await getProduct(productId);
    const model = this.userModel.get(userId) || new UserModel();
    
    // 即座にモデルを更新
    if (result === 'yes') {
      model.addPositiveSignal(product.tags, product.brand, product.price);
    } else {
      model.addNegativeSignal(product.tags, product.brand, product.price);
    }
    
    this.userModel.set(userId, model);
    
    // 次の商品推薦に即座に反映
    return this.getNextRecommendations(userId);
  }
}
```

## 実装優先順位

1. **Phase 1（実装済み）**:
   - MVPブランド戦略
   - 基本的なパーソナライズ推薦
   - 優先度ベースの商品表示

2. **Phase 2（次のステップ）**:
   - 商品スコアリングシステム
   - 季節性の考慮
   - 価格帯最適化

3. **Phase 3（将来的な拡張）**:
   - A/Bテスト機能
   - リアルタイム学習
   - 画像ベースの類似商品推薦（CLIP使用）

## パフォーマンス最適化

### 1. キャッシュ戦略
```typescript
// Redis/Memcachedを使用した推薦キャッシュ
const CACHE_TTL = 3600; // 1時間

async function getCachedRecommendations(userId: string) {
  const cacheKey = `recommendations:${userId}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const recommendations = await generateRecommendations(userId);
  await cache.set(cacheKey, JSON.stringify(recommendations), CACHE_TTL);
  
  return recommendations;
}
```

### 2. バッチ処理
```typescript
// 夜間バッチで事前計算
async function precomputeRecommendations() {
  const activeUsers = await getActiveUsers(7); // 過去7日間
  
  for (const userId of activeUsers) {
    const recommendations = await generateRecommendations(userId);
    await savePrecomputedRecommendations(userId, recommendations);
  }
}
```

## 成功指標（KPI）

1. **エンゲージメント指標**:
   - スワイプ率: 1セッションあたりの平均スワイプ数
   - セッション時間: 平均滞在時間
   - リテンション: 7日後、30日後の継続率

2. **ビジネス指標**:
   - CTR（クリック率）: 商品詳細表示率
   - CVR（コンバージョン率）: 購入転換率
   - AOV（平均注文額）: 平均購入金額

3. **アルゴリズム指標**:
   - 推薦精度: Yesスワイプ率
   - 多様性: 表示ブランド・カテゴリの分散
   - 新規性: 新商品の表示率

## まとめ

MVP戦略の実装により、信頼性の高いブランドから厳選された商品を優先的に表示できるようになりました。今後は、ユーザーの行動データを活用したパーソナライゼーションを強化し、より精度の高い商品推薦を実現していきます。