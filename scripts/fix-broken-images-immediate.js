#!/usr/bin/env node
/**
 * 画像URLが欠落している商品を即座に修正するスクリプト
 * 楽天APIから再取得して更新
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 環境変数
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

if (!RAKUTEN_APP_ID) {
  console.error('❌ 楽天API環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// レート制限対策
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 楽天APIから商品情報を取得
 */
async function fetchProductFromRakutenAPI(itemCode) {
  const url = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
  const params = {
    applicationId: RAKUTEN_APP_ID,
    affiliateId: RAKUTEN_AFFILIATE_ID,
    itemCode: itemCode,
    format: 'json'
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`楽天API エラー (${itemCode}):`, error.response?.data || error.message);
    return null;
  }
}

/**
 * 楽天APIの画像URLを取得
 */
function getImageUrl(product) {
  // 優先順位: mediumImageUrls > imageUrl > smallImageUrls
  
  if (product.mediumImageUrls && product.mediumImageUrls.length > 0) {
    const mediumUrl = product.mediumImageUrls[0];
    if (typeof mediumUrl === 'string') {
      return mediumUrl;
    } else if (mediumUrl.imageUrl) {
      return mediumUrl.imageUrl;
    }
  }
  
  if (product.imageUrl) {
    return product.imageUrl;
  }
  
  if (product.smallImageUrls && product.smallImageUrls.length > 0) {
    const smallUrl = product.smallImageUrls[0];
    if (typeof smallUrl === 'string') {
      return smallUrl;
    } else if (smallUrl.imageUrl) {
      return smallUrl.imageUrl;
    }
  }
  
  return '';
}

async function fixBrokenImages() {
  console.log('🔧 画像URLが欠落している商品を修正します...\n');

  try {
    // 1. 画像URLが欠落している商品を取得
    console.log('1. 画像URLが欠落している商品を検索中...');
    
    const { data: brokenProducts, error: fetchError } = await supabase
      .from('external_products')
      .select('id, title, brand, source')
      .or('image_url.is.null,image_url.eq.')
      .eq('source', 'rakuten')
      .limit(100);
    
    if (fetchError) {
      console.error('❌ 商品取得エラー:', fetchError);
      return;
    }
    
    if (!brokenProducts || brokenProducts.length === 0) {
      console.log('✅ 画像URLが欠落している楽天商品はありません');
      return;
    }
    
    console.log(`   ${brokenProducts.length}件の問題のある商品を発見`);
    
    // 2. 各商品の画像URLを楽天APIから再取得
    console.log('\n2. 楽天APIから画像URLを再取得中...');
    
    let fixedCount = 0;
    let deletedCount = 0;
    
    for (let i = 0; i < brokenProducts.length; i++) {
      const product = brokenProducts[i];
      console.log(`   [${i + 1}/${brokenProducts.length}] ${product.title} (${product.id})`);
      
      // 楽天APIから商品情報を取得
      const apiData = await fetchProductFromRakutenAPI(product.id);
      
      if (apiData && apiData.Items && apiData.Items.length > 0) {
        const item = apiData.Items[0].Item;
        const imageUrl = getImageUrl(item);
        
        if (imageUrl) {
          // 画像URLを更新
          const { error: updateError } = await supabase
            .from('external_products')
            .update({ 
              image_url: imageUrl,
              last_synced: new Date().toISOString()
            })
            .eq('id', product.id);
          
          if (!updateError) {
            console.log(`     ✅ 画像URL更新成功`);
            fixedCount++;
          } else {
            console.error(`     ❌ 更新エラー:`, updateError);
          }
        } else {
          // 画像URLが取得できない場合は削除
          const { error: deleteError } = await supabase
            .from('external_products')
            .delete()
            .eq('id', product.id);
          
          if (!deleteError) {
            console.log(`     🗑️ 画像が見つからないため削除`);
            deletedCount++;
          }
        }
      } else {
        // APIで商品が見つからない場合は削除
        const { error: deleteError } = await supabase
          .from('external_products')
          .delete()
          .eq('id', product.id);
        
        if (!deleteError) {
          console.log(`     🗑️ 商品が見つからないため削除`);
          deletedCount++;
        }
      }
      
      // レート制限対策
      await sleep(1000);
    }
    
    // 3. 結果の表示
    console.log('\n3. 修正結果:');
    console.log(`   ✅ ${fixedCount}件の商品の画像URLを修正`);
    console.log(`   🗑️ ${deletedCount}件の商品を削除`);
    
    // 4. 最終確認
    const { count: remainingCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .or('image_url.is.null,image_url.eq.')
      .eq('source', 'rakuten');
    
    console.log(`\n   残りの問題のある商品: ${remainingCount}件`);
    
    console.log('\n✅ 修正完了！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 非楽天商品の画像URLを修正
async function fixNonRakutenImages() {
  console.log('\n🔧 非楽天商品の画像URLを修正中...');
  
  const { data: brokenProducts, error } = await supabase
    .from('external_products')
    .select('id, source')
    .or('image_url.is.null,image_url.eq.')
    .neq('source', 'rakuten')
    .limit(100);
  
  if (error) {
    console.error('❌ エラー:', error);
    return;
  }
  
  if (!brokenProducts || brokenProducts.length === 0) {
    console.log('✅ 非楽天商品に問題はありません');
    return;
  }
  
  console.log(`   ${brokenProducts.length}件の問題のある非楽天商品を削除します`);
  
  const { error: deleteError } = await supabase
    .from('external_products')
    .delete()
    .or('image_url.is.null,image_url.eq.')
    .neq('source', 'rakuten');
  
  if (!deleteError) {
    console.log(`   ✅ ${brokenProducts.length}件の不正な商品を削除しました`);
  }
}

// メイン処理
async function main() {
  console.log('🚀 画像URL修正プロセスを開始します\n');
  
  // 楽天商品の修正
  await fixBrokenImages();
  
  // 非楽天商品の修正
  await fixNonRakutenImages();
  
  console.log('\n✨ すべての処理が完了しました');
}

// スクリプトを実行
main().catch(error => {
  console.error('❌ 予期しないエラー:', error);
  process.exit(1);
});
