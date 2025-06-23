const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkIsUsedColumn() {
  console.log('🔍 is_usedカラムの確認を開始します...\n');

  try {
    // テーブル構造を確認
    const { data: columns, error: columnsError } = await supabase
      .from('external_products')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ エラー:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      const sampleProduct = columns[0];
      const hasIsUsedColumn = 'is_used' in sampleProduct;
      
      console.log('📊 external_productsテーブルのカラム:');
      console.log(Object.keys(sampleProduct).join(', '));
      console.log('\n');
      
      if (hasIsUsedColumn) {
        console.log('✅ is_usedカラムが存在します');
        
        // 中古品の統計を取得
        const { data: stats, error: statsError } = await supabase
          .from('external_products')
          .select('is_used');
        
        if (!statsError && stats) {
          const totalProducts = stats.length;
          const usedProducts = stats.filter(p => p.is_used === true).length;
          const newProducts = stats.filter(p => p.is_used === false).length;
          const nullProducts = stats.filter(p => p.is_used === null).length;
          
          console.log('\n📈 中古品統計:');
          console.log(`   総商品数: ${totalProducts}`);
          console.log(`   中古品: ${usedProducts} (${(usedProducts / totalProducts * 100).toFixed(2)}%)`);
          console.log(`   新品: ${newProducts} (${(newProducts / totalProducts * 100).toFixed(2)}%)`);
          console.log(`   不明: ${nullProducts} (${(nullProducts / totalProducts * 100).toFixed(2)}%)`);
        }
      } else {
        console.log('❌ is_usedカラムが存在しません');
        console.log('\n💡 以下のコマンドでカラムを追加してください:');
        console.log('   node scripts/database/add-used-products-column.sql');
      }
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

checkIsUsedColumn();
