#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

// .envファイルを読み込む
config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 楽天の画像URLを最適化する関数
 */
const optimizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // 楽天のサムネイルURLを高画質版に変換
    if (url.includes('thumbnail.image.rakuten.co.jp')) {
      // サムネイルドメインを通常の画像ドメインに変更
      let optimizedUrl = url.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
      
      // URLパス内のサイズ指定を除去
      optimizedUrl = optimizedUrl
        .replace('/128x128/', '/')
        .replace('/64x64/', '/')
        .replace('/pc/', '/')
        .replace('/thumbnail/', '/');
      
      // クエリパラメータのサイズ指定を除去
      optimizedUrl = optimizedUrl
        .replace('?_ex=128x128', '')
        .replace('?_ex=64x64', '')
        .replace('&_ex=128x128', '')
        .replace('&_ex=64x64', '');
      
      return optimizedUrl;
    }
    
    // その他のURLはそのまま返す
    return url;
    
  } catch (error) {
    console.warn('Error optimizing image URL:', error);
    return url;
  }
};

/**
 * データベースの画像URLを修正する
 */
async function fixImageUrls() {
  console.log('Starting image URL fix process...');
  
  let totalFixed = 0;
  let hasMore = true;
  let offset = 0;
  const batchSize = 100;
  
  while (hasMore) {
    try {
      // 商品を取得
      const { data: products, error } = await supabase
        .from('external_products')
        .select('id, image_url')
        .is('is_active', true)
        .not('image_url', 'is', null)
        .not('image_url', 'eq', '')
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error('Error fetching products:', error);
        break;
      }
      
      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }
      
      console.log(`Processing batch: ${offset} - ${offset + products.length}`);
      
      // 画像URLを最適化
      const updates = [];
      for (const product of products) {
        const originalUrl = product.image_url;
        const optimizedUrl = optimizeImageUrl(originalUrl);
        
        // URLが変更された場合のみ更新対象に追加
        if (originalUrl !== optimizedUrl) {
          updates.push({
            id: product.id,
            image_url: optimizedUrl
          });
          
          console.log(`Optimizing: ${product.id}`);
          console.log(`  From: ${originalUrl}`);
          console.log(`  To:   ${optimizedUrl}`);
        }
      }
      
      // バッチ更新
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('external_products')
          .upsert(updates, { onConflict: 'id' });
        
        if (updateError) {
          console.error('Error updating products:', updateError);
        } else {
          totalFixed += updates.length;
          console.log(`Updated ${updates.length} products in this batch`);
        }
      }
      
      // 次のバッチへ
      offset += batchSize;
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Unexpected error:', error);
      break;
    }
  }
  
  console.log(`\nProcess completed. Total products fixed: ${totalFixed}`);
}

// スクリプトを実行
fixImageUrls()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
