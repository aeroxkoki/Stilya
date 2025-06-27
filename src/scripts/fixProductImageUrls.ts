import { supabase } from '../services/supabase';
import { optimizeImageUrl } from '../utils/supabaseOptimization';

/**
 * Supabase内の既存商品の画像URLを修正するスクリプト
 * 楽天のサムネイルURLを高画質URLに更新する
 */
async function fixProductImageUrls() {
  console.log('=== 商品画像URL修正開始 ===');
  console.log('開始時刻:', new Date().toLocaleString());
  
  let totalUpdated = 0;
  let totalProcessed = 0;
  let hasMore = true;
  const batchSize = 100;
  let offset = 0;
  
  try {
    while (hasMore) {
      console.log(`\n処理中... (offset: ${offset})`);
      
      // 商品データをバッチで取得
      const { data: products, error } = await supabase
        .from('external_products')
        .select('id, title, image_url')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .not('image_url', 'eq', '')
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error('データ取得エラー:', error);
        break;
      }
      
      if (!products || products.length === 0) {
        console.log('処理する商品がこれ以上ありません');
        hasMore = false;
        break;
      }
      
      console.log(`取得した商品数: ${products.length}`);
      
      // 各商品の画像URLをチェックして更新
      const updates = [];
      
      for (const product of products) {
        totalProcessed++;
        
        const originalUrl = product.image_url;
        const optimizedUrl = optimizeImageUrl(originalUrl);
        
        // URLが変更された場合のみ更新対象に追加
        if (originalUrl !== optimizedUrl) {
          // サムネイルURLか確認
          const isThumbnail = originalUrl.includes('thumbnail.image.rakuten.co.jp') || 
                            originalUrl.includes('128x128') || 
                            originalUrl.includes('64x64') ||
                            originalUrl.includes('_ex=128x128') ||
                            originalUrl.includes('_ex=64x64');
          
          if (isThumbnail) {
            console.log(`\n[${totalProcessed}] 更新対象商品を発見:`);
            console.log(`  タイトル: ${product.title.substring(0, 50)}...`);
            console.log(`  元URL: ${originalUrl}`);
            console.log(`  新URL: ${optimizedUrl}`);
            
            updates.push({
              id: product.id,
              image_url: optimizedUrl
            });
            totalUpdated++;
          }
        }
      }
      
      // バッチ更新を実行
      if (updates.length > 0) {
        console.log(`\n${updates.length}件の商品を更新中...`);
        
        // 個別に更新（より安全）
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('external_products')
            .update({ image_url: update.image_url })
            .eq('id', update.id);
          
          if (updateError) {
            console.error(`商品ID ${update.id} の更新に失敗:`, updateError);
          }
        }
        
        console.log('更新完了');
      }
      
      // 次のバッチへ
      offset += batchSize;
      
      // 進捗状況を表示
      if (totalProcessed % 500 === 0) {
        console.log(`\n=== 進捗状況 ===`);
        console.log(`処理済み: ${totalProcessed}件`);
        console.log(`更新済み: ${totalUpdated}件`);
      }
      
      // レート制限対策のため少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n=== 修正完了 ===');
    console.log(`総処理数: ${totalProcessed}件`);
    console.log(`総更新数: ${totalUpdated}件`);
    console.log(`更新率: ${((totalUpdated / totalProcessed) * 100).toFixed(1)}%`);
    console.log('終了時刻:', new Date().toLocaleString());
    
    // 修正後の状態を確認
    if (totalUpdated > 0) {
      console.log('\n=== 修正後の確認 ===');
      const { data: checkData, error: checkError } = await supabase
        .from('external_products')
        .select('image_url')
        .eq('is_active', true)
        .like('image_url', '%thumbnail.image.rakuten.co.jp%')
        .limit(5);
      
      if (!checkError && checkData) {
        if (checkData.length === 0) {
          console.log('✅ サムネイルURLは全て修正されました');
        } else {
          console.log(`⚠️  まだ${checkData.length}件以上のサムネイルURLが残っています`);
        }
      }
    }
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
  
  process.exit(0);
}

// 実行確認
console.log('このスクリプトは全ての商品画像URLをチェックし、楽天のサムネイルURLを高画質版に更新します。');
console.log('処理には時間がかかる場合があります。');
console.log('');

// 3秒後に実行開始
console.log('3秒後に処理を開始します...');
setTimeout(fixProductImageUrls, 3000);
