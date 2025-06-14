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

async function updateStatistics() {
  console.log('📊 統計情報の更新開始...');
  
  try {
    // 1. 全体統計
    console.log('\n1️⃣ 全体統計:');
    
    const { count: totalProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    const { count: activeProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`  - 総商品数: ${totalProducts?.toLocaleString() || 0}件`);
    console.log(`  - アクティブ商品: ${activeProducts?.toLocaleString() || 0}件`);
    console.log(`  - 非アクティブ商品: ${(totalProducts - activeProducts)?.toLocaleString() || 0}件`);
    console.log(`  - アクティブ率: ${totalProducts ? Math.round((activeProducts / totalProducts) * 100) : 0}%`);
    
    // 2. ブランド別統計
    console.log('\n2️⃣ ブランド別統計 (上位20):');
    
    const { data: products } = await supabase
      .from('external_products')
      .select('source_brand, brand_priority, is_active');
    
    const brandStats = {};
    if (products) {
      products.forEach(p => {
        if (!brandStats[p.source_brand]) {
          brandStats[p.source_brand] = {
            total: 0,
            active: 0,
            priority: p.brand_priority
          };
        }
        brandStats[p.source_brand].total++;
        if (p.is_active) brandStats[p.source_brand].active++;
      });
    }
    
    Object.entries(brandStats)
      .sort((a, b) => b[1].active - a[1].active)
      .slice(0, 20)
      .forEach(([brand, stats]) => {
        const activeRate = Math.round((stats.active / stats.total) * 100);
        console.log(`  ${brand}:`);
        console.log(`    - アクティブ: ${stats.active.toLocaleString()}件`);
        console.log(`    - 総数: ${stats.total.toLocaleString()}件`);
        console.log(`    - アクティブ率: ${activeRate}%`);
        console.log(`    - 優先度: ${stats.priority}`);
      });
    
    // 3. 価格帯別統計
    console.log('\n3️⃣ 価格帯別統計:');
    
    const priceRanges = [
      { name: 'プチプラ (〜3,000円)', min: 0, max: 3000 },
      { name: 'お手頃 (3,000〜10,000円)', min: 3000, max: 10000 },
      { name: 'ミドル (10,000〜30,000円)', min: 10000, max: 30000 },
      { name: 'ハイ (30,000円〜)', min: 30000, max: Infinity }
    ];
    
    for (const range of priceRanges) {
      const { count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('price', range.min)
        .lt('price', range.max === Infinity ? 999999 : range.max);
      
      const percentage = activeProducts ? Math.round((count / activeProducts) * 100) : 0;
      console.log(`  ${range.name}: ${count?.toLocaleString() || 0}件 (${percentage}%)`);
    }
    
    // 4. 年齢層別統計
    console.log('\n4️⃣ 年齢層別統計:');
    
    const ageGroups = ['20-24', '25-29', '30-34', '35-39', '40-45'];
    const ageStats = {};
    
    if (products) {
      products.forEach(p => {
        if (!p.is_active) return;
        
        ageGroups.forEach(age => {
          if (p.target_age && p.target_age.includes(age.split('-')[0])) {
            ageStats[age] = (ageStats[age] || 0) + 1;
          }
        });
      });
    }
    
    ageGroups.forEach(age => {
      const count = ageStats[age] || 0;
      const percentage = activeProducts ? Math.round((count / activeProducts) * 100) : 0;
      console.log(`  ${age}歳: ${count.toLocaleString()}件 (${percentage}%)`);
    });
    
    // 5. カテゴリ別統計
    console.log('\n5️⃣ カテゴリ別統計:');
    
    const categoryStats = {};
    if (products) {
      products.forEach(p => {
        if (!p.is_active || !p.brand_category) return;
        categoryStats[p.brand_category] = (categoryStats[p.brand_category] || 0) + 1;
      });
    }
    
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const percentage = activeProducts ? Math.round((count / activeProducts) * 100) : 0;
        console.log(`  ${category}: ${count.toLocaleString()}件 (${percentage}%)`);
      });
    
    // 6. 更新状況
    console.log('\n6️⃣ 更新状況:');
    
    const now = new Date();
    const timeRanges = [
      { name: '24時間以内', hours: 24 },
      { name: '7日以内', hours: 24 * 7 },
      { name: '30日以内', hours: 24 * 30 },
      { name: '90日以内', hours: 24 * 90 }
    ];
    
    for (const range of timeRanges) {
      const since = new Date(now.getTime() - range.hours * 60 * 60 * 1000);
      const { count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .gte('last_synced', since.toISOString());
      
      console.log(`  ${range.name}に更新: ${count?.toLocaleString() || 0}件`);
    }
    
    // 7. データベース容量
    console.log('\n7️⃣ データベース容量:');
    
    const capacity = 100000; // Supabase Free tierの目安
    const usageRate = Math.round((totalProducts / capacity) * 100);
    const remaining = capacity - totalProducts;
    
    console.log(`  - 使用容量: ${totalProducts?.toLocaleString() || 0} / ${capacity.toLocaleString()}`);
    console.log(`  - 使用率: ${usageRate}%`);
    console.log(`  - 残り容量: ${remaining.toLocaleString()}件`);
    
    if (usageRate > 90) {
      console.log('  ⚠️ 警告: 容量が90%を超えています！');
    } else if (usageRate > 80) {
      console.log('  ⚠️ 注意: 容量が80%を超えています');
    } else {
      console.log('  ✅ 容量は健全です');
    }
    
    // 統計情報をファイルに保存
    const stats = {
      timestamp: new Date().toISOString(),
      total: totalProducts,
      active: activeProducts,
      inactive: totalProducts - activeProducts,
      activeRate: totalProducts ? Math.round((activeProducts / totalProducts) * 100) : 0,
      brandCount: Object.keys(brandStats).length,
      capacityUsage: usageRate,
      topBrands: Object.entries(brandStats)
        .sort((a, b) => b[1].active - a[1].active)
        .slice(0, 10)
        .map(([brand, stats]) => ({
          brand,
          active: stats.active,
          total: stats.total,
          priority: stats.priority
        }))
    };
    
    const statsFile = path.join(__dirname, '..', '..', 'data', 'database-stats.json');
    await require('fs').promises.mkdir(path.dirname(statsFile), { recursive: true });
    await require('fs').promises.writeFile(statsFile, JSON.stringify(stats, null, 2));
    
    console.log('\n✅ 統計情報を保存しました: data/database-stats.json');
    
  } catch (error) {
    console.error('❌ 統計更新エラー:', error);
    process.exit(1);
  }
}

// メイン実行
(async () => {
  await updateStatistics();
  process.exit(0);
})();
