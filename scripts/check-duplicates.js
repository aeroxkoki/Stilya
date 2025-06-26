/**
 * 商品データベースの重複チェックスクリプト
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
  console.log('商品データベースの重複をチェック中...\n');
  
  try {
    // 1. 同じタイトルの商品を確認
    const { data: allProducts, error: fetchError } = await supabase
      .from('external_products')
      .select('id, title, brand, price, created_at')
      .eq('is_active', true)
      .order('title');
    
    if (fetchError) {
      console.error('エラー:', fetchError);
      return;
    }
    
    console.log(`総商品数: ${allProducts.length}\n`);
    
    // タイトルでグループ化
    const titleGroups = {};
    allProducts.forEach(product => {
      const normalizedTitle = product.title.toLowerCase().trim();
      if (!titleGroups[normalizedTitle]) {
        titleGroups[normalizedTitle] = [];
      }
      titleGroups[normalizedTitle].push(product);
    });
    
    // 重複を検出
    const duplicates = Object.entries(titleGroups)
      .filter(([title, products]) => products.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
    
    console.log(`重複タイトル数: ${duplicates.length}\n`);
    
    // 上位10件の重複を表示
    console.log('最も重複が多い商品（上位10件）:');
    console.log('='.repeat(80));
    
    duplicates.slice(0, 10).forEach(([title, products]) => {
      console.log(`\nタイトル: "${products[0].title}"`);
      console.log(`重複数: ${products.length}件`);
      console.log('詳細:');
      products.forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p.id}`);
        console.log(`     ブランド: ${p.brand || 'N/A'}`);
        console.log(`     価格: ¥${p.price || 'N/A'}`);
        console.log(`     作成日: ${new Date(p.created_at).toLocaleString('ja-JP')}`);
      });
    });
    
    // 2. ID重複の確認
    console.log('\n' + '='.repeat(80));
    console.log('ID重複チェック:');
    
    const idCount = {};
    allProducts.forEach(product => {
      idCount[product.id] = (idCount[product.id] || 0) + 1;
    });
    
    const duplicateIds = Object.entries(idCount)
      .filter(([id, count]) => count > 1);
    
    if (duplicateIds.length > 0) {
      console.log(`\n⚠️  ID重複が検出されました: ${duplicateIds.length}件`);
      duplicateIds.forEach(([id, count]) => {
        console.log(`  ID: ${id} (${count}回)`);
      });
    } else {
      console.log('\n✅ ID重複はありません');
    }
    
    // 3. 統計情報
    console.log('\n' + '='.repeat(80));
    console.log('統計情報:');
    console.log(`- ユニークなタイトル数: ${Object.keys(titleGroups).length}`);
    console.log(`- 重複を含む総商品数: ${allProducts.length}`);
    console.log(`- 重複率: ${((1 - Object.keys(titleGroups).length / allProducts.length) * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

// スクリプトを実行
checkDuplicates();
