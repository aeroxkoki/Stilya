#!/usr/bin/env node
/**
 * 画像URL一括更新スクリプト（SQLクエリ版）
 * より高速にデータベース内の画像URLを800x800に更新
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

async function updateImageUrlsWithSQL() {
  console.log('🚀 画像URL一括更新を開始します...\n');
  
  try {
    // 現在の状態を確認
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 総商品数: ${totalCount || 0}件`);
    
    // 800x800以外のサイズを使用している楽天URLの数を確認
    const { data: needUpdateCheck } = await supabase
      .rpc('count_non_800x800_images');
    
    // カスタムRPCが存在しない場合は、通常のクエリで確認
    const { data: sampleBefore } = await supabase
      .from('external_products')
      .select('image_url')
      .like('image_url', '%rakuten.co.jp%')
      .like('image_url', '%_ex=%')
      .not('image_url', 'like', '%_ex=800x800%')
      .limit(5);
    
    const needUpdateCount = sampleBefore?.length || 0;
    
    if (needUpdateCount === 0) {
      console.log('✅ すべての画像が既に800x800に最適化されています！');
      return;
    }
    
    console.log(`\n⚠️ 更新が必要な画像URLを検出しました`);
    console.log('サンプル:');
    sampleBefore?.forEach((item, i) => {
      console.log(`[${i+1}] ${item.image_url}`);
    });
    
    // バッチ更新を実行
    console.log('\n🔄 画像URLを800x800に更新中...');
    
    // 1. 500x500 → 800x800
    const { error: error1 } = await supabase.rpc('update_image_urls_batch', {
      old_pattern: '_ex=500x500',
      new_pattern: '_ex=800x800'
    }).catch(async () => {
      // RPCが存在しない場合は通常の更新
      console.log('  📝 500x500 → 800x800 への更新...');
      const { data: urls500 } = await supabase
        .from('external_products')
        .select('id, image_url')
        .like('image_url', '%_ex=500x500%')
        .limit(1000);
      
      if (urls500 && urls500.length > 0) {
        for (const item of urls500) {
          const newUrl = item.image_url.replace('_ex=500x500', '_ex=800x800');
          await supabase
            .from('external_products')
            .update({ image_url: newUrl })
            .eq('id', item.id);
        }
        console.log(`    ✅ ${urls500.length}件を更新`);
      }
    });
    
    // 2. 400x400 → 800x800
    console.log('  📝 400x400 → 800x800 への更新...');
    const { data: urls400 } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=400x400%')
      .limit(1000);
    
    if (urls400 && urls400.length > 0) {
      for (const item of urls400) {
        const newUrl = item.image_url.replace('_ex=400x400', '_ex=800x800');
        await supabase
          .from('external_products')
          .update({ image_url: newUrl })
          .eq('id', item.id);
      }
      console.log(`    ✅ ${urls400.length}件を更新`);
    }
    
    // 3. 300x300 → 800x800
    console.log('  📝 300x300 → 800x800 への更新...');
    const { data: urls300 } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=300x300%')
      .limit(1000);
    
    if (urls300 && urls300.length > 0) {
      for (const item of urls300) {
        const newUrl = item.image_url.replace('_ex=300x300', '_ex=800x800');
        await supabase
          .from('external_products')
          .update({ image_url: newUrl })
          .eq('id', item.id);
      }
      console.log(`    ✅ ${urls300.length}件を更新`);
    }
    
    // 4. 128x128 → 800x800
    console.log('  📝 128x128 → 800x800 への更新...');
    const { data: urls128 } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=128x128%')
      .limit(1000);
    
    if (urls128 && urls128.length > 0) {
      for (const item of urls128) {
        const newUrl = item.image_url.replace('_ex=128x128', '_ex=800x800');
        await supabase
          .from('external_products')
          .update({ image_url: newUrl })
          .eq('id', item.id);
      }
      console.log(`    ✅ ${urls128.length}件を更新`);
    }
    
    // 5. その他のサイズパターン
    console.log('  📝 その他のサイズパターンの更新...');
    const { data: urlsOther } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%_ex=%')
      .not('image_url', 'like', '%_ex=800x800%')
      .limit(1000);
    
    if (urlsOther && urlsOther.length > 0) {
      for (const item of urlsOther) {
        const newUrl = item.image_url.replace(/_ex=\d+x\d+/g, '_ex=800x800');
        await supabase
          .from('external_products')
          .update({ image_url: newUrl })
          .eq('id', item.id);
      }
      console.log(`    ✅ ${urlsOther.length}件を更新`);
    }
    
    // 6. サイズパラメータがない楽天URLに追加
    console.log('  📝 サイズパラメータの追加...');
    const { data: urlsNoSize } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%thumbnail.image.rakuten.co.jp%')
      .not('image_url', 'like', '%_ex=%')
      .limit(1000);
    
    if (urlsNoSize && urlsNoSize.length > 0) {
      for (const item of urlsNoSize) {
        const newUrl = item.image_url.includes('?') 
          ? item.image_url + '&_ex=800x800'
          : item.image_url + '?_ex=800x800';
        await supabase
          .from('external_products')
          .update({ image_url: newUrl })
          .eq('id', item.id);
      }
      console.log(`    ✅ ${urlsNoSize.length}件を更新`);
    }
    
    // 更新後の確認
    console.log('\n🔍 更新後の確認...');
    const { data: sampleAfter } = await supabase
      .from('external_products')
      .select('image_url, source_brand')
      .like('image_url', '%_ex=800x800%')
      .limit(5);
    
    if (sampleAfter && sampleAfter.length > 0) {
      console.log('\n✅ 更新後のサンプル（800x800に最適化済み）:');
      sampleAfter.forEach((item, i) => {
        console.log(`[${i+1}] ${item.source_brand}: ${item.image_url}`);
      });
    }
    
    // 統計情報
    const { count: count800 } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .like('image_url', '%_ex=800x800%');
    
    console.log('\n📊 最終結果:');
    console.log(`総商品数: ${totalCount || 0}件`);
    console.log(`800x800画像: ${count800 || 0}件`);
    console.log(`最適化率: ${totalCount ? ((count800 / totalCount) * 100).toFixed(1) : 0}%`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
updateImageUrlsWithSQL()
  .then(() => {
    console.log('\n✨ 画像URL更新処理が完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
