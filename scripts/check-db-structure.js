/**
 * Supabaseのテーブル構造を確認
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('📋 Supabaseテーブル構造の確認\n');
  console.log('================================\n');
  
  try {
    // 各テーブルを個別にチェック
    const tablesToCheck = [
      'products',
      'external_products',
      'users',
      'swipes',
      'favorites',
      'click_logs'
    ];
    
    console.log('\n個別テーブルチェック:');
    for (const tableName of tablesToCheck) {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`  ✅ ${tableName}: ${count} 件のレコード`);
        
        // 楽天画像を含むテーブルをチェック
        if (tableName === 'products' || tableName === 'external_products') {
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .ilike('imageUrl', '%rakuten%')
            .limit(3);
          
          if (!sampleError && sampleData && sampleData.length > 0) {
            console.log(`     → 楽天画像URL ${sampleData.length} 件検出`);
            console.log(`     サンプル: ${sampleData[0].imageUrl?.substring(0, 60)}...`);
          } else {
            // imageUrlカラムがない場合は他のカラム名を試す
            const { data: altData } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (altData && altData.length > 0) {
              const columns = Object.keys(altData[0]);
              const imageColumns = columns.filter(col => 
                col.toLowerCase().includes('image') || 
                col.toLowerCase().includes('img') ||
                col.toLowerCase().includes('thumbnail')
              );
              
              if (imageColumns.length > 0) {
                console.log(`     → 画像カラム: ${imageColumns.join(', ')}`);
              }
            }
          }
        }
      } else {
        console.log(`  ❌ ${tableName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

// 実行
checkTables().then(() => {
  console.log('\n✨ 完了');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
