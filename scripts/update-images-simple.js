#!/usr/bin/env node
/**
 * 画像URL一括更新スクリプト（シンプル版）
 * データベース内の画像URLを800x800に更新
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

// バッチ処理のヘルパー関数
async function updateBatch(urls, oldPattern, newPattern) {
  let updated = 0;
  
  for (let i = 0; i < urls.length; i += 50) { // 50件ずつ処理
    const batch = urls.slice(i, i + 50);
    
    // 並列で更新
    const updatePromises = batch.map(item => {
      const newUrl = item.image_url.replace(oldPattern, newPattern);
      return supabase
        .from('external_products')
        .update({ image_url: newUrl })
        .eq('id', item.id)
        .then(() => {
          updated++;
        })
        .catch(error => {
          console.error(`  ❌ 更新エラー (ID: ${item.id}):`, error.message);
        });
    });
    
    await Promise.all(updatePromises);
    process.stdout.write(`\r    進捗: ${updated}/${urls.length}件`);
  }
  
  console.log(`\n    ✅ ${updated}件を更新完了`);
  return updated;
}

async function updateAllImageUrls() {
  console.log('🚀 画像URL一括更新を開始します...\n');
  
  const startTime = Date.now();
  let totalUpdated = 0;
  
  try {
    // 現在の状態を確認
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 総商品数: ${totalCount || 0}件\n`);
    
    // 1. 500x500 → 800x800
    console.log('📝 500x500 → 800x800 への更新...');
    const { data: urls500, error: error500 } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=500x500%');
    
    if (!error500 && urls500 && urls500.length > 0) {
      console.log(`  検出: ${urls500.length}件`);
      totalUpdated += await updateBatch(urls500, '_ex=500x500', '_ex=800x800');
    }
    
    // 2. 400x400 → 800x800
    console.log('\n📝 400x400 → 800x800 への更新...');
    const { data: urls400, error: error400 } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=400x400%');
    
    if (!error400 && urls400 && urls400.length > 0) {
      console.log(`  検出: ${urls400.length}件`);
      totalUpdated += await updateBatch(urls400, '_ex=400x400', '_ex=800x800');
    }
    
    // 3. 300x300 → 800x800
    console.log('\n📝 300x300 → 800x800 への更新...');
    const { data: urls300, error: error300 } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=300x300%');
    
    if (!error300 && urls300 && urls300.length > 0) {
      console.log(`  検出: ${urls300.length}件`);
      totalUpdated += await updateBatch(urls300, '_ex=300x300', '_ex=800x800');
    }
    
    // 4. 128x128 → 800x800
    console.log('\n📝 128x128 → 800x800 への更新...');
    const { data: urls128, error: error128 } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=128x128%');
    
    if (!error128 && urls128 && urls128.length > 0) {
      console.log(`  検出: ${urls128.length}件`);
      totalUpdated += await updateBatch(urls128, '_ex=128x128', '_ex=800x800');
    }
    
    // 5. その他のサイズパターンを確認
    console.log('\n📝 その他のサイズパターンを確認中...');
    const { data: urlsOther, error: errorOther } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=%')
      .not('image_url', 'like', '%_ex=800x800%')
      .limit(10);
    
    if (!errorOther && urlsOther && urlsOther.length > 0) {
      console.log(`  その他のサイズパターンを検出: ${urlsOther.length}件`);
      urlsOther.forEach(item => {
        const match = item.image_url.match(/_ex=(\d+x\d+)/);
        if (match) {
          console.log(`    - ${match[1]}: ${item.image_url.substring(0, 80)}...`);
        }
      });
    }
    
    // 6. サイズパラメータがない楽天URL
    console.log('\n📝 サイズパラメータがない楽天URLを確認中...');
    const { data: urlsNoSize, count: noSizeCount } = await supabase
      .from('external_products')
      .select('id, image_url', { count: 'exact' })
      .like('image_url', '%thumbnail.image.rakuten.co.jp%')
      .not('image_url', 'like', '%_ex=%')
      .limit(1000);
    
    if (urlsNoSize && urlsNoSize.length > 0) {
      console.log(`  検出: ${noSizeCount}件（処理対象: ${urlsNoSize.length}件）`);
      
      let updated = 0;
      for (const item of urlsNoSize) {
        const newUrl = item.image_url.includes('?') 
          ? item.image_url + '&_ex=800x800'
          : item.image_url + '?_ex=800x800';
        
        const { error } = await supabase
          .from('external_products')
          .update({ image_url: newUrl })
          .eq('id', item.id);
        
        if (!error) updated++;
        process.stdout.write(`\r    進捗: ${updated}/${urlsNoSize.length}件`);
      }
      console.log(`\n    ✅ ${updated}件を更新完了`);
      totalUpdated += updated;
    }
    
    // 結果の確認
    console.log('\n🔍 更新結果の確認...');
    
    // 800x800の画像数を確認
    const { count: count800 } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .like('image_url', '%_ex=800x800%');
    
    // サンプル表示
    const { data: samples } = await supabase
      .from('external_products')
      .select('image_url, source_brand')
      .like('image_url', '%_ex=800x800%')
      .limit(3);
    
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
    console.log(`実行時間: ${duration}秒`);
    console.log(`総商品数: ${totalCount || 0}件`);
    console.log(`800x800画像: ${count800 || 0}件`);
    console.log(`更新件数: ${totalUpdated}件`);
    console.log(`最適化率: ${totalCount ? ((count800 / totalCount) * 100).toFixed(1) : 0}%`);
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
  }
}

// 実行
updateAllImageUrls()
  .then(() => {
    console.log('\n✨ 画像URL更新処理が完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
