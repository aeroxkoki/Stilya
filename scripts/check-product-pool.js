#!/usr/bin/env node

/**
 * 商品プールの状況を確認するスクリプト
 * データベースに存在する商品の総数と、各種フィルター条件での商品数を確認
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProductPool() {
  console.log('📊 商品プールの状況を確認中...\n');
  
  try {
    // 1. 総商品数を確認
    const { count: totalCount, error: totalError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (totalError) throw totalError;
    console.log(`✅ 総商品数: ${totalCount?.toLocaleString()} 件`);
    
    // 2. 画像URLが有効な商品数
    const { count: withImageCount, error: imageError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    if (imageError) throw imageError;
    console.log(`✅ 画像URLが有効な商品数: ${withImageCount?.toLocaleString()} 件`);
    
    // 3. 性別ごとの商品数
    const genders = ['male', 'female', 'unisex'];
    console.log('\n📊 性別ごとの商品数:');
    
    for (const gender of genders) {
      const { count, error } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('gender', gender)
        .not('image_url', 'is', null)
        .not('image_url', 'eq', '');
      
      if (error) throw error;
      console.log(`  - ${gender}: ${count?.toLocaleString()} 件`);
    }
    
    // 4. 女性向け商品（female + unisex）
    const { count: femaleOrUnisexCount, error: femaleUnisexError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .in('gender', ['female', 'unisex'])
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    if (femaleUnisexError) throw femaleUnisexError;
    console.log(`\n✅ 女性向け商品総数 (female + unisex): ${femaleOrUnisexCount?.toLocaleString()} 件`);
    
    // 5. スタイル別の商品数
    const styles = ['カジュアル', 'ナチュラル', 'クラシック', 'フェミニン', 'モード', 'ストリート'];
    console.log('\n📊 スタイル別の商品数:');
    
    for (const style of styles) {
      const { count, error } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .contains('style_tags', [style])
        .not('image_url', 'is', null)
        .not('image_url', 'eq', '');
      
      if (error) throw error;
      console.log(`  - ${style}: ${count?.toLocaleString()} 件`);
    }
    
    // 6. 価格帯別の商品数
    const priceRanges = [
      { label: '〜3,000円', min: 0, max: 3000 },
      { label: '3,000円〜5,000円', min: 3000, max: 5000 },
      { label: '5,000円〜10,000円', min: 5000, max: 10000 },
      { label: '10,000円〜15,000円', min: 10000, max: 15000 },
      { label: '15,000円〜', min: 15000, max: 999999 }
    ];
    
    console.log('\n📊 価格帯別の商品数:');
    
    for (const range of priceRanges) {
      const { count, error } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('price', range.min)
        .lte('price', range.max)
        .not('image_url', 'is', null)
        .not('image_url', 'eq', '');
      
      if (error) throw error;
      console.log(`  - ${range.label}: ${count?.toLocaleString()} 件`);
    }
    
    // 7. 最近追加された商品（過去7日間）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount, error: recentError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', sevenDaysAgo)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    if (recentError) throw recentError;
    console.log(`\n✅ 過去7日間に追加された商品: ${recentCount?.toLocaleString()} 件`);
    
    // 8. サンプル商品を5件取得して表示
    console.log('\n📦 サンプル商品（5件）:');
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('external_products')
      .select('id, title, brand, price, gender, style_tags')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .limit(5);
    
    if (sampleError) throw sampleError;
    
    sampleProducts?.forEach(product => {
      console.log(`  - ${product.title} (${product.brand}) - ¥${product.price?.toLocaleString()}`);
      console.log(`    性別: ${product.gender}, スタイル: ${product.style_tags?.join(', ') || 'なし'}`);
    });
    
    console.log('\n✅ 商品プールの確認が完了しました');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
checkProductPool();
