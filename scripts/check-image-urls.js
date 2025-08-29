const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkImageUrls() {
  console.log('🔍 商品の画像URLをチェック中...\n');
  
  try {
    // 最新の商品を10件取得
    const { data, error } = await supabase
      .from('external_products')
      .select('id, title, brand, image_url, source, priority')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .order('priority', { ascending: true })
      .order('last_synced', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ エラー:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ 商品が見つかりませんでした');
      return;
    }
    
    console.log(`✅ ${data.length}件の商品を取得しました\n`);
    
    // 各商品の画像URLをチェック
    for (const product of data) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📦 商品: ${product.title}`);
      console.log(`   ブランド: ${product.brand || 'なし'}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   ソース: ${product.source}`);
      console.log(`   優先度: ${product.priority}`);
      console.log(`   画像URL: ${product.image_url ? product.image_url.substring(0, 100) + '...' : 'なし'}`);
      
      if (product.image_url) {
        // URLの形式をチェック
        if (product.image_url.includes('placehold.co')) {
          console.log('   ⚠️ プレースホルダー画像です');
        } else if (product.image_url.startsWith('http://')) {
          console.log('   ⚠️ HTTPプロトコルを使用しています（HTTPSに変換が必要）');
        } else if (product.image_url.includes('rakuten.co.jp')) {
          console.log('   ✅ 楽天の画像URL');
        } else if (product.image_url.includes('valuecommerce')) {
          console.log('   ✅ バリューコマースの画像URL');
        } else {
          console.log('   ✅ その他の有効なURL');
        }
      } else {
        console.log('   ❌ 画像URLが設定されていません');
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 統計情報
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: withImageCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    const { count: placeholderCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .like('image_url', '%placehold.co%');
    
    console.log('\n📊 統計情報:');
    console.log(`   総商品数: ${totalCount}`);
    console.log(`   画像URL設定済み: ${withImageCount} (${Math.round(withImageCount/totalCount*100)}%)`);
    console.log(`   プレースホルダー画像: ${placeholderCount} (${Math.round(placeholderCount/totalCount*100)}%)`);
    console.log(`   有効な画像: ${withImageCount - placeholderCount} (${Math.round((withImageCount - placeholderCount)/totalCount*100)}%)`);
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

checkImageUrls();
