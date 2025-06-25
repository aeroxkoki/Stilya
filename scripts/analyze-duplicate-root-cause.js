const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数を読み込む
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function analyzeRootCause() {
  console.log('🔍 重複問題の根本原因分析を開始します...\n');

  try {
    // 1. データベース内の重複を分析
    console.log('1. データベース内の重複状況を確認...');
    const { data: allProducts, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('エラー:', error);
      return;
    }

    console.log(`総商品数: ${allProducts.length}`);

    // IDの重複をチェック
    const idMap = new Map();
    const duplicateIds = [];
    allProducts.forEach(product => {
      if (idMap.has(product.id)) {
        duplicateIds.push({
          id: product.id,
          count: (idMap.get(product.id) || 0) + 1
        });
      }
      idMap.set(product.id, (idMap.get(product.id) || 0) + 1);
    });

    console.log(`\nID重複: ${duplicateIds.length > 0 ? '発見' : 'なし'}`);
    if (duplicateIds.length > 0) {
      console.log('重複ID:', duplicateIds);
    }

    // タイトルの重複をチェック（完全一致）
    const titleMap = new Map();
    allProducts.forEach(product => {
      const title = product.title;
      if (!titleMap.has(title)) {
        titleMap.set(title, []);
      }
      titleMap.get(title).push(product);
    });

    const titleDuplicates = Array.from(titleMap.entries())
      .filter(([title, products]) => products.length > 1);

    console.log(`\nタイトル重複（完全一致）: ${titleDuplicates.length} 件`);

    // タイトルの重複をチェック（正規化後）
    const normalizedTitleMap = new Map();
    allProducts.forEach(product => {
      const normalizedTitle = product.title.toLowerCase().trim()
        .replace(/\s+/g, ' ') // 複数スペースを単一スペースに
        .replace(/[【】\[\]（）\(\)]/g, ''); // 括弧を削除
      
      if (!normalizedTitleMap.has(normalizedTitle)) {
        normalizedTitleMap.set(normalizedTitle, []);
      }
      normalizedTitleMap.get(normalizedTitle).push(product);
    });

    const normalizedDuplicates = Array.from(normalizedTitleMap.entries())
      .filter(([title, products]) => products.length > 1);

    console.log(`タイトル重複（正規化後）: ${normalizedDuplicates.length} 件`);

    // 2. 重複パターンの分析
    console.log('\n2. 重複パターンの分析...');
    
    // 同じ商品で価格が異なるケース
    let priceInconsistencies = 0;
    normalizedDuplicates.forEach(([title, products]) => {
      const prices = [...new Set(products.map(p => p.price))];
      if (prices.length > 1) {
        priceInconsistencies++;
        console.log(`\n価格不一致: "${products[0].title}"`);
        products.forEach(p => {
          console.log(`  - ID: ${p.id}, 価格: ${p.price || 'null'}, ソース: ${p.source}`);
        });
      }
    });
    console.log(`\n価格不一致のある重複: ${priceInconsistencies} 件`);

    // 3. ソース別の分析
    console.log('\n3. データソース別の分析...');
    const sourceCount = {};
    allProducts.forEach(product => {
      const source = product.source || 'unknown';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    console.log('ソース別商品数:', sourceCount);

    // 4. 最近の商品追加パターン
    console.log('\n4. 最近追加された商品のパターン分析...');
    const last24Hours = new Date();
    last24Hours.setDate(last24Hours.getDate() - 1);
    
    const recentProducts = allProducts.filter(p => 
      new Date(p.created_at) > last24Hours
    );
    
    console.log(`過去24時間に追加された商品: ${recentProducts.length} 件`);
    
    // 5. 推奨される解決策
    console.log('\n\n📋 根本的な解決策の提案:');
    console.log('1. データベースレベル:');
    console.log('   - タイトル + ブランド + 価格 の組み合わせでユニーク制約を追加');
    console.log('   - 商品インポート時の重複チェック強化');
    console.log('\n2. アプリケーションレベル:');
    console.log('   - 全ての商品取得関数で一貫した重複除去ロジックを実装');
    console.log('   - 商品の正規化処理を統一');
    console.log('\n3. データクリーンアップ:');
    console.log('   - 既存の重複を統合（価格がある方を優先）');
    console.log('   - ソース情報を保持して追跡可能に');

    // SQL生成
    console.log('\n\n-- 推奨されるデータベース制約（実行前に要検討）:');
    console.log(`
-- 重複商品を特定するビュー
CREATE OR REPLACE VIEW duplicate_products AS
SELECT 
  LOWER(TRIM(title)) as normalized_title,
  brand,
  COUNT(*) as duplicate_count,
  array_agg(id) as product_ids,
  array_agg(price) as prices
FROM external_products
WHERE is_active = true
GROUP BY LOWER(TRIM(title)), brand
HAVING COUNT(*) > 1;

-- インデックスの追加（パフォーマンス改善）
CREATE INDEX IF NOT EXISTS idx_products_title_lower ON external_products (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_products_brand ON external_products (brand);
CREATE INDEX IF NOT EXISTS idx_products_active_title ON external_products (is_active, title);
    `);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
analyzeRootCause();
