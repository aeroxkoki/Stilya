const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('環境変数チェック:');
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testFilterFunctionality() {
  console.log('\n=== フィルター機能テスト開始 ===\n');
  
  try {
    // 1. まず商品数を確認
    console.log('0. データベースの商品数を確認...');
    const { count, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (countError) {
      console.error('❌ カウントエラー:', countError);
      return;
    }
    
    console.log(`✅ アクティブな商品総数: ${count}`);
    
    // 1. フィルターなしで商品を取得
    console.log('\n1. フィルターなしで商品を取得...');
    const { data: noFilterData, error: noFilterError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .limit(10);
    
    if (noFilterError) {
      console.error('❌ エラー:', noFilterError);
    } else if (noFilterData) {
      console.log(`✅ 取得商品数: ${noFilterData.length}`);
      const categoryDist = noFilterData.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});
      console.log('カテゴリー分布:', categoryDist);
      const prices = noFilterData.map(p => p.price).sort((a, b) => a - b);
      if (prices.length > 0) {
        console.log(`価格帯: ${Math.min(...prices)}円 〜 ${Math.max(...prices)}円`);
      }
    }
    
    // 2. カテゴリーフィルターのテスト
    console.log('\n2. カテゴリーフィルター (tops) のテスト...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .in('category', ['tops'])
      .limit(10);
    
    if (categoryError) {
      console.error('❌ エラー:', categoryError);
    } else if (categoryData) {
      console.log(`✅ 取得商品数: ${categoryData.length}`);
      const categories = [...new Set(categoryData.map(p => p.category))];
      console.log('取得されたカテゴリー:', categories);
      
      if (categoryData.length === 0) {
        console.log('⚠️ topsカテゴリーの商品が存在しません');
      } else {
        console.log(categories.length === 1 && categories[0] === 'tops' 
          ? '✅ カテゴリーフィルターが正常に動作' 
          : '❌ カテゴリーフィルターが機能していない');
      }
    }
    
    // 3. 価格フィルターのテスト
    console.log('\n3. 価格フィルター (0-5000円) のテスト...');
    const { data: priceData, error: priceError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .gte('price', 0)
      .lte('price', 5000)
      .limit(10);
    
    if (priceError) {
      console.error('❌ エラー:', priceError);
    } else if (priceData) {
      console.log(`✅ 取得商品数: ${priceData.length}`);
      if (priceData.length > 0) {
        const prices = priceData.map(p => p.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        console.log(`価格帯: ${minPrice}円 〜 ${maxPrice}円`);
        console.log(maxPrice <= 5000 
          ? '✅ 価格フィルターが正常に動作' 
          : '❌ 価格フィルターが機能していない');
      } else {
        console.log('⚠️ 5000円以下の商品が存在しません');
      }
    }
    
    // 4. 中古品フィルターのテスト
    console.log('\n4. 中古品フィルターのテスト...');
    
    // 新品のみ
    const { data: newOnlyData, error: newOnlyError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .eq('is_used', false)
      .limit(20);
    
    // すべて
    const { data: allData, error: allError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .limit(20);
    
    if (!newOnlyError && newOnlyData && !allError && allData) {
      const newOnlyUsedCount = newOnlyData.filter(p => p.is_used).length;
      const allUsedCount = allData.filter(p => p.is_used).length;
      
      console.log(`新品のみ: 中古品数 ${newOnlyUsedCount}/${newOnlyData.length}`);
      console.log(`すべて: 中古品数 ${allUsedCount}/${allData.length}`);
      console.log(newOnlyUsedCount === 0 
        ? '✅ 中古品フィルターが正常に動作' 
        : '❌ 中古品フィルターが機能していない');
    }
    
    // 5. 複合フィルターのテスト
    console.log('\n5. 複合フィルター (カテゴリー + 価格) のテスト...');
    const { data: complexData, error: complexError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .in('category', ['tops', 'bottoms'])
      .gte('price', 3000)
      .lte('price', 10000)
      .eq('is_used', false)
      .limit(10);
    
    if (complexError) {
      console.error('❌ エラー:', complexError);
    } else if (complexData) {
      console.log(`✅ 取得商品数: ${complexData.length}`);
      if (complexData.length > 0) {
        const validProducts = complexData.filter(p => 
          (p.category === 'tops' || p.category === 'bottoms') &&
          p.price >= 3000 && p.price <= 10000 &&
          !p.is_used
        );
        console.log(`条件に合致する商品: ${validProducts.length}/${complexData.length}`);
        console.log(validProducts.length === complexData.length 
          ? '✅ 複合フィルターが正常に動作' 
          : '❌ 複合フィルターが機能していない');
      } else {
        console.log('⚠️ 条件に合致する商品が存在しません');
      }
    }
    
  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error.message || error);
  }
  
  console.log('\n=== フィルター機能テスト完了 ===');
}

testFilterFunctionality();
