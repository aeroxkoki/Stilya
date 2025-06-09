# Stilya - 本番環境向け段階的実装ガイド

## 現状評価

### ❌ 本番環境として不適切な部分

1. **手動作業への依存**
   - SQL手動実行
   - RLS手動無効化
   - データ手動更新

2. **セキュリティリスク**
   - RLS無効化での運用
   - サービスキー未設定
   - APIキーがダミー値

3. **運用上の問題**
   - 自動同期なし
   - エラー監視なし
   - スケーラビリティなし

## 段階的改善プラン

### 🚀 Phase 1: 即座に実行可能（今日中）

#### 1. Supabaseサービスキーの取得

```bash
# Supabaseダッシュボード
Settings → API → service_role key をコピー

# .env.localに追加
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. 本番用RLSポリシー設定

**scripts/setup-production-rls.sql**
```sql
-- 既存のポリシーをクリア
DROP POLICY IF EXISTS "Allow read access to all users" ON external_products;
DROP POLICY IF EXISTS "Allow public read access" ON external_products;

-- 本番用読み取りポリシー
CREATE POLICY "Anyone can read active products" 
ON external_products FOR SELECT 
USING (is_active = true);

-- サービスロール用書き込みポリシー
CREATE POLICY "Service role can manage products" 
ON external_products FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- RLSを有効化
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;
```

#### 3. 改良版同期スクリプト

**scripts/sync-products-improved.js**
```javascript
#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

// 必須環境変数チェック
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Get service key from Supabase Dashboard → Settings → API');
  process.exit(1);
}

// サービスロールキーで初期化（RLSバイパス）
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function syncProducts() {
  console.log('🚀 Starting product sync...');
  
  try {
    // 1. サンプルデータから開始（楽天API設定前）
    const sampleProducts = require('../src/data/sampleProducts.json');
    
    // 2. データ変換
    const products = sampleProducts.map((p, i) => ({
      id: `prod_${Date.now()}_${i}`,
      title: p.name,
      image_url: p.image,
      price: p.price,
      brand: p.brand,
      category: p.category,
      tags: p.tags || [],
      description: p.description || '',
      affiliate_url: p.affiliateUrl || `https://example.com/${i}`,
      source: 'sample_data',
      is_active: true,
      last_synced: new Date().toISOString()
    }));
    
    // 3. バッチ挿入
    console.log(`📦 Inserting ${products.length} products...`);
    const { data, error } = await supabase
      .from('external_products')
      .upsert(products, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
    
    // 4. 古いデータの無効化
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    await supabase
      .from('external_products')
      .update({ is_active: false })
      .lt('last_synced', oneWeekAgo.toISOString());
    
    console.log('✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncProducts();
```

### 📅 Phase 2: 今週中の実装

#### 1. 楽天API統合

**.env.production**
```bash
# 実際の楽天APIキーを設定
RAKUTEN_APP_ID=1234567890123456789
RAKUTEN_AFFILIATE_ID=12345678.9abcdef0.12345678.9abcdef0
```

#### 2. GitHub Actions設定

**.github/workflows/sync-products.yml**
```yaml
name: Sync Products

on:
  schedule:
    - cron: '0 0,12 * * *'  # 1日2回
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Sync products
        run: node scripts/sync-products-improved.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

#### 3. エラーハンドリング改善

**src/services/productService.ts**
```typescript
// リトライロジック追加
export const fetchProductsWithRetry = async (
  options: FetchOptions,
  maxRetries = 3
): Promise<Product[]> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchProductsFromSupabase(options);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  // フォールバック
  console.error('All retries failed, using fallback');
  return generateMockProducts();
};
```

### 🎯 Phase 3: 来月の最適化

#### 1. キャッシュ層の実装

```typescript
// Redis/メモリキャッシュ
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分

export const getCachedProducts = async (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};
```

#### 2. CDN画像配信

```typescript
// 画像URLをCDN経由に変換
const optimizeImageUrl = (url: string): string => {
  if (url.includes('unsplash.com')) {
    return `${url}&w=400&q=80&fm=webp`;
  }
  return url;
};
```

## チェックリスト

### 今すぐ実行
- [ ] Supabaseダッシュボードでサービスキーを取得
- [ ] .env.localにSUPABASE_SERVICE_KEYを追加
- [ ] scripts/setup-production-rls.sqlを実行
- [ ] scripts/sync-products-improved.jsを作成・実行

### 今週中
- [ ] 楽天APIキーを取得・設定
- [ ] GitHub Secretsに環境変数を設定
- [ ] GitHub Actionsワークフローを設定
- [ ] エラーハンドリングを実装

### 来月まで
- [ ] キャッシュ戦略の実装
- [ ] パフォーマンス最適化
- [ ] 監視・アラートの設定

## まとめ

現在の実装は**開発用の暫定対応**です。
上記の段階的改善により、本番環境に適した構成に移行できます。

**最優先事項**: サービスキーの設定と本番用RLSポリシーの適用
