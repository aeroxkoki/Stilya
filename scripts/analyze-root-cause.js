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
  console.log('🔍 商品重複の根本原因を分析します...\n');

  try {
    // 複数回同じパラメータでfetchMixedProductsのロジックを実行
    const iterations = 5;
    const limit = 20;
    const offset = 0;
    const totalPoolSize = limit * 4;
    
    const allFetchedIds = [];
    
    for (let i = 0; i < iterations; i++) {
      console.log(`\n--- 実行 ${i + 1} ---`);
      
      // fetchMixedProductsのロジックをシミュレート
      const sortOptions = ['created_at', 'last_synced', 'priority', 'price'];
      const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
      const randomDirection = Math.random() > 0.5;
      
      console.log(`ソート: ${randomSort} ${randomDirection ? 'asc' : 'desc'}`);
      
      const { data: products, error } = await supabase
        .from('external_products')
        .select('id, title')
        .eq('is_active', true)
        .eq('is_used', false)
        .order(randomSort, { ascending: randomDirection })
        .range(offset, offset + totalPoolSize - 1);
      
      if (error) {
        console.error('エラー:', error);
        continue;
      }
      
      const fetchedIds = products.map(p => p.id);
      allFetchedIds.push(fetchedIds);
      
      console.log(`取得した商品数: ${products.length}`);
      console.log(`最初の5つのID: ${fetchedIds.slice(0, 5).join(', ')}`);
    }
    
    // 重複を分析
    console.log('\n\n=== 重複分析 ===');
    
    for (let i = 0; i < iterations - 1; i++) {
      for (let j = i + 1; j < iterations; j++) {
        const common = allFetchedIds[i].filter(id => allFetchedIds[j].includes(id));
        if (common.length > 0) {
          console.log(`\n実行${i + 1}と実行${j + 1}の間で${common.length}個の重複:`);
          console.log(`重複ID: ${common.slice(0, 10).join(', ')}${common.length > 10 ? '...' : ''}`);
        }
      }
    }
    
    // 統計
    const allIds = allFetchedIds.flat();
    const uniqueIds = new Set(allIds);
    const duplicateCount = allIds.length - uniqueIds.size;
    
    console.log('\n\n=== 統計 ===');
    console.log(`総取得ID数: ${allIds.length}`);
    console.log(`ユニークID数: ${uniqueIds.size}`);
    console.log(`重複ID数: ${duplicateCount}`);
    console.log(`重複率: ${(duplicateCount / allIds.length * 100).toFixed(2)}%`);
    
    console.log('\n\n🔴 根本原因:');
    console.log('fetchMixedProductsが毎回異なるソート順を使用しているため、');
    console.log('同じoffsetでも異なる商品セットが返されることが原因です。');
    console.log('\n解決策:');
    console.log('1. ソート順を固定する');
    console.log('2. またはセッション中は同じソート順を維持する');
    console.log('3. またはデータベースレベルでランダム性を実装する（TABLESAMPLE等）');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
analyzeRootCause();
