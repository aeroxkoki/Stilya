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

async function testFetchMixedProducts() {
  console.log('🔍 fetchMixedProducts のデバッグテストを開始...\n');

  try {
    // テスト用のパラメータ
    const limit = 20;
    const offset = 0;
    const filters = { includeUsed: false };
    const excludeProductIds = ['mona:10001295', 'mona:10001296', 'mona:10001297']; // テスト用の除外ID

    console.log('テストパラメータ:');
    console.log('- limit:', limit);
    console.log('- offset:', offset);
    console.log('- filters:', filters);
    console.log('- excludeProductIds:', excludeProductIds);
    console.log('');

    // fetchMixedProductsのロジックをシミュレート
    const totalPoolSize = limit * 4;
    
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true);
    
    if (filters.includeUsed === false) {
      query = query.eq('is_used', false);
    }
    
    const sortOptions = ['created_at', 'last_synced', 'priority', 'price'];
    const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
    const randomDirection = Math.random() > 0.5;
    
    console.log(`使用するソート: ${randomSort} ${randomDirection ? 'asc' : 'desc'}`);
    
    const { data: allProducts, error } = await query
      .order(randomSort, { ascending: randomDirection })
      .range(offset, offset + totalPoolSize - 1);
    
    if (error) {
      console.error('エラー:', error);
      return;
    }
    
    console.log(`\n取得した商品数: ${allProducts.length}`);
    
    // 除外IDを含む商品を探す
    const excludedInFetch = allProducts.filter(p => excludeProductIds.includes(p.id));
    if (excludedInFetch.length > 0) {
      console.log('\n⚠️ 警告: 除外すべきIDが取得された商品に含まれています:');
      excludedInFetch.forEach(p => {
        console.log(`  - ${p.id}: ${p.title}`);
      });
    }
    
    // 重複除去のシミュレーション
    const seenIds = new Set(excludeProductIds);
    const uniqueProducts = [];
    let skippedCount = 0;
    
    console.log('\n重複チェック処理:');
    console.log(`初期のseenIds数: ${seenIds.size}`);
    
    for (const product of allProducts) {
      if (seenIds.has(product.id)) {
        console.log(`✗ スキップ: ${product.id} - ${product.title}`);
        skippedCount++;
      } else {
        seenIds.add(product.id);
        uniqueProducts.push(product);
        if (uniqueProducts.length <= 5) {
          console.log(`✓ 追加: ${product.id} - ${product.title}`);
        }
      }
      
      if (uniqueProducts.length >= limit) {
        break;
      }
    }
    
    console.log('\n結果:');
    console.log(`- 処理した商品数: ${allProducts.length}`);
    console.log(`- スキップした商品数: ${skippedCount}`);
    console.log(`- ユニークな商品数: ${uniqueProducts.length}`);
    console.log(`- 最終的なseenIds数: ${seenIds.size}`);
    
    // 除外IDが正しく機能したかチェック
    const stillContainsExcluded = uniqueProducts.some(p => excludeProductIds.includes(p.id));
    if (stillContainsExcluded) {
      console.error('\n🚨 エラー: 除外IDが最終結果に含まれています！');
      const problematic = uniqueProducts.filter(p => excludeProductIds.includes(p.id));
      problematic.forEach(p => {
        console.error(`  - ${p.id}: ${p.title}`);
      });
    } else {
      console.log('\n✅ 成功: 除外IDは正しく除外されました');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
testFetchMixedProducts();
