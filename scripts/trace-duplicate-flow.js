const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数を読み込む
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function traceFetchMixedProducts() {
  console.log('🔍 fetchMixedProducts の商品取得フローをトレースします...\n');

  try {
    // テスト用のパラメータ
    const userId = null; // ゲストユーザーとしてテスト
    const limit = 20;
    const offset = 0;
    const filters = { includeUsed: false }; // 新品のみ

    console.log('パラメータ:', { userId, limit, offset, filters });

    // 1. ランダム商品の取得をシミュレート
    console.log('\n1. ランダム商品の取得...');
    const randomCount = Math.floor(limit * 0.7 * 1.5); // 21個
    
    const { data: randomProducts, error: randomError } = await supabase
      .from('external_products')
      .select('id, title, price, brand')
      .eq('is_active', true)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(randomCount);

    if (randomError) {
      console.error('ランダム商品取得エラー:', randomError);
      return;
    }

    console.log(`ランダム商品数: ${randomProducts.length}`);
    
    // IDの重複チェック
    const randomIds = randomProducts.map(p => p.id);
    const uniqueRandomIds = new Set(randomIds);
    if (randomIds.length !== uniqueRandomIds.size) {
      console.error('⚠️ ランダム商品内でID重複あり！');
    }

    // 2. パーソナライズ商品の取得をシミュレート
    console.log('\n2. パーソナライズ商品の取得...');
    const personalizedCount = Math.floor(limit * 0.3 * 1.5); // 9個
    
    const { data: personalizedProducts, error: personalizedError } = await supabase
      .from('external_products')
      .select('id, title, price, brand')
      .eq('is_active', true)
      .eq('is_used', false)
      .order('priority', { ascending: true })
      .limit(personalizedCount);

    if (personalizedError) {
      console.error('パーソナライズ商品取得エラー:', personalizedError);
      return;
    }

    console.log(`パーソナライズ商品数: ${personalizedProducts.length}`);

    // 3. 商品のマージプロセスをシミュレート
    console.log('\n3. 商品のマージと重複除去...');
    
    const allProducts = [...randomProducts, ...personalizedProducts];
    console.log(`マージ前の総商品数: ${allProducts.length}`);

    // ID重複をチェック
    const idCount = {};
    const titleCount = {};
    
    allProducts.forEach(product => {
      idCount[product.id] = (idCount[product.id] || 0) + 1;
      const normalizedTitle = product.title.toLowerCase().trim();
      titleCount[normalizedTitle] = (titleCount[normalizedTitle] || 0) + 1;
    });

    // 重複を表示
    console.log('\nID重複:');
    Object.entries(idCount)
      .filter(([id, count]) => count > 1)
      .forEach(([id, count]) => {
        const products = allProducts.filter(p => p.id === id);
        console.log(`  ID: ${id} (${count}回)`);
        products.forEach(p => {
          console.log(`    - ${p.title} (${p.brand}, ¥${p.price || 'null'})`);
        });
      });

    console.log('\nタイトル重複:');
    Object.entries(titleCount)
      .filter(([title, count]) => count > 1)
      .forEach(([title, count]) => {
        const products = allProducts.filter(p => p.title.toLowerCase().trim() === title);
        console.log(`  タイトル: "${title}" (${count}回)`);
        products.forEach(p => {
          console.log(`    - ID: ${p.id} (${p.brand}, ¥${p.price || 'null'})`);
        });
      });

    // 4. 重複除去後の結果
    const uniqueById = new Map();
    const uniqueByTitle = new Map();
    const finalProducts = [];

    allProducts.forEach(product => {
      const normalizedTitle = product.title.toLowerCase().trim();
      
      if (!uniqueById.has(product.id) && !uniqueByTitle.has(normalizedTitle)) {
        uniqueById.set(product.id, true);
        uniqueByTitle.set(normalizedTitle, true);
        finalProducts.push(product);
      }
    });

    console.log(`\n重複除去後の商品数: ${finalProducts.length}`);
    console.log(`削除された商品数: ${allProducts.length - finalProducts.length}`);

    // 5. 問題の特定
    if (allProducts.length - finalProducts.length > 0) {
      console.log('\n\n🔴 問題が発見されました:');
      console.log('fetchRandomizedProducts と fetchPersonalizedProducts が同じ商品を返している可能性があります。');
      console.log('これは、両方の関数が同じ商品プールから取得しているために発生しています。');
      
      console.log('\n推奨される解決策:');
      console.log('1. fetchRandomizedProducts で取得した商品IDを除外してfetchPersonalizedProductsを呼ぶ');
      console.log('2. または、最初から重複しない商品セットを取得するロジックに変更');
      console.log('3. データベースレベルでランダム性を確保（TABLESAMPLE や RANDOM()）');
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
traceFetchMixedProducts();
