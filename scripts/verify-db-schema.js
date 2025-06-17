#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyDatabaseSchema() {
  console.log('🔍 Verifying external_products table schema...\n');
  
  try {
    // 1. テーブルの存在確認とサンプルデータ取得
    const { data: sampleData, error: sampleError } = await supabase
      .from('external_products')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error accessing external_products table:', sampleError.message);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ external_products table exists');
      console.log('\n📋 Table columns:');
      const columns = Object.keys(sampleData[0]);
      columns.forEach(col => console.log(`  - ${col}`));
      
      // categoryフィールドの確認
      if (columns.includes('category')) {
        console.log('\n✅ category field exists');
      } else {
        console.log('\n❌ category field NOT found');
      }
      
      // 2. カテゴリー別の商品数を確認
      const { data: categoryStats, error: statsError } = await supabase
        .from('external_products')
        .select('category')
        .eq('is_active', true);
      
      if (!statsError && categoryStats) {
        const categoryCounts = {};
        categoryStats.forEach(item => {
          const cat = item.category || 'NULL';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        
        console.log('\n📊 Category distribution:');
        Object.entries(categoryCounts).forEach(([cat, count]) => {
          console.log(`  - ${cat}: ${count} products`);
        });
      }
      
      // 3. フィルタリングテスト
      console.log('\n🧪 Testing filter queries...');
      
      // カテゴリーフィルター
      const testCategories = ['tops', 'bottoms', 'メンズファッション', 'レディースファッション'];
      for (const cat of testCategories) {
        const { data, error } = await supabase
          .from('external_products')
          .select('id, title, category')
          .eq('category', cat)
          .eq('is_active', true)
          .limit(3);
        
        if (!error) {
          console.log(`\n  Category filter "${cat}": ${data.length} products found`);
          if (data.length > 0) {
            console.log(`    Sample: ${data[0].title}`);
          }
        }
      }
      
      // 価格フィルター
      const { data: priceData, error: priceError } = await supabase
        .from('external_products')
        .select('id, title, price')
        .gte('price', 3000)
        .lte('price', 10000)
        .eq('is_active', true)
        .limit(5);
      
      if (!priceError) {
        console.log(`\n  Price filter (3000-10000): ${priceData.length} products found`);
      }
      
      // タグフィルター（配列内検索）
      const testTags = ['カジュアル', 'フォーマル'];
      for (const tag of testTags) {
        const { data, error } = await supabase
          .from('external_products')
          .select('id, title, tags')
          .contains('tags', [tag])
          .eq('is_active', true)
          .limit(3);
        
        if (!error) {
          console.log(`\n  Tag filter "${tag}": ${data.length} products found`);
        }
      }
      
    } else {
      console.log('⚠️  No data found in external_products table');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
verifyDatabaseSchema();
