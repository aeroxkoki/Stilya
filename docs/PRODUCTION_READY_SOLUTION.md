# Stilya - 本番環境向け根本的解決策

## 現状分析

### ❌ 現在の実装の問題点

1. **手動プロセスへの依存**
   - SQLを手動で実行
   - データ更新が手動
   - エラー時の対応が属人的

2. **セキュリティの問題**
   - RLSを無効化している
   - サービスロールキーが未設定
   - 適切な認証・認可が不完全

3. **スケーラビリティの欠如**
   - 楽天APIとの自動同期が未実装
   - データ更新の仕組みがない
   - キャッシュ戦略が存在しない

4. **運用面の課題**
   - エラーハンドリングが不十分
   - モニタリングがない
   - バックアップ戦略がない

## ✅ 本番環境向け根本的解決策

### 1. 環境変数の適切な設定

**.env.production**
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key  # 必須！

# Rakuten API (実際の値を設定)
RAKUTEN_APP_ID=1234567890123456789
RAKUTEN_AFFILIATE_ID=your-affiliate-id
RAKUTEN_APP_SECRET=your-app-secret

# App Environment
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.stilya.com
EXPO_PUBLIC_DEBUG_MODE=false
```

### 2. 適切なRLSポリシー設定

**scripts/production-rls-policies.sql**
```sql
-- 読み取り専用ポリシー（一般ユーザー用）
CREATE POLICY "Public can read active products" ON external_products
  FOR SELECT
  TO public
  USING (is_active = true AND last_synced > NOW() - INTERVAL '7 days');

-- サービスロール用の全権限ポリシー
CREATE POLICY "Service role has full access" ON external_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_external_products_active_synced 
  ON external_products(is_active, last_synced DESC);
```

### 3. 楽天API自動同期の実装

**scripts/sync-rakuten-products.js**
```javascript
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// サービスロールキーを使用（必須）
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function syncProducts() {
  try {
    // 1. 楽天APIから商品取得
    const products = await fetchFromRakutenAPI();
    
    // 2. データ変換
    const transformedProducts = products.map(transformProduct);
    
    // 3. バッチ挿入（upsert）
    const { error } = await supabase
      .from('external_products')
      .upsert(transformedProducts, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    // 4. 古いデータを非アクティブ化
    await deactivateOldProducts();
    
    // 5. 監視・通知
    await notifySuccess(transformedProducts.length);
    
  } catch (error) {
    await notifyError(error);
    throw error;
  }
}
```

### 4. GitHub Actions自動化

**.github/workflows/sync-products.yml**
```yaml
name: Sync Products from Rakuten API

on:
  schedule:
    - cron: '0 */6 * * *'  # 6時間ごと
  workflow_dispatch:  # 手動実行も可能

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Sync products
        run: npm run sync-products
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          RAKUTEN_APP_ID: ${{ secrets.RAKUTEN_APP_ID }}
          RAKUTEN_AFFILIATE_ID: ${{ secrets.RAKUTEN_AFFILIATE_ID }}
          
      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            // Slack通知やメール送信
```

### 5. エラーハンドリングとモニタリング

**src/services/productService.ts**
```typescript
export const fetchProducts = async (options: FetchOptions) => {
  try {
    // 1. キャッシュチェック
    const cached = await checkCache(options);
    if (cached && !options.forceRefresh) return cached;
    
    // 2. Supabaseから取得
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('last_synced', { ascending: false });
    
    if (error) {
      // 3. エラー時はフォールバック
      console.error('Supabase error:', error);
      return await getFallbackData();
    }
    
    // 4. キャッシュ更新
    await updateCache(data);
    
    // 5. メトリクス送信
    await sendMetrics({
      event: 'products_fetched',
      count: data.length,
      source: 'supabase'
    });
    
    return data;
  } catch (error) {
    // 6. 最終フォールバック
    return getStaticFallbackData();
  }
};
```

### 6. データベース設計の改善

```sql
-- パーティショニング（大量データ対応）
CREATE TABLE external_products_2025_q1 PARTITION OF external_products
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

-- マテリアライズドビュー（パフォーマンス向上）
CREATE MATERIALIZED VIEW popular_products AS
  SELECT * FROM external_products
  WHERE is_active = true
  ORDER BY view_count DESC
  LIMIT 1000;

-- 定期リフレッシュ
CREATE OR REPLACE FUNCTION refresh_popular_products()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
END;
$$ LANGUAGE plpgsql;
```

## 実装ロードマップ

### Phase 1: 基盤整備（1週間）
- [ ] サービスロールキーの取得と設定
- [ ] 本番用RLSポリシーの実装
- [ ] エラーハンドリングの強化

### Phase 2: 自動化（2週間）
- [ ] 楽天API同期スクリプトの完成
- [ ] GitHub Actions設定
- [ ] モニタリング実装

### Phase 3: 最適化（1週間）
- [ ] キャッシュ戦略の実装
- [ ] パフォーマンスチューニング
- [ ] 負荷テスト

### Phase 4: 運用開始
- [ ] 本番デプロイ
- [ ] 監視体制の確立
- [ ] ドキュメント整備

## セキュリティチェックリスト

- [ ] サービスロールキーは環境変数で管理
- [ ] RLSポリシーが適切に設定されている
- [ ] APIキーのローテーション計画
- [ ] データベースバックアップの自動化
- [ ] 監査ログの設定

## まとめ

現在の実装は開発環境での動作確認レベルであり、本番環境には適していません。
上記の改善を実施することで、スケーラブルで安全な本番環境を構築できます。
