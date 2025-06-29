/**
 * データベース内の楽天画像URLを修正するスクリプト
 * 高画質URL（アクセス不可）をサムネイルURL（アクセス可能）に戻す
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRakutenImageUrls() {
  console.log('🔧 楽天画像URLの修正を開始...\n');
  
  try {
    // 1. 現在の状態を確認
    console.log('1️⃣ 現在のデータベース状態を確認中...');
    const { data: statusData, error: statusError } = await supabase
      .rpc('get_image_url_stats');
    
    if (statusError) {
      // RPC関数がない場合は直接SQLを実行
      const { data: products, error: countError } = await supabase
        .from('external_products')
        .select('image_url', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .like('image_url', '%image.rakuten.co.jp%')
        .not('image_url', 'like', '%thumbnail.image.rakuten.co.jp%');
      
      if (countError) {
        console.error('Error counting products:', countError);
        return;
      }
      
      console.log(`高画質URL（修正が必要）: ${products.length}件`);
    }
    
    // 2. 高画質URLを持つ商品を取得
    console.log('\n2️⃣ 修正が必要な商品を取得中...');
    const { data: productsToFix, error: fetchError } = await supabase
      .from('external_products')
      .select('id, image_url')
      .eq('is_active', true)
      .like('image_url', '%image.rakuten.co.jp%')
      .not('image_url', 'like', '%thumbnail.image.rakuten.co.jp%');
    
    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }
    
    console.log(`修正対象: ${productsToFix.length}件`);
    
    if (productsToFix.length === 0) {
      console.log('✅ 修正が必要な商品はありません');
      return;
    }
    
    // 3. バッチで修正
    console.log('\n3️⃣ 画像URLを修正中...');
    const batchSize = 100;
    let updatedCount = 0;
    
    for (let i = 0; i < productsToFix.length; i += batchSize) {
      const batch = productsToFix.slice(i, i + batchSize);
      
      // 各商品のURLを修正
      const updates = batch.map(product => {
        // 高画質URLをサムネイルURLに戻す
        let fixedUrl = product.image_url;
        
        // image.rakuten.co.jp → thumbnail.image.rakuten.co.jp
        if (fixedUrl.includes('image.rakuten.co.jp') && !fixedUrl.includes('thumbnail.')) {
          fixedUrl = fixedUrl.replace('image.rakuten.co.jp', 'thumbnail.image.rakuten.co.jp');
          
          // サイズパラメータを追加（元々あった場合の復元）
          if (!fixedUrl.includes('_ex=') && !fixedUrl.includes('/128x128/')) {
            // URLの構造に応じてサイズを追加
            if (fixedUrl.includes('?')) {
              fixedUrl += '&_ex=128x128';
            } else {
              fixedUrl += '?_ex=128x128';
            }
          }
        }
        
        return {
          id: product.id,
          image_url: fixedUrl
        };
      });
      
      // バッチ更新
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('external_products')
          .update({ image_url: update.image_url })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`Error updating product ${update.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
      
      console.log(`進捗: ${Math.min(i + batchSize, productsToFix.length)}/${productsToFix.length}`);
    }
    
    // 4. 結果を表示
    console.log('\n✅ 修正完了！');
    console.log(`  修正された商品数: ${updatedCount}件`);
    
    // 5. 修正後の状態を確認
    console.log('\n4️⃣ 修正後の状態を確認中...');
    const { data: afterProducts, error: afterError } = await supabase
      .from('external_products')
      .select('image_url', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .like('image_url', '%thumbnail.image.rakuten.co.jp%');
    
    if (!afterError) {
      console.log(`サムネイルURL: ${afterProducts.length}件`);
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
fixRakutenImageUrls();
