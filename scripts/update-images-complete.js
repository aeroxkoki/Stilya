#!/usr/bin/env node
/**
 * 画像URL完全更新スクリプト
 * すべての楽天画像URLを800x800に更新
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

async function updateAllImageUrlsComplete() {
  console.log('🚀 画像URL完全更新を開始します...\n');
  
  const startTime = Date.now();
  let totalUpdated = 0;
  
  try {
    // 現在の状態を確認
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 総商品数: ${totalCount || 0}件\n`);
    
    // まず500x500の総数を確認
    const { count: count500 } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .like('image_url', '%_ex=500x500%');
    
    console.log(`📝 500x500画像の総数: ${count500 || 0}件`);
    
    if (count500 > 0) {
      console.log('🔄 500x500 → 800x800 への一括更新を開始...\n');
      
      let offset = 0;
      const batchSize = 1000; // 1000件ずつ処理
      
      while (offset < count500) {
        // バッチで取得
        const { data: batch, error: fetchError } = await supabase
          .from('external_products')
          .select('id, image_url')
          .like('image_url', '%_ex=500x500%')
          .range(offset, offset + batchSize - 1);
        
        if (fetchError) {
          console.error('❌ データ取得エラー:', fetchError);
          break;
        }
        
        if (!batch || batch.length === 0) {
          break;
        }
        
        console.log(`📦 バッチ ${Math.floor(offset / batchSize) + 1}: ${batch.length}件を処理中...`);
        
        // 並列で更新（50件ずつ）
        for (let i = 0; i < batch.length; i += 50) {
          const updateBatch = batch.slice(i, i + 50);
          
          const updatePromises = updateBatch.map(item => {
            const newUrl = item.image_url.replace('_ex=500x500', '_ex=800x800');
            return supabase
              .from('external_products')
              .update({ image_url: newUrl })
              .eq('id', item.id)
              .then(() => {
                totalUpdated++;
              })
              .catch(error => {
                console.error(`  ❌ 更新エラー (ID: ${item.id}):`, error.message);
              });
          });
          
          await Promise.all(updatePromises);
          process.stdout.write(`\r  進捗: ${totalUpdated}/${count500}件 (${((totalUpdated / count500) * 100).toFixed(1)}%)`);
        }
        
        console.log(''); // 改行
        offset += batchSize;
        
        // API制限対策
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // その他のサイズも確認して更新
    console.log('\n📝 その他のサイズパターンの確認...');
    
    // 他のサイズパターンをまとめて取得
    const sizePatterns = ['400x400', '300x300', '128x128', '256x256', '600x600'];
    
    for (const size of sizePatterns) {
      const { count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .like('image_url', `%_ex=${size}%`);
      
      if (count > 0) {
        console.log(`\n📝 ${size} → 800x800 への更新（${count}件）...`);
        
        let offset = 0;
        const batchSize = 1000;
        
        while (offset < count) {
          const { data: batch } = await supabase
            .from('external_products')
            .select('id, image_url')
            .like('image_url', `%_ex=${size}%`)
            .range(offset, offset + batchSize - 1);
          
          if (!batch || batch.length === 0) break;
          
          for (const item of batch) {
            const newUrl = item.image_url.replace(`_ex=${size}`, '_ex=800x800');
            await supabase
              .from('external_products')
              .update({ image_url: newUrl })
              .eq('id', item.id);
            totalUpdated++;
          }
          
          offset += batchSize;
          process.stdout.write(`\r  進捗: ${Math.min(offset, count)}/${count}件`);
        }
        console.log('');
      }
    }
    
    // サイズパラメータがない楽天URLの処理
    console.log('\n📝 サイズパラメータがない楽天URLの確認...');
    const { count: noSizeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .like('image_url', '%thumbnail.image.rakuten.co.jp%')
      .not('image_url', 'like', '%_ex=%');
    
    if (noSizeCount > 0) {
      console.log(`検出: ${noSizeCount}件`);
      console.log('800x800パラメータを追加中...');
      
      let offset = 0;
      const batchSize = 1000;
      
      while (offset < noSizeCount) {
        const { data: batch } = await supabase
          .from('external_products')
          .select('id, image_url')
          .like('image_url', '%thumbnail.image.rakuten.co.jp%')
          .not('image_url', 'like', '%_ex=%')
          .range(offset, offset + batchSize - 1);
        
        if (!batch || batch.length === 0) break;
        
        for (const item of batch) {
          const newUrl = item.image_url.includes('?') 
            ? item.image_url + '&_ex=800x800'
            : item.image_url + '?_ex=800x800';
          
          await supabase
            .from('external_products')
            .update({ image_url: newUrl })
            .eq('id', item.id);
          totalUpdated++;
        }
        
        offset += batchSize;
        process.stdout.write(`\r  進捗: ${Math.min(offset, noSizeCount)}/${noSizeCount}件`);
      }
      console.log('');
    }
    
    // 最終確認
    console.log('\n🔍 最終確認...');
    
    const { count: count800Final } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .like('image_url', '%_ex=800x800%');
    
    const { data: samples } = await supabase
      .from('external_products')
      .select('image_url, source_brand')
      .like('image_url', '%_ex=800x800%')
      .limit(5);
    
    if (samples && samples.length > 0) {
      console.log('\n✅ 更新後のサンプル（800x800に最適化済み）:');
      samples.forEach((item, i) => {
        console.log(`[${i+1}] ${item.source_brand}`);
        console.log(`    ${item.image_url}`);
      });
    }
    
    // 最終統計
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 最終結果:');
    console.log('='.repeat(60));
    console.log(`実行時間: ${Math.floor(duration / 60)}分${duration % 60}秒`);
    console.log(`総商品数: ${totalCount || 0}件`);
    console.log(`800x800画像: ${count800Final || 0}件`);
    console.log(`更新件数: ${totalUpdated}件`);
    console.log(`最適化率: ${totalCount ? ((count800Final / totalCount) * 100).toFixed(1) : 0}%`);
    
    // 未更新の画像を確認
    const { count: remainingCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .like('image_url', '%rakuten.co.jp%')
      .not('image_url', 'like', '%_ex=800x800%');
    
    if (remainingCount > 0) {
      console.log(`\n⚠️ まだ${remainingCount}件の楽天画像が800x800以外のサイズです。`);
    } else {
      console.log('\n✅ すべての楽天画像が800x800に最適化されました！');
    }
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
  }
}

// 実行
updateAllImageUrlsComplete()
  .then(() => {
    console.log('\n✨ 画像URL完全更新処理が完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
