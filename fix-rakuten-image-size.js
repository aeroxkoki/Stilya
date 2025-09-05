#!/usr/bin/env node

/**
 * 楽天画像URLのサイズパラメータを800x800に修正
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRakutenImageSize() {
  console.log('🔧 楽天画像URLのサイズを800x800に修正...\n');
  
  try {
    // 1. 小さいサイズの画像URLを取得
    console.log('📊 楽天画像URLのサイズパラメータを確認...');
    const { data: products, error: fetchError } = await supabase
      .from('external_products')
      .select('id, image_url')
      .eq('is_active', true)
      .like('image_url', '%_ex=%')
      .not('image_url', 'like', '%_ex=800x800%')
      .limit(5000);
    
    if (fetchError) {
      console.error('❌ 取得エラー:', fetchError);
      return;
    }
    
    console.log(`📊 修正対象: ${products?.length || 0}件\n`);
    
    if (products && products.length > 0) {
      console.log('🔄 サイズパラメータを800x800に変更...');
      
      let updatedCount = 0;
      const batchSize = 100;
      
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const updates = batch.map(product => {
          // _ex=XXXxXXXを_ex=800x800に置換
          const newUrl = product.image_url.replace(/_ex=\d+x\d+/, '_ex=800x800');
          return {
            id: product.id,
            image_url: newUrl
          };
        });
        
        // 各商品を個別に更新（upsertではなくupdate）
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('external_products')
            .update({ image_url: update.image_url })
            .eq('id', update.id);
            
          if (updateError) {
            console.error(`❌ 更新エラー (ID: ${update.id}):`, updateError.message);
          } else {
            updatedCount++;
          }
        }
        
        console.log(`  進捗: ${updatedCount}/${products.length}`);
      }
      
      console.log(`✅ ${updatedCount}件の画像URLを修正しました\n`);
    }
    
    // 2. 修正後の確認
    console.log('📸 修正後のサンプル（5件）:');
    const { data: samples } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .eq('is_active', true)
      .like('image_url', '%_ex=800x800%')
      .limit(5);
    
    if (samples) {
      samples.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title?.substring(0, 30)}...`);
        console.log(`   ${product.image_url?.substring(0, 120)}...`);
      });
    }
    
    // 3. 統計
    const { count: count800 } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .like('image_url', '%_ex=800x800%');
    
    const { count: countOther } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .like('image_url', '%_ex=%')
      .not('image_url', 'like', '%_ex=800x800%');
    
    console.log('\n📊 最終統計:');
    console.log(`  800x800サイズ: ${count800 || 0}件`);
    console.log(`  その他サイズ: ${countOther || 0}件`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// 実行
fixRakutenImageSize().then(() => {
  console.log('\n✨ 修正完了');
  process.exit(0);
});
