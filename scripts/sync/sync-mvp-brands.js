#!/usr/bin/env node
/**
 * MVPブランド戦略に基づいた楽天商品同期スクリプト
 * 特定のブランドのみから商品を取得
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const rakutenAppId = process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;

if (!supabaseUrl || !supabaseKey || !rakutenAppId || !rakutenAffiliateId) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MVP優先ブランドリスト
const MVP_BRANDS = [
  { 
    name: 'UNIQLO',
    shopCode: 'uniqlo',
    priority: 1,
    tags: ['ベーシック', 'シンプル', '機能的'],
    maxProducts: 50
  },
  { 
    name: 'GU',
    shopCode: 'gu-official', 
    priority: 1,
    tags: ['トレンド', 'プチプラ', 'カジュアル'],
    maxProducts: 50
  },
  { 
    name: 'coca',
    keywords: ['coca コカ'],
    priority: 2,
    tags: ['ナチュラル', 'カジュアル', 'リラックス'],
    maxProducts: 30
  },
  { 
    name: 'pierrot',
    keywords: ['pierrot ピエロ'],
    priority: 2,
    tags: ['大人カジュアル', 'きれいめ', 'オフィス'],
    maxProducts: 30
  },
  { 
    name: 'URBAN RESEARCH',
    keywords: ['URBAN RESEARCH アーバンリサーチ'],
    priority: 3,
    tags: ['都会的', 'セレクト', 'カジュアル'],
    maxProducts: 20
  }
];

// レート制限対策
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ブランド別に楽天APIから商品データを取得
 */
async function fetchBrandProducts(brand, page = 1) {
  const url = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
  const params = {
    applicationId: rakutenAppId,
    affiliateId: rakutenAffiliateId,
    hits: 30,
    page: page,
    sort: '-updateTimestamp', // 新着順
    imageFlag: 1, // 画像ありのみ
    genreId: '100371', // 女性ファッション
    format: 'json'
  };

  // ショップコードがある場合
  if (brand.shopCode) {
    params.shopCode = brand.shopCode;
  } 
  // キーワード検索の場合
  else if (brand.keywords) {
    params.keyword = brand.keywords.join(' ');
  }

  try {
    console.log(`🔍 ${brand.name} の商品を検索中...`);
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`❌ ${brand.name} API エラー:`, error.response?.data || error.message);
    return null;
  }
}

// 高精度タグ抽出モジュールをインポート
const { extractEnhancedTags } = require('./enhanced-tag-extractor');

/**
 * 商品データを整形してSupabaseに保存
 */
