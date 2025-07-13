import { fetchMixedProducts } from '../src/services/productService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testFilterFunctionality() {
  console.log('=== フィルター機能テスト開始 ===\n');
  
  try {
    // 1. フィルターなしで商品を取得
    console.log('1. フィルターなしで商品を取得...');
    const noFilterResult = await fetchMixedProducts(null, 10, 0);
    if (noFilterResult.success && noFilterResult.data) {
      console.log(`✅ 取得商品数: ${noFilterResult.data.length}`);
      console.log('カテゴリー分布:', 
        noFilterResult.data.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {})
      );
      console.log('価格帯:', 
        noFilterResult.data.map(p => p.price).sort((a, b) => a - b)
      );
    }
    
    // 2. カテゴリーフィルターのテスト
    console.log('\n2. カテゴリーフィルター (tops) のテスト...');
    const categoryFilter = {
      categories: ['tops'],
      priceRange: [0, Infinity],
      selectedTags: [],
      includeUsed: false
    };
    
    const categoryResult = await fetchMixedProducts(null, 10, 0, categoryFilter);
    if (categoryResult.success && categoryResult.data) {
      console.log(`✅ 取得商品数: ${categoryResult.data.length}`);
      const categories = [...new Set(categoryResult.data.map(p => p.category))];
      console.log('カテゴリー:', categories);
      console.log(categories.length === 1 && categories[0] === 'tops' 
        ? '✅ カテゴリーフィルターが正常に動作' 
        : '❌ カテゴリーフィルターが機能していない');
    }
    
    // 3. 価格フィルターのテスト
    console.log('\n3. 価格フィルター (0-5000円) のテスト...');
    const priceFilter = {
      categories: [],
      priceRange: [0, 5000],
      selectedTags: [],
      includeUsed: false
    };
    
    const priceResult = await fetchMixedProducts(null, 10, 0, priceFilter);
    if (priceResult.success && priceResult.data) {
      console.log(`✅ 取得商品数: ${priceResult.data.length}`);
      const prices = priceResult.data.map(p => p.price);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      console.log(`価格帯: ${minPrice}円 〜 ${maxPrice}円`);
      console.log(maxPrice <= 5000 
        ? '✅ 価格フィルターが正常に動作' 
        : '❌ 価格フィルターが機能していない');
    }
    
    // 4. 中古品フィルターのテスト
    console.log('\n4. 中古品フィルターのテスト...');
    const usedFilterOff = {
      categories: [],
      priceRange: [0, Infinity],
      selectedTags: [],
      includeUsed: false
    };
    
    const usedFilterOn = {
      categories: [],
      priceRange: [0, Infinity],
      selectedTags: [],
      includeUsed: true
    };
    
    const newOnlyResult = await fetchMixedProducts(null, 20, 0, usedFilterOff);
    const allResult = await fetchMixedProducts(null, 20, 0, usedFilterOn);
    
    if (newOnlyResult.success && allResult.success) {
      const newOnlyUsedCount = newOnlyResult.data.filter(p => p.isUsed).length;
      const allUsedCount = allResult.data.filter(p => p.isUsed).length;
      
      console.log(`新品のみ: 中古品数 ${newOnlyUsedCount}/${newOnlyResult.data.length}`);
      console.log(`すべて: 中古品数 ${allUsedCount}/${allResult.data.length}`);
      console.log(newOnlyUsedCount === 0 
        ? '✅ 中古品フィルターが正常に動作' 
        : '❌ 中古品フィルターが機能していない');
    }
    
    // 5. 複合フィルターのテスト
    console.log('\n5. 複合フィルター (カテゴリー + 価格) のテスト...');
    const complexFilter = {
      categories: ['tops', 'bottoms'],
      priceRange: [3000, 10000],
      selectedTags: [],
      includeUsed: false
    };
    
    const complexResult = await fetchMixedProducts(null, 10, 0, complexFilter);
    if (complexResult.success && complexResult.data) {
      console.log(`✅ 取得商品数: ${complexResult.data.length}`);
      const validProducts = complexResult.data.filter(p => 
        (p.category === 'tops' || p.category === 'bottoms') &&
        p.price >= 3000 && p.price <= 10000 &&
        !p.isUsed
      );
      console.log(`条件に合致する商品: ${validProducts.length}/${complexResult.data.length}`);
      console.log(validProducts.length === complexResult.data.length 
        ? '✅ 複合フィルターが正常に動作' 
        : '❌ 複合フィルターが機能していない');
    }
    
  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
  }
  
  console.log('\n=== フィルター機能テスト完了 ===');
  process.exit(0);
}

testFilterFunctionality();
