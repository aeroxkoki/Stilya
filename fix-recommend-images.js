#!/usr/bin/env node

/**
 * おすすめ画面の画像表示問題を修正するスクリプト
 * 画像URLのHTTP -> HTTPS変換と楽天画像URLの最適化を実施
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

// 画像URLを最適化する関数
function optimizeImageUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }
  
  let optimizedUrl = url.trim();
  
  // 1. HTTPをHTTPSに変換
  if (optimizedUrl.startsWith('http://')) {
    optimizedUrl = optimizedUrl.replace('http://', 'https://');
  }
  
  // 2. 楽天の画像URLの場合の最適化
  if (optimizedUrl.includes('rakuten.co.jp')) {
    // thumbnail.image.rakuten.co.jpの場合
    if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
      // 既存の_exパラメータがある場合は800x800に強制変更
      if (optimizedUrl.includes('?_ex=')) {
        optimizedUrl = optimizedUrl.replace(/_ex=\d+x\d+/, '_ex=800x800');
      } else if (optimizedUrl.includes('?')) {
        optimizedUrl = optimizedUrl + '&_ex=800x800';
      } else {
        optimizedUrl = optimizedUrl + '?_ex=800x800';
      }
    }
  }
  
  return optimizedUrl;
}

async function fixImageUrls() {
  console.log('🔧 画像URLの修正を開始...\n');
  
  try {
    // 1. HTTPのURLを持つ商品を取得
    console.log('1️⃣ HTTPのURLを持つ商品を確認...');
    const { data: httpProducts, error: httpError } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', 'http://%')
      .limit(1000);
    
    if (httpError) {
      console.error('❌ HTTP商品取得エラー:', httpError);
    } else {
      console.log(`📊 HTTPのURL: ${httpProducts?.length || 0}件\n`);
      
      if (httpProducts && httpProducts.length > 0) {
        console.log('🔄 HTTPからHTTPSへの変換を実行...');
        
        let updatedCount = 0;
        const batchSize = 100;
        
        for (let i = 0; i < httpProducts.length; i += batchSize) {
          const batch = httpProducts.slice(i, i + batchSize);
          const updates = batch.map(product => ({
            id: product.id,
            image_url: optimizeImageUrl(product.image_url)
          })).filter(item => item.image_url !== null);
          
          if (updates.length > 0) {
            const { error: updateError } = await supabase
              .from('external_products')
              .upsert(updates, { onConflict: 'id' });
            
            if (updateError) {
              console.error('❌ バッチ更新エラー:', updateError);
            } else {
              updatedCount += updates.length;
              console.log(`  進捗: ${updatedCount}/${httpProducts.length}`);
            }
          }
        }
        
        console.log(`✅ ${updatedCount}件のHTTP URLをHTTPSに変換しました\n`);
      }
    }
    
    // 2. 楽天の画像URLで_exパラメータがないものを修正
    console.log('2️⃣ 楽天の画像URLを最適化...');
    const { data: rakutenProducts, error: rakutenError } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%thumbnail.image.rakuten.co.jp%')
      .not('image_url', 'ilike', '%_ex=%')
      .limit(1000);
    
    if (rakutenError) {
      console.error('❌ 楽天商品取得エラー:', rakutenError);
    } else {
      console.log(`📊 最適化対象の楽天URL: ${rakutenProducts?.length || 0}件\n`);
      
      if (rakutenProducts && rakutenProducts.length > 0) {
        console.log('🔄 楽天画像URLの最適化を実行...');
        
        let optimizedCount = 0;
        const batchSize = 100;
        
        for (let i = 0; i < rakutenProducts.length; i += batchSize) {
          const batch = rakutenProducts.slice(i, i + batchSize);
          const updates = batch.map(product => ({
            id: product.id,
            image_url: optimizeImageUrl(product.image_url)
          })).filter(item => item.image_url !== null);
          
          if (updates.length > 0) {
            const { error: updateError } = await supabase
              .from('external_products')
              .upsert(updates, { onConflict: 'id' });
            
            if (updateError) {
              console.error('❌ バッチ更新エラー:', updateError);
            } else {
              optimizedCount += updates.length;
              console.log(`  進捗: ${optimizedCount}/${rakutenProducts.length}`);
            }
          }
        }
        
        console.log(`✅ ${optimizedCount}件の楽天URLを最適化しました\n`);
      }
    }
    
    // 3. 空の画像URLを持つ商品を無効化
    console.log('3️⃣ 空の画像URLを持つ商品を確認...');
    const { count: emptyCount, error: emptyCountError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .or('image_url.is.null,image_url.eq.')
    
    if (emptyCountError) {
      console.error('❌ カウントエラー:', emptyCountError);
    } else {
      console.log(`📊 空の画像URL: ${emptyCount || 0}件`);
      
      if (emptyCount && emptyCount > 0) {
        console.log('🔄 空の画像URLを持つ商品を無効化...');
        
        const { error: deactivateError } = await supabase
          .from('external_products')
          .update({ is_active: false })
          .or('image_url.is.null,image_url.eq.');
        
        if (deactivateError) {
          console.error('❌ 無効化エラー:', deactivateError);
        } else {
          console.log(`✅ ${emptyCount}件の商品を無効化しました\n`);
        }
      }
    }
    
    // 4. 修正結果の確認
    console.log('4️⃣ 修正結果の確認...');
    
    // アクティブな商品の総数
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    // HTTPSのURL数
    const { count: httpsCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .like('image_url', 'https://%');
    
    // 楽天URLで_exパラメータありの数
    const { count: optimizedRakutenCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .like('image_url', '%_ex=%');
    
    console.log('\n📊 最終統計:');
    console.log(`  アクティブな商品（画像あり）: ${activeCount || 0}件`);
    console.log(`  HTTPS URL: ${httpsCount || 0}件`);
    console.log(`  最適化済み楽天URL: ${optimizedRakutenCount || 0}件`);
    
    // サンプル確認
    console.log('\n📸 修正後のサンプル画像URL（5件）:');
    const { data: samples } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .order('last_synced', { ascending: false })
      .limit(5);
    
    if (samples) {
      samples.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title?.substring(0, 30)}...`);
        console.log(`   ${product.image_url?.substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// 実行
fixImageUrls().then(() => {
  console.log('\n✨ 画像URL修正完了');
  process.exit(0);
});
