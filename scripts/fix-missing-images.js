#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixMissingImages() {
  console.log('🔧 画像URLが欠落している商品を修正します...\n');

  try {
    // 1. 現在の商品の状態を確認
    console.log('1. 現在の商品データの状態を確認中...');
    
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true });
    
    console.log(`   総商品数: ${totalCount}件`);
    
    // 画像URLがNULLまたは空の商品数を確認
    const { count: missingImageCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .or('image_url.is.null,image_url.eq.');
    
    console.log(`   画像URLが欠落: ${missingImageCount}件`);
    
    if (missingImageCount === 0) {
      console.log('✅ 画像URLが欠落している商品はありません');
      return;
    }

    // 2. 欠落している商品の詳細を確認
    const { data: problematicProducts } = await supabase
      .from('external_products')
      .select('id, title, brand, source')
      .or('image_url.is.null,image_url.eq.')
      .limit(10);
    
    console.log('\n   問題のある商品の例:');
    problematicProducts?.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (${p.brand}) - ${p.source}`);
    });

    // 3. 不正なデータを削除
    console.log('\n2. 画像URLが欠落している商品を削除中...');
    
    const { error: deleteError } = await supabase
      .from('external_products')
      .delete()
      .or('image_url.is.null,image_url.eq.');
    
    if (deleteError) {
      console.error('❌ 削除エラー:', deleteError);
      return;
    }
    
    console.log(`✅ ${missingImageCount}件の不正な商品を削除しました`);

    // 4. 新しい商品データを挿入（MVPブランドの商品）
    console.log('\n3. 新しい商品データを挿入中...');
    
    const mvpProducts = [
      // UNIQLO商品
      {
        id: `uniqlo_tshirt_${Date.now()}_1`,
        title: 'エアリズムメッシュTシャツ',
        brand: 'UNIQLO',
        price: 1990,
        image_url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/455360/item/goods_00_455360.jpg',
        description: '通気性に優れたメッシュ素材のTシャツ',
        tags: ['カジュアル', 'ユニセックス', 'エアリズム', 'トップス', '速乾'],
        category: 'トップス',
        affiliate_url: 'https://www.uniqlo.com/jp/ja/products/E455360-000',
        source: 'manual',
        priority: 1,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: `uniqlo_jeans_${Date.now()}_2`,
        title: 'ストレッチセルビッジスリムフィットジーンズ',
        brand: 'UNIQLO',
        price: 4990,
        image_url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/455326/item/goods_69_455326.jpg',
        description: 'ストレッチ性のあるスリムフィットジーンズ',
        tags: ['カジュアル', 'デニム', 'ストレッチ', 'ボトムス', 'スリム'],
        category: 'ボトムス',
        affiliate_url: 'https://www.uniqlo.com/jp/ja/products/E455326-000',
        source: 'manual',
        priority: 1,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: `uniqlo_shirt_${Date.now()}_3`,
        title: 'ファインクロスストレッチスリムフィットシャツ',
        brand: 'UNIQLO',
        price: 2990,
        image_url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/450273/item/goods_00_450273.jpg',
        description: 'ビジネスにも使えるスリムフィットシャツ',
        tags: ['ビジネス', 'シャツ', 'ストレッチ', 'トップス'],
        category: 'トップス',
        affiliate_url: 'https://www.uniqlo.com/jp/ja/products/E450273-000',
        source: 'manual',
        priority: 1,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      
      // ZARA商品（静的画像URLを使用）
      {
        id: `zara_blazer_${Date.now()}_4`,
        title: 'リネンブレンドブレザー',
        brand: 'ZARA',
        price: 7990,
        image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=600&fit=crop',
        description: 'リネン混紡素材のカジュアルブレザー',
        tags: ['ビジネス', 'カジュアル', 'リネン', 'アウター', 'ジャケット'],
        category: 'アウター',
        affiliate_url: 'https://www.zara.com/jp/',
        source: 'manual',
        priority: 2,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: `zara_dress_${Date.now()}_5`,
        title: 'フローラルプリントワンピース',
        brand: 'ZARA',
        price: 5990,
        image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
        description: '花柄プリントのエレガントなワンピース',
        tags: ['フェミニン', 'ワンピース', 'フローラル', 'エレガント'],
        category: 'ワンピース',
        affiliate_url: 'https://www.zara.com/jp/',
        source: 'manual',
        priority: 2,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      
      // GU商品
      {
        id: `gu_hoodie_${Date.now()}_6`,
        title: 'スウェットパーカ',
        brand: 'GU',
        price: 2990,
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop',
        description: '着心地の良いスウェットパーカー',
        tags: ['カジュアル', 'パーカー', 'トップス', 'スウェット'],
        category: 'トップス',
        affiliate_url: 'https://www.gu-global.com/',
        source: 'manual',
        priority: 3,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: `gu_skirt_${Date.now()}_7`,
        title: 'プリーツミディスカート',
        brand: 'GU',
        price: 2490,
        image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=600&fit=crop',
        description: '動きやすいプリーツスカート',
        tags: ['フェミニン', 'スカート', 'プリーツ', 'ミディ丈'],
        category: 'スカート',
        affiliate_url: 'https://www.gu-global.com/',
        source: 'manual',
        priority: 3,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      
      // H&M商品
      {
        id: `hm_sweater_${Date.now()}_8`,
        title: 'リブニットセーター',
        brand: 'H&M',
        price: 3999,
        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop',
        description: 'ベーシックなリブニットセーター',
        tags: ['カジュアル', 'ニット', 'トップス', 'ベーシック'],
        category: 'トップス',
        affiliate_url: 'https://www2.hm.com/ja_jp/',
        source: 'manual',
        priority: 4,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: `hm_pants_${Date.now()}_9`,
        title: 'ワイドレッグパンツ',
        brand: 'H&M',
        price: 4999,
        image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
        description: 'トレンドのワイドレッグパンツ',
        tags: ['カジュアル', 'ワイド', 'ボトムス', 'トレンド'],
        category: 'ボトムス',
        affiliate_url: 'https://www2.hm.com/ja_jp/',
        source: 'manual',
        priority: 4,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      
      // 無印良品
      {
        id: `muji_tshirt_${Date.now()}_10`,
        title: 'オーガニックコットンTシャツ',
        brand: '無印良品',
        price: 1990,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
        description: 'オーガニックコットン100%のTシャツ',
        tags: ['ベーシック', 'オーガニック', 'トップス', 'コットン'],
        category: 'トップス',
        affiliate_url: 'https://www.muji.com/jp/ja/store',
        source: 'manual',
        priority: 5,
        is_active: true,
        is_used: false,
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];

    // 商品を挿入
    const { data: insertedData, error: insertError } = await supabase
      .from('external_products')
      .insert(mvpProducts)
      .select();
    
    if (insertError) {
      console.error('❌ 挿入エラー:', insertError);
      return;
    }
    
    console.log(`✅ ${insertedData?.length || 0}件の新しい商品を追加しました`);

    // 5. 最終確認
    console.log('\n4. 最終確認...');
    
    const { count: newTotalCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true });
    
    const { count: newMissingCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .or('image_url.is.null,image_url.eq.');
    
    console.log(`   総商品数: ${newTotalCount}件`);
    console.log(`   画像URLが欠落: ${newMissingCount}件`);
    
    // サンプル商品を表示
    const { data: sampleProducts } = await supabase
      .from('external_products')
      .select('id, title, brand, image_url, price')
      .limit(5)
      .order('created_at', { ascending: false });
    
    console.log('\n   新しく追加された商品の例:');
    sampleProducts?.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (${p.brand}) - ¥${p.price}`);
      console.log(`      画像: ${p.image_url ? '✓' : '✗'}`);
    });
    
    console.log('\n✅ 修正完了！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// スクリプトを実行
fixMissingImages();
