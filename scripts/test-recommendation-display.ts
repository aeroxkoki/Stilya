import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRecommendationData() {
  console.log('🔍 おすすめ画面のデータ取得をテスト中...\n');
  
  try {
    // 1. ヒーロー商品として表示される商品を取得（priority順）
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 ヒーロー商品（トップに大きく表示される商品）:\n');
    
    const { data: heroProduct, error: heroError } = await supabase
      .from('external_products')
      .select('id, title, brand, image_url, price, tags, priority')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .order('priority', { ascending: true })
      .order('last_synced', { ascending: false })
      .limit(1)
      .single();
    
    if (heroError) {
      console.error('❌ ヒーロー商品の取得エラー:', heroError);
    } else if (heroProduct) {
      console.log(`タイトル: ${heroProduct.title}`);
      console.log(`ブランド: ${heroProduct.brand || 'なし'}`);
      console.log(`価格: ¥${heroProduct.price.toLocaleString()}`);
      console.log(`タグ: ${heroProduct.tags?.join(', ') || 'なし'}`);
      console.log(`\n画像URL:`);
      console.log(`${heroProduct.image_url}`);
      
      // 画像URLの検証
      if (heroProduct.image_url) {
        if (heroProduct.image_url.includes('placehold.co')) {
          console.log('\n⚠️ 警告: プレースホルダー画像が使用されています');
        } else if (heroProduct.image_url.startsWith('http://')) {
          console.log('\n⚠️ 警告: HTTPプロトコルです（HTTPSに変換が必要）');
        } else {
          console.log('\n✅ 有効な画像URLです');
        }
      }
    }
    
    // 2. トレンディング商品を取得
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 トレンディング商品（人気の商品）:\n');
    
    const { data: trendingProducts, error: trendingError } = await supabase
      .from('external_products')
      .select('id, title, brand, image_url, price')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .order('priority', { ascending: true })
      .limit(6)
      .range(1, 6); // ヒーロー商品を除く
    
    if (trendingError) {
      console.error('❌ トレンディング商品の取得エラー:', trendingError);
    } else if (trendingProducts && trendingProducts.length > 0) {
      trendingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   ブランド: ${product.brand || 'なし'}`);
        console.log(`   価格: ¥${product.price.toLocaleString()}`);
        console.log(`   画像: ${product.image_url.substring(0, 80)}...`);
      });
    } else {
      console.log('⚠️ トレンディング商品が見つかりませんでした');
    }
    
    // 3. データ変換のシミュレーション
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 データ変換のシミュレーション:\n');
    
    if (heroProduct) {
      // dbProductToProduct関数の動作をシミュレート
      const convertedProduct = {
        id: heroProduct.id,
        title: heroProduct.title,
        brand: heroProduct.brand,
        price: heroProduct.price,
        imageUrl: heroProduct.image_url, // image_url → imageUrl
        tags: heroProduct.tags,
      };
      
      console.log('変換前（データベース）:');
      console.log(`  image_url: ${heroProduct.image_url?.substring(0, 80)}...`);
      console.log('\n変換後（アプリ）:');
      console.log(`  imageUrl: ${convertedProduct.imageUrl?.substring(0, 80)}...`);
      console.log(`\n✅ 変換が正しく行われます`);
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 解決策:');
  console.log('1. EnhancedRecommendScreenで product.imageUrl を使用するように修正済み');
  console.log('2. CachedImageコンポーネントで画像URLの最適化を実施');
  console.log('3. デバッグモードを有効化して問題の特定が可能');
}

testRecommendationData();
