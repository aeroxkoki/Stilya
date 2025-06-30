#!/usr/bin/env node
/**
 * 画像URL更新スクリプト
 * データベース内の楽天画像URLを800x800サイズに更新
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 画像URLを最適化する関数（アプリと同じロジック）
function optimizeImageUrl(url) {
  const PLACEHOLDER_IMAGE = 'https://picsum.photos/800/800?grayscale';
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  let optimizedUrl = url.trim();
  
  try {
    // HTTPをHTTPSに変換
    if (optimizedUrl.startsWith('http://')) {
      optimizedUrl = optimizedUrl.replace('http://', 'https://');
    }
    
    // 楽天の画像URLの場合の最適化
    if (optimizedUrl.includes('rakuten.co.jp')) {
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && optimizedUrl.includes('_ex=')) {
        // 既存のサイズパラメータを800x800に変更
        optimizedUrl = optimizedUrl.replace(/_ex=\d+x\d+/g, '_ex=800x800');
      } else if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && !optimizedUrl.includes('_ex=')) {
        // サイズパラメータがない場合は追加
        optimizedUrl += optimizedUrl.includes('?') ? '&_ex=800x800' : '?_ex=800x800';
      }
    }
    
    new URL(optimizedUrl); // URLとして有効かチェック
    return optimizedUrl;
    
  } catch (error) {
    console.warn('[ImageOptimizer] Invalid URL:', url, error);
    return PLACEHOLDER_IMAGE;
  }
}

async function updateImageUrls() {
  console.log('🚀 画像URL更新処理を開始します...\n');
  
  const batchSize = 100;
  let offset = 0;
  let totalUpdated = 0;
  let totalProcessed = 0;
  
  while (true) {
    try {
      // バッチで商品を取得
      const { data: products, error: fetchError } = await supabase
        .from('external_products')
        .select('id, image_url')
        .not('image_url', 'is', null)
        .range(offset, offset + batchSize - 1);
      
      if (fetchError) {
        console.error('❌ データ取得エラー:', fetchError);
        break;
      }
      
      if (!products || products.length === 0) {
        console.log('✅ すべての商品の処理が完了しました');
        break;
      }
      
      console.log(`\n📦 バッチ ${Math.floor(offset / batchSize) + 1}: ${products.length}件を処理中...`);
      
      // 更新が必要な商品を特定
      const updates = [];
      for (const product of products) {
        const originalUrl = product.image_url;
        const optimizedUrl = optimizeImageUrl(originalUrl);
        
        if (originalUrl !== optimizedUrl) {
          updates.push({
            id: product.id,
            image_url: optimizedUrl
          });
        }
      }
      
      // バッチ更新を実行
      if (updates.length > 0) {
        console.log(`  → ${updates.length}件の画像URLを更新します...`);
        
        // 個別に更新（upsertのバルク更新より安全）
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('external_products')
            .update({ image_url: update.image_url })
            .eq('id', update.id);
          
          if (updateError) {
            console.error(`  ❌ 更新エラー (ID: ${update.id}):`, updateError.message);
          } else {
            totalUpdated++;
          }
        }
        
        console.log(`  ✅ ${updates.length}件の更新が完了`);
      } else {
        console.log(`  ℹ️ このバッチには更新が必要な商品はありません`);
      }
      
      totalProcessed += products.length;
      offset += batchSize;
      
      // API制限対策
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('❌ バッチ処理エラー:', error);
      break;
    }
  }
  
  // 結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('📊 更新完了レポート');
  console.log('='.repeat(60));
  console.log(`処理済み商品数: ${totalProcessed}`);
  console.log(`更新済み商品数: ${totalUpdated}`);
  console.log(`更新率: ${totalProcessed > 0 ? ((totalUpdated / totalProcessed) * 100).toFixed(1) : 0}%`);
  
  // 更新後の確認
  console.log('\n🔍 更新後のサンプル確認...');
  const { data: samples } = await supabase
    .from('external_products')
    .select('image_url, source_brand')
    .limit(5);
  
  if (samples) {
    console.log('\n📸 更新後の画像URL（サンプル5件）:');
    samples.forEach((item, i) => {
      console.log(`\n[${i+1}] ${item.source_brand}`);
      console.log(`URL: ${item.image_url}`);
      if (item.image_url?.includes('_ex=800x800')) {
        console.log('✅ 800x800に最適化済み');
      } else if (item.image_url?.includes('_ex=')) {
        const match = item.image_url.match(/_ex=(\d+x\d+)/);
        console.log(`⚠️ サイズ: ${match?.[1] || '不明'}`);
      }
    });
  }
}

// 実行確認
async function main() {
  console.log('⚠️  このスクリプトはデータベースの画像URLを更新します。');
  console.log('   実行前に必ずバックアップを取ってください。\n');
  
  // 件数確認
  const { count } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 総商品数: ${count || 0}件`);
  
  // プロンプトで確認
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\n続行しますか？ (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      readline.close();
      await updateImageUrls();
    } else {
      console.log('❌ 処理をキャンセルしました');
      readline.close();
    }
    process.exit(0);
  });
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('未処理のエラー:', error);
  process.exit(1);
});

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
}
