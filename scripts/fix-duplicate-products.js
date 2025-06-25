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

async function fixDuplicateProducts() {
  console.log('🔧 商品の重複問題を修正します...\n');

  try {
    // 1. すべてのアクティブな商品を取得
    console.log('1. アクティブな商品を取得中...');
    const { data: allProducts, error: productsError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }); // 新しい順にソート

    if (productsError) {
      console.error('商品の取得エラー:', productsError);
      return;
    }

    console.log(`取得した商品数: ${allProducts.length}`);

    // 2. タイトルの正規化関数
    const normalizeTitle = (title) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ') // 複数の空白を単一の空白に
        .replace(/[【】\[\]（）\(\)]/g, ''); // 括弧類を削除
    };

    // 3. タイトルでグループ化（正規化後）
    const titleGroups = {};
    allProducts.forEach(product => {
      const key = normalizeTitle(product.title);
      if (!titleGroups[key]) {
        titleGroups[key] = [];
      }
      titleGroups[key].push(product);
    });

    // 4. 重複している商品を特定
    const duplicates = Object.entries(titleGroups)
      .filter(([title, products]) => products.length > 1);

    console.log(`\n重複しているタイトル数: ${duplicates.length}`);

    if (duplicates.length === 0) {
      console.log('重複商品はありません。');
      return;
    }

    // 5. 削除対象のIDを収集
    const idsToDelete = [];
    const keepIds = [];
    let duplicateAnalysis = [];

    duplicates.forEach(([normalizedTitle, products]) => {
      // 価格がある商品を優先
      const withPrice = products.filter(p => p.price != null && p.price > 0);
      const withoutPrice = products.filter(p => p.price == null || p.price === 0);

      let toKeep;
      if (withPrice.length > 0) {
        // 価格がある商品の中で最も新しいものを残す
        toKeep = withPrice.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      } else {
        // 価格がない場合は最も新しいものを残す
        toKeep = products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      }

      keepIds.push(toKeep.id);

      // 分析用のデータを収集
      duplicateAnalysis.push({
        title: products[0].title,
        normalizedTitle,
        totalCount: products.length,
        withPriceCount: withPrice.length,
        withoutPriceCount: withoutPrice.length,
        keptProduct: {
          id: toKeep.id,
          title: toKeep.title,
          price: toKeep.price,
          brand: toKeep.brand
        }
      });

      // 残りは削除対象
      products.forEach(product => {
        if (product.id !== toKeep.id) {
          idsToDelete.push(product.id);
        }
      });
    });

    console.log(`\n削除対象の商品数: ${idsToDelete.length}`);
    console.log(`保持する商品数: ${keepIds.length}`);

    // 6. 重複パターンの詳細を表示
    console.log('\n重複パターンの分析（価格の有無による）:');
    const pricePatterns = duplicateAnalysis.filter(d => d.withPriceCount > 0 && d.withoutPriceCount > 0);
    console.log(`価格ありと価格なしが混在: ${pricePatterns.length} タイトル`);
    
    if (pricePatterns.length > 0) {
      console.log('\n例（最初の5件）:');
      pricePatterns.slice(0, 5).forEach(pattern => {
        console.log(`\n"${pattern.title}"`);
        console.log(`  重複数: ${pattern.totalCount} (価格あり: ${pattern.withPriceCount}, 価格なし: ${pattern.withoutPriceCount})`);
        console.log(`  保持: ID ${pattern.keptProduct.id} (価格: ${pattern.keptProduct.price || 'なし'})`);
      });
    }

    // 7. 削除実行の確認
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

    // 8. 結果の確認
    const { count: remainingCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\nアクティブな商品数: ${remainingCount}`);

    // 9. 重複が解決されたか確認
    console.log('\n重複が解決されたか確認中...');
    const { data: checkProducts } = await supabase
      .from('external_products')
      .select('id, title')
      .eq('is_active', true);

    const checkTitleGroups = {};
    checkProducts.forEach(product => {
      const key = normalizeTitle(product.title);
      if (!checkTitleGroups[key]) {
        checkTitleGroups[key] = [];
      }
      checkTitleGroups[key].push(product);
    });

    const remainingDuplicates = Object.entries(checkTitleGroups)
      .filter(([title, products]) => products.length > 1);

    if (remainingDuplicates.length === 0) {
      console.log('✅ すべての重複が解決されました！');
    } else {
      console.log(`⚠️ まだ ${remainingDuplicates.length} 件の重複が残っています`);
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
fixDuplicateProducts();
