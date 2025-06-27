/**
 * 楽天商品データを再取得して画像URLを更新するスクリプト
 * 
 * 使用方法:
 * npx expo run:ios でアプリを起動して、実行される
 */

import { supabase } from '@/services/supabase';
import { fetchRakutenFashionProducts } from '@/services/rakutenService';

export async function refreshRakutenProducts() {
  console.log('🔄 楽天商品データの再取得を開始します...');
  
  try {
    // 1. 既存の楽天商品を無効化
    const { error: updateError } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .eq('source', 'rakuten')
      .like('image_url', '%thumbnail.image.rakuten.co.jp%');
    
    if (updateError) {
      console.error('❌ 既存商品の無効化に失敗:', updateError);
      return;
    }
    
    console.log('✅ 既存の低解像度画像商品を無効化しました');
    
    // 2. 新しい商品データを取得
    console.log('📥 楽天APIから新しい商品データを取得中...');
    
    const results = await Promise.all([
      fetchRakutenFashionProducts(undefined, 100371, 1, 30, true), // レディース
      fetchRakutenFashionProducts(undefined, 551177, 1, 30, true), // メンズ
    ]);
    
    const allProducts = [...results[0].products, ...results[1].products];
    console.log(`✅ ${allProducts.length}件の商品を取得しました`);
    
    // 3. 高画質画像を持つ商品のみをフィルタリング
    const validProducts = allProducts.filter(product => {
      // medium画像URLを持つ商品を優先
      const hasValidImage = product.imageUrl && 
        !product.imageUrl.includes('thumbnail.image.rakuten.co.jp') &&
        !product.imageUrl.includes('_ex=64x64') &&
        !product.imageUrl.includes('_ex=128x128');
      
      if (!hasValidImage) {
        console.log(`⚠️ 低画質画像をスキップ: ${product.title}`);
      }
      
      return hasValidImage;
    });
    
    console.log(`✅ ${validProducts.length}件の高画質商品を保存します`);
    
    // 4. データベースに保存
    if (validProducts.length > 0) {
      const productsToInsert = validProducts.map(product => ({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image_url: product.imageUrl,
        description: product.description,
        tags: product.tags,
        category: product.category,
        affiliate_url: product.affiliateUrl,
        source: product.source,
        is_active: true,
        is_used: product.isUsed || false,
        priority: 5, // 中間優先度
        created_at: new Date().toISOString(),
        last_synced: new Date().toISOString(),
      }));
      
      const { error: insertError } = await supabase
        .from('external_products')
        .upsert(productsToInsert, { onConflict: 'id' });
      
      if (insertError) {
        console.error('❌ 商品の保存に失敗:', insertError);
      } else {
        console.log('✅ 商品データを正常に保存しました');
      }
    }
    
    // 5. 結果を確認
    const { count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'rakuten')
      .eq('is_active', true);
    
    console.log(`\n📊 最終結果:`);
    console.log(`アクティブな楽天商品数: ${count}件`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// デバッグ用：最初の楽天商品の画像URLを確認
export async function checkRakutenImageUrls() {
  const { data, error } = await supabase
    .from('external_products')
    .select('id, title, image_url')
    .eq('source', 'rakuten')
    .eq('is_active', true)
    .limit(5);
  
  if (error) {
    console.error('エラー:', error);
    return;
  }
  
  console.log('現在の楽天商品画像URL:');
  data?.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title}`);
    console.log(`   URL: ${product.image_url}`);
  });
}
