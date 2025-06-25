const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

async function debugDuplicateProducts() {
  console.log('🔍 商品重複問題のデバッグを開始します...\n');

  try {
    // 1. 重複商品の確認（タイトルベース）
    console.log('1. タイトルが重複している商品を確認中...');
    const { data: allProducts, error: productsError } = await supabase
      .from('external_products')
      .select('id, title, price, brand, image_url, tags, is_used')
      .eq('is_active', true)
      .order('title');

    if (productsError) {
      console.error('商品の取得エラー:', productsError);
      return;
    }

    // タイトルでグループ化
    const titleGroups = {};
    allProducts.forEach(product => {
      const key = product.title.toLowerCase().trim();
      if (!titleGroups[key]) {
        titleGroups[key] = [];
      }
      titleGroups[key].push(product);
    });

    // 重複しているタイトルを抽出
    const duplicates = Object.entries(titleGroups)
      .filter(([title, products]) => products.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    console.log(`\n重複商品数: ${duplicates.length} タイトル`);
    
    if (duplicates.length > 0) {
      console.log('\n重複商品の詳細（上位10件）:');
      duplicates.slice(0, 10).forEach(([title, products]) => {
        console.log(`\n📦 "${products[0].title}" (${products.length}個の重複)`);
        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ID: ${product.id}`);
          console.log(`     価格: ${product.price ? `¥${product.price.toLocaleString()}` : '価格なし'}`);
          console.log(`     ブランド: ${product.brand || 'ブランドなし'}`);
          console.log(`     中古: ${product.is_used ? 'はい' : 'いいえ'}`);
          console.log(`     タグ: ${product.tags?.join(', ') || 'タグなし'}`);
        });
      });
    }

    // 2. 価格情報の有無による重複確認
    console.log('\n\n2. 価格情報の有無による重複パターンを確認中...');
    const pricePatterns = duplicates.filter(([title, products]) => {
      const hasPriceCount = products.filter(p => p.price != null).length;
      const noPriceCount = products.filter(p => p.price == null).length;
      return hasPriceCount > 0 && noPriceCount > 0;
    });

    if (pricePatterns.length > 0) {
      console.log(`\n価格情報の有無で重複している商品: ${pricePatterns.length} タイトル`);
      console.log('（同じ商品で価格ありと価格なしの両方が存在）');
      
      pricePatterns.slice(0, 5).forEach(([title, products]) => {
        console.log(`\n"${products[0].title}"`);
        const withPrice = products.filter(p => p.price != null);
        const withoutPrice = products.filter(p => p.price == null);
        console.log(`  価格あり: ${withPrice.length}個 - IDs: ${withPrice.map(p => p.id).join(', ')}`);
        console.log(`  価格なし: ${withoutPrice.length}個 - IDs: ${withoutPrice.map(p => p.id).join(', ')}`);
      });
    }

    // 3. 画像URLによる重複確認
    console.log('\n\n3. 同じ画像URLを持つ商品を確認中...');
    const imageGroups = {};
    allProducts.forEach(product => {
      if (product.image_url) {
        if (!imageGroups[product.image_url]) {
          imageGroups[product.image_url] = [];
        }
        imageGroups[product.image_url].push(product);
      }
    });

    const imageDuplicates = Object.entries(imageGroups)
      .filter(([url, products]) => products.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    console.log(`\n同じ画像URLを持つ商品グループ: ${imageDuplicates.length}`);
    
    if (imageDuplicates.length > 0) {
      console.log('\n同じ画像を使っている商品（上位5件）:');
      imageDuplicates.slice(0, 5).forEach(([url, products]) => {
        console.log(`\n画像URL: ${url.substring(0, 50)}...`);
        console.log(`商品数: ${products.length}`);
        products.slice(0, 3).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.title} (ID: ${product.id}, 価格: ${product.price || 'なし'})`);
        });
      });
    }

    // 4. 最近追加された商品の重複チェック
    console.log('\n\n4. 最近追加された商品の重複状況を確認中...');
    const { data: recentProducts, error: recentError } = await supabase
      .from('external_products')
      .select('id, title, price, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!recentError && recentProducts) {
      const recentTitles = {};
      recentProducts.forEach(product => {
        const key = product.title.toLowerCase().trim();
        if (!recentTitles[key]) {
          recentTitles[key] = 0;
        }
        recentTitles[key]++;
      });

      const recentDuplicates = Object.entries(recentTitles)
        .filter(([title, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);

      if (recentDuplicates.length > 0) {
        console.log(`\n最近の100商品中の重複: ${recentDuplicates.length} タイトル`);
        recentDuplicates.slice(0, 5).forEach(([title, count]) => {
          console.log(`  "${title}": ${count}回`);
        });
      }
    }

    // 5. 解決策の提案
    console.log('\n\n📋 解決策の提案:');
    console.log('1. 価格情報がない商品を削除または非アクティブ化');
    console.log('2. 同じタイトルの商品をマージ（価格がある方を優先）');
    console.log('3. 商品インポート時の重複チェック強化');
    console.log('4. スワイプ画面での重複フィルタリング強化');

    // 重複商品IDのリストを出力
    const duplicateIds = new Set();
    duplicates.forEach(([title, products]) => {
      // 価格がある商品を優先、なければ最初の商品を残す
      const withPrice = products.filter(p => p.price != null);
      const toKeep = withPrice.length > 0 ? withPrice[0] : products[0];
      
      products.forEach(product => {
        if (product.id !== toKeep.id) {
          duplicateIds.add(product.id);
        }
      });
    });

    if (duplicateIds.size > 0) {
      const duplicateIdsList = Array.from(duplicateIds);
      console.log(`\n\n🗑️ 削除候補の商品ID数: ${duplicateIdsList.length}`);
      
      // ファイルに出力
      const outputPath = path.join(__dirname, 'duplicate-product-ids.json');
      fs.writeFileSync(outputPath, JSON.stringify({
        totalDuplicates: duplicateIdsList.length,
        duplicateIds: duplicateIdsList,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log(`\n削除候補のIDリストを保存しました: ${outputPath}`);
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
debugDuplicateProducts();