async function saveProducts(products, brand) {
  console.log(`📦 ${brand.name} の ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    
    // ブランド固有のタグを追加
    const extractedTags = extractEnhancedTags(product);
    const combinedTags = [...new Set([...extractedTags, ...brand.tags])];
    
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: product.mediumImageUrls[0]?.imageUrl || '',
      brand: brand.name,
      price: product.itemPrice,
      tags: combinedTags.slice(0, 15), // 最大15個
      category: '100371',
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      source_brand: brand.name.toLowerCase().replace(/\s+/g, '_'),
      is_active: true,
      priority: brand.priority, // MVPブランドの優先度
      last_synced: new Date().toISOString(),
      // Phase 2用の追加フィールド
      shop_name: product.shopName || brand.name,
      review_count: product.reviewCount || 0,
      review_average: product.reviewAverage || 0,
      item_update_timestamp: product.itemUpdateTimestamp || new Date().toISOString(),
      is_seasonal: combinedTags.some(tag => 
        ['春', '夏', '秋', '冬', '春夏', '秋冬'].includes(tag)
      )
    };
  });

  try {
    // 既存の商品をチェック
    const existingIds = productsToInsert.map(p => p.id);
    const { data: existing } = await supabase
      .from('external_products')
      .select('id')
      .in('id', existingIds);

    const existingIdSet = new Set(existing?.map(p => p.id) || []);
    const newProducts = productsToInsert.filter(p => !existingIdSet.has(p.id));
    const updateProducts = productsToInsert.filter(p => existingIdSet.has(p.id));

    // 新規商品を挿入
    if (newProducts.length > 0) {
      const { error: insertError } = await supabase
        .from('external_products')
        .insert(newProducts);

      if (insertError) {
        console.error(`❌ ${brand.name} 挿入エラー:`, insertError);
      } else {
        console.log(`✅ ${brand.name}: ${newProducts.length}件の新規商品を追加`);
      }
    }

    // 既存商品を更新
    if (updateProducts.length > 0) {
      // バッチ更新（パフォーマンス向上）
      const updatePromises = updateProducts.map(product => 
        supabase
          .from('external_products')
          .update({
            title: product.title,
            price: product.price,
            tags: product.tags,
            priority: product.priority,
            is_active: true,
            last_synced: product.last_synced,
            // Phase 2用の追加フィールド
            shop_name: product.shop_name,
            review_count: product.review_count,
            review_average: product.review_average,
            item_update_timestamp: product.item_update_timestamp,
            is_seasonal: product.is_seasonal
          })
          .eq('id', product.id)
      );

      await Promise.all(updatePromises);
      console.log(`✅ ${brand.name}: ${updateProducts.length}件の既存商品を更新`);
    }

    return { new: newProducts.length, updated: updateProducts.length };

  } catch (error) {
    console.error(`❌ ${brand.name} 保存エラー:`, error);
    return { new: 0, updated: 0 };
  }
}

/**
 * 古い商品データの無効化
 */
async function deactivateOldProducts() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const { error } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .lt('last_synced', threeDaysAgo.toISOString())
      .eq('source', 'rakuten');

    if (error) {
      console.error('❌ 古い商品の無効化エラー:', error);
    } else {
      console.log('✅ 3日以上更新されていない商品を無効化しました');
    }
  } catch (error) {
    console.error('❌ 無効化処理エラー:', error);
  }
}

/**
 * 統計情報の表示
 */
async function showStatistics() {
  try {
    // ブランド別の商品数を取得
    const { data: brandStats } = await supabase
      .from('external_products')
      .select('source_brand')
      .eq('is_active', true);

    const brandCounts = {};
    brandStats?.forEach(item => {
      const brand = item.source_brand || 'unknown';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    console.log('\n📊 ブランド別商品数:');
    Object.entries(brandCounts).forEach(([brand, count]) => {
      console.log(`   - ${brand}: ${count}件`);
    });

    // 全体の商品数
    const { count: totalActive } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\n✨ アクティブな商品総数: ${totalActive}件`);

  } catch (error) {
    console.error('❌ 統計情報取得エラー:', error);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('\n🚀 MVP戦略に基づく楽天商品同期を開始します...\n');
  console.log('📋 対象ブランド:', MVP_BRANDS.map(b => b.name).join(', '));
  console.log('');

  const syncResults = {
    totalNew: 0,
    totalUpdated: 0,
    brandResults: []
  };

  try {
    // 優先度順にブランドを処理
    const sortedBrands = MVP_BRANDS.sort((a, b) => a.priority - b.priority);

    for (const brand of sortedBrands) {
      console.log(`\n🏷️  ${brand.name} の処理を開始...`);
      
      let allProducts = [];
      const maxPages = Math.ceil(brand.maxProducts / 30);
      
      // 複数ページから商品を取得
      for (let page = 1; page <= maxPages && allProducts.length < brand.maxProducts; page++) {
        const data = await fetchBrandProducts(brand, page);
        
        if (data?.Items && data.Items.length > 0) {
          allProducts = allProducts.concat(data.Items);
          console.log(`  📄 ページ ${page}: ${data.Items.length}件取得`);
          
          // レート制限対策
          if (page < maxPages) {
            await sleep(1500); // 1.5秒待機
          }
        } else {
          break; // 商品がない場合は終了
        }
      }

      // 最大商品数に制限
      allProducts = allProducts.slice(0, brand.maxProducts);

      if (allProducts.length > 0) {
        const result = await saveProducts(allProducts, brand);
        syncResults.totalNew += result.new;
        syncResults.totalUpdated += result.updated;
        syncResults.brandResults.push({
          brand: brand.name,
          ...result
        });
      }

      // ブランド間の待機
      await sleep(2000);
    }

    // 古い商品の無効化
    await deactivateOldProducts();

    // 結果サマリー
    console.log('\n📈 同期結果サマリー:');
    console.log(`  新規追加: ${syncResults.totalNew}件`);
    console.log(`  更新: ${syncResults.totalUpdated}件`);
    console.log('\n📊 ブランド別詳細:');
    syncResults.brandResults.forEach(result => {
      console.log(`  ${result.brand}: 新規 ${result.new}件, 更新 ${result.updated}件`);
    });

    // 統計情報表示
    await showStatistics();

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// アルゴリズム改善提案を表示
function showAlgorithmSuggestions() {
  console.log('\n💡 アルゴリズム改善提案:');
  console.log('1. 商品スコアリング導入:');
  console.log('   - レビュー数、評価、販売数を基にスコア計算');
  console.log('   - 人気商品を優先的に表示');
  console.log('');
  console.log('2. パーソナライゼーション強化:');
  console.log('   - ユーザーのスワイプ履歴からブランド嗜好を学習');
  console.log('   - 好みのブランドの商品を優先表示');
  console.log('');
  console.log('3. 季節性の考慮:');
  console.log('   - 現在の季節に合った商品タグを優先');
  console.log('   - 季節外れ商品の表示優先度を下げる');
  console.log('');
  console.log('4. 価格帯最適化:');
  console.log('   - ユーザーの購買履歴から適正価格帯を推定');
  console.log('   - 価格帯別の商品バランスを調整');
}

// 実行
main().then(() => {
  showAlgorithmSuggestions();
  console.log('\n✨ すべての処理が完了しました');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ 予期しないエラー:', error);
  process.exit(1);
});