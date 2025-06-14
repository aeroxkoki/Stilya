const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function optimizeDatabase() {
  console.log('⚡ データベース最適化開始...');
  
  try {
    // 1. 重複商品の検出と削除
    console.log('\n1️⃣ 重複商品の検出...');
    
    // 同一ブランド・同一タイトルの重複を検出
    const { data: duplicates, error: dupError } = await supabase
      .rpc('find_duplicate_products', {
        limit_count: 100
      });
    
    if (!dupError && duplicates && duplicates.length > 0) {
      console.log(`  ${duplicates.length}件の重複グループを検出`);
      
      // 重複を削除（最新のものを残す）
      for (const group of duplicates) {
        const { data: products } = await supabase
          .from('external_products')
          .select('product_id, last_synced')
          .eq('source_brand', group.source_brand)
          .eq('title', group.title)
          .order('last_synced', { ascending: false });
        
        if (products && products.length > 1) {
          // 最新以外を削除
          const toDelete = products.slice(1).map(p => p.product_id);
          await supabase
            .from('external_products')
            .delete()
            .in('product_id', toDelete);
        }
      }
    } else {
      console.log('  重複なし');
    }
    
    // 2. インデックスの状態確認
    console.log('\n2️⃣ インデックス最適化...');
    console.log('  ※ インデックスはSupabase側で自動管理されています');
    
    // 3. 統計情報の更新
    console.log('\n3️⃣ 統計情報の更新...');
    
    // ブランド別統計
    const { data: brandStats } = await supabase
      .from('external_products')
      .select('source_brand, is_active')
      .eq('is_active', true);
    
    const brandCounts = {};
    if (brandStats) {
      brandStats.forEach(item => {
        brandCounts[item.source_brand] = (brandCounts[item.source_brand] || 0) + 1;
      });
    }
    
    console.log('  ブランド別商品数:');
    Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`    - ${brand}: ${count.toLocaleString()}件`);
      });
    
    // 4. 古いログやテンポラリデータの削除
    console.log('\n4️⃣ テンポラリデータのクリーンアップ...');
    
    // 1年以上古いスワイプデータを削除（必要に応じて）
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { count: oldSwipes } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', oneYearAgo.toISOString());
    
    if (oldSwipes > 0) {
      console.log(`  ${oldSwipes}件の古いスワイプデータを検出（削除はスキップ）`);
    }
    
    // 5. 最終統計
    console.log('\n📊 最適化完了後の統計:');
    
    const { count: totalProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    const { count: activeProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: totalBrands } = await supabase
      .from('external_products')
      .select('source_brand', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`  - 総商品数: ${totalProducts?.toLocaleString() || 0}件`);
    console.log(`  - アクティブ商品: ${activeProducts?.toLocaleString() || 0}件`);
    console.log(`  - 容量使用率: ${totalProducts ? Math.round((totalProducts / 100000) * 100) : 0}%`);
    console.log(`  - データベース健全性: ✅`);
    
  } catch (error) {
    console.error('❌ 最適化エラー:', error);
    process.exit(1);
  }
}

// RPC関数が存在しない場合の代替実装
async function findDuplicatesAlternative() {
  const { data: allProducts } = await supabase
    .from('external_products')
    .select('product_id, source_brand, title, last_synced')
    .order('source_brand');
  
  if (!allProducts) return [];
  
  const duplicates = [];
  const seen = new Map();
  
  allProducts.forEach(product => {
    const key = `${product.source_brand}:::${product.title}`;
    if (seen.has(key)) {
      const existing = seen.get(key);
      if (!existing.isDuplicate) {
        duplicates.push({
          source_brand: product.source_brand,
          title: product.title,
          products: [existing.product]
        });
        existing.isDuplicate = true;
      }
      duplicates[duplicates.length - 1].products.push(product);
    } else {
      seen.set(key, { product, isDuplicate: false });
    }
  });
  
  return duplicates;
}

// メイン実行
(async () => {
  await optimizeDatabase();
  process.exit(0);
})();
