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

async function removeDuplicateProducts() {
  console.log('🧹 商品の重複削除処理を開始します...\n');

  try {
    // 1. すべての商品を取得
    console.log('1. アクティブな商品を取得中...');
    const { data: allProducts, error: productsError } = await supabase
      .from('external_products')
      .select('id, title, price, brand, image_url, tags, is_used, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true }); // 古い順にソート

    if (productsError) {
      console.error('商品の取得エラー:', productsError);
      return;
    }

    console.log(`取得した商品数: ${allProducts.length}`);

    // 2. タイトルでグループ化
    const titleGroups = {};
    allProducts.forEach(product => {
      const key = product.title.toLowerCase().trim();
      if (!titleGroups[key]) {
        titleGroups[key] = [];
      }
      titleGroups[key].push(product);
    });

    // 3. 重複している商品を特定
    const duplicates = Object.entries(titleGroups)
      .filter(([title, products]) => products.length > 1);

    console.log(`\n重複しているタイトル数: ${duplicates.length}`);

    if (duplicates.length === 0) {
      console.log('重複商品はありません。');
      return;
    }

    // 4. 削除対象のIDを収集
    const idsToDelete = [];
    const keepIds = [];

    duplicates.forEach(([title, products]) => {
      // 価格がある商品を優先
      const withPrice = products.filter(p => p.price != null);
      const withoutPrice = products.filter(p => p.price == null);

      let toKeep;
      if (withPrice.length > 0) {
        // 価格がある商品の中で最も新しいものを残す
        toKeep = withPrice.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      } else {
        // 価格がない場合は最も新しいものを残す
        toKeep = products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      }

      keepIds.push(toKeep.id);

      // 残りは削除対象
      products.forEach(product => {
        if (product.id !== toKeep.id) {
          idsToDelete.push(product.id);
        }
      });
    });

    console.log(`\n削除対象の商品数: ${idsToDelete.length}`);
    console.log(`保持する商品数: ${keepIds.length}`);

    // 5. 確認のために最初の5件を表示
    console.log('\n削除対象の商品例（最初の5件）:');
    const firstFiveToDelete = idsToDelete.slice(0, 5);
    for (const id of firstFiveToDelete) {
      const product = allProducts.find(p => p.id === id);
      if (product) {
        console.log(`  - ${product.title} (ID: ${id}, 価格: ${product.price || 'なし'})`);
      }
    }

    // 6. 削除実行
    console.log('\n削除を実行しています...');
    
    // バッチ処理（100件ずつ）
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabase
        .from('external_products')
        .update({ is_active: false }) // 物理削除ではなく論理削除
        .in('id', batch);

      if (deleteError) {
        console.error(`バッチ削除エラー (${i}-${i + batch.length}):`, deleteError);
      } else {
        deletedCount += batch.length;
        console.log(`進捗: ${deletedCount}/${idsToDelete.length} 件を無効化しました`);
      }
    }

    console.log(`\n✅ 処理完了: ${deletedCount} 件の重複商品を無効化しました`);

    // 7. 結果の確認
    const { count: remainingCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\nアクティブな商品数: ${remainingCount}`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
removeDuplicateProducts();
