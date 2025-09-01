#!/usr/bin/env node
/**
 * Supabaseダッシュボードで直接SQLを実行する手順書
 * (anon keyではDDL操作ができないため)
 */

const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const projectId = supabaseUrl ? supabaseUrl.split('.')[0].replace('https://', '') : 'ddypgpljprljqrblpuli';

console.log('========================================');
console.log('📝 Supabaseダッシュボードで以下の手順を実行してください');
console.log('========================================\n');

console.log('1️⃣ 以下のURLにアクセス:');
console.log(`   https://supabase.com/dashboard/project/${projectId}/sql/new\n`);

console.log('2️⃣ 以下のSQLをコピーして実行:\n');

const sql = `
-- 不足しているカラムを追加
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS item_update_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_external_products_is_seasonal ON external_products(is_seasonal);

-- 確認クエリ
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'external_products'
AND column_name IN ('shop_name', 'item_update_timestamp', 'is_seasonal')
ORDER BY ordinal_position;
`;

console.log('```sql');
console.log(sql);
console.log('```\n');

console.log('3️⃣ 実行後、以下のコマンドで同期を再実行:');
console.log('   cd /Users/koki_air/Documents/GitHub/Stilya');
console.log('   node scripts/sync/sync-mvp-brands.js\n');

console.log('========================================');
console.log('注意事項:');
console.log('- Supabaseの管理画面にログインが必要です');
console.log('- SQLエディタで「Run」ボタンをクリックして実行してください');
console.log('- エラーが表示された場合は、エラーメッセージを確認してください');
console.log('========================================\n');

// 簡易的なテスト同期
const testSync = async () => {
  console.log('\n📊 現在のデータベース状態を確認...\n');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    const { data, error, count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ データベース接続エラー:', error.message);
    } else {
      console.log(`✅ external_productsテーブル: ${count || 0}件の商品`);
    }
    
    // ブランド別の統計
    const { data: brands, error: brandError } = await supabase
      .from('external_products')
      .select('brand, source_brand')
      .not('brand', 'is', null)
      .limit(10);
    
    if (!brandError && brands) {
      const brandCounts = {};
      brands.forEach(item => {
        const brand = item.brand || 'Unknown';
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      });
      
      console.log('\n📈 ブランド別商品数（サンプル）:');
      Object.entries(brandCounts).forEach(([brand, count]) => {
        console.log(`   - ${brand}: ${count}件`);
      });
    }
    
  } catch (err) {
    console.error('予期しないエラー:', err);
  }
};

testSync();
