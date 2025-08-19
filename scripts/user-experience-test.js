#!/usr/bin/env node

/**
 * ユーザー体験テストスクリプト（JavaScript版）
 * 初めてアプリをダウンロードしたユーザーとして、主要機能をテストします
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase初期化
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const results = [];

async function addResult(testName, passed, error, details) {
  const result = { testName, passed, error, details };
  results.push(result);
  console.log(`${passed ? '✅' : '❌'} ${testName}`);
  if (error) console.error(`   └─ Error: ${error}`);
  if (details) console.log(`   └─ Details:`, JSON.stringify(details, null, 2));
}

// 1. Supabase接続テスト
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    await addResult('Supabase接続', true, undefined, { hasSession: !!data.session });
  } catch (error) {
    await addResult('Supabase接続', false, error.message);
  }
}

// 2. 商品データの存在確認
async function testProductAvailability() {
  try {
    const { data, error, count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: false })
      .limit(1);
    
    if (error) throw error;
    
    const hasProducts = count && count > 0;
    await addResult('商品データの存在', hasProducts, 
      hasProducts ? undefined : '商品データがありません',
      { totalProducts: count }
    );
    
    // 商品の詳細チェック
    if (hasProducts && data && data[0]) {
      const product = data[0];
      const hasRequiredFields = !!(
        product.title && 
        product.price && 
        product.image_url && 
        product.affiliate_url
      );
      
      await addResult('商品データの完全性', hasRequiredFields,
        hasRequiredFields ? undefined : '商品データに必須フィールドが不足',
        { 
          title: product.title ? '✓' : '✗',
          price: product.price ? '✓' : '✗',
          image_url: product.image_url ? '✓' : '✗',
          affiliate_url: product.affiliate_url ? '✓' : '✗'
        }
      );
    }
  } catch (error) {
    await addResult('商品データの存在', false, error.message);
  }
}

// 3. 画像URLのアクセシビリティ確認
async function testImageAccessibility() {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('title, image_url')
      .not('image_url', 'is', null)
      .limit(3);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      await addResult('画像URLテスト', false, '画像URLを持つ商品がありません');
      return;
    }
    
    let accessibleCount = 0;
    const imageTests = [];
    
    // Node.jsのfetch APIを使用
    const fetch = require('node-fetch');
    
    for (const product of data) {
      try {
        const response = await fetch(product.image_url, { 
          method: 'HEAD',
          timeout: 5000 
        });
        const isAccessible = response.ok;
        if (isAccessible) accessibleCount++;
        
        imageTests.push({
          title: product.title.substring(0, 30),
          accessible: isAccessible,
          status: response.status
        });
      } catch (error) {
        imageTests.push({
          title: product.title.substring(0, 30),
          accessible: false,
          error: 'Network error'
        });
      }
    }
    
    const allAccessible = accessibleCount === data.length;
    await addResult('画像URLアクセシビリティ', allAccessible,
      allAccessible ? undefined : `${data.length}件中${accessibleCount}件のみアクセス可能`,
      { imageTests }
    );
  } catch (error) {
    await addResult('画像URLテスト', false, error.message);
  }
}

// 4. 認証フローテスト
async function testAuthFlow() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      await addResult('認証フロー', true, undefined, { 
        userLoggedIn: true,
        userId: sessionData.session.user.id 
      });
    } else {
      await addResult('認証フロー', true, undefined, { 
        userLoggedIn: false,
        readyForOnboarding: true 
      });
    }
  } catch (error) {
    await addResult('認証フロー', false, error.message);
  }
}

// 5. カテゴリ/フィルター機能テスト
async function testFilteringCapability() {
  try {
    // 性別フィルターテスト
    const genders = ['male', 'female', 'unisex'];
    const genderTests = [];
    
    for (const gender of genders) {
      const { count, error } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('gender', gender);
      
      if (error) throw error;
      
      genderTests.push({
        gender,
        count: count || 0
      });
    }
    
    // カテゴリフィルターテスト
    const { data: categories, error: catError } = await supabase
      .from('external_products')
      .select('category')
      .not('category', 'is', null)
      .limit(100);
    
    if (catError) throw catError;
    
    const uniqueCategories = categories ? [...new Set(categories.map(c => c.category))] : [];
    
    await addResult('フィルター機能', true, undefined, {
      genderDistribution: genderTests,
      uniqueCategories: uniqueCategories.length,
      sampleCategories: uniqueCategories.slice(0, 5)
    });
  } catch (error) {
    await addResult('フィルター機能', false, error.message);
  }
}

// 6. スワイプ機能準備状態テスト
async function testSwipeReadiness() {
  try {
    const minProductsForSwipe = 20;
    const { count, error } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'is', null)
      .not('title', 'is', null)
      .not('price', 'is', null);
    
    if (error) throw error;
    
    const hasEnoughProducts = count && count >= minProductsForSwipe;
    
    await addResult('スワイプ機能準備状態', hasEnoughProducts,
      hasEnoughProducts ? undefined : `商品数が不足 (${count}/${minProductsForSwipe})`,
      { 
        availableProducts: count,
        minimumRequired: minProductsForSwipe 
      }
    );
  } catch (error) {
    await addResult('スワイプ機能準備状態', false, error.message);
  }
}

// 7. 推薦アルゴリズム準備テスト
async function testRecommendationReadiness() {
  try {
    // タグ情報の確認
    const { data: tagsData, error: tagsError } = await supabase
      .from('external_products')
      .select('style_tags, color_tags, category_tags')
      .not('style_tags', 'is', null)
      .limit(10);
    
    if (tagsError) throw tagsError;
    
    const hasTagData = tagsData && tagsData.length > 0;
    
    // スワイプ履歴テーブルの確認
    const { error: swipeError } = await supabase
      .from('swipes')
      .select('id')
      .limit(1);
    
    const swipeTableReady = !swipeError;
    
    await addResult('推薦システム準備状態', hasTagData && swipeTableReady,
      undefined,
      { 
        hasTagData,
        swipeTableReady,
        sampleTagsCount: tagsData ? tagsData.length : 0
      }
    );
  } catch (error) {
    await addResult('推薦システム準備状態', false, error.message);
  }
}

// 8. パフォーマンステスト
async function testPerformance() {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .limit(20);
    
    const queryTime = Date.now() - startTime;
    
    if (error) throw error;
    
    const isAcceptable = queryTime < 2000;
    
    await addResult('パフォーマンス', isAcceptable,
      isAcceptable ? undefined : `クエリ時間が遅い: ${queryTime}ms`,
      { 
        queryTime: `${queryTime}ms`,
        productsFetched: data?.length || 0
      }
    );
  } catch (error) {
    await addResult('パフォーマンス', false, error.message);
  }
}

// メインテスト実行
async function runUserExperienceTests() {
  console.log('🧪 ユーザー体験テストを開始します...\n');
  console.log('='.repeat(60));
  
  await testSupabaseConnection();
  await testProductAvailability();
  await testImageAccessibility();
  await testAuthFlow();
  await testFilteringCapability();
  await testSwipeReadiness();
  await testRecommendationReadiness();
  await testPerformance();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 テスト結果サマリー:\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ 成功: ${passed}件`);
  console.log(`❌ 失敗: ${failed}件`);
  console.log(`📈 成功率: ${Math.round((passed / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  修正が必要な項目:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.testName}: ${r.error || '詳細は上記を確認'}`);
    });
  } else {
    console.log('\n🎉 すべてのテストに合格しました！');
  }
  
  // 重要な警告
  if (results.find(r => r.testName === '商品データの存在' && !r.passed)) {
    console.log('\n🚨 重要: 商品データがありません。アプリが正常に動作しません。');
    console.log('   対処法: 商品データをSupabaseに追加してください。');
  }
  
  if (results.find(r => r.testName === '画像URLアクセシビリティ' && !r.passed)) {
    console.log('\n⚠️  警告: 一部の画像にアクセスできません。');
    console.log('   対処法: 画像URLを修正してください。');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// 実行
runUserExperienceTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
  process.exit(1);
});
