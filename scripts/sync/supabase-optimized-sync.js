#!/usr/bin/env node
/**
 * Supabase無料枠最適化版 - 商品同期スクリプト
 * 最高画質対応 & 容量最適化
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const rakutenAppId = process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;

if (!supabaseUrl || !supabaseKey || !rakutenAppId || !rakutenAffiliateId) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Supabase無料枠最適化設定
const SUPABASE_FREE_TIER = {
  maxDatabaseRows: 40000,       // 500MB制限を考慮（余裕を持って40,000件）
  warningThreshold: 35000,      // 35,000件で警告
  criticalThreshold: 38000,     // 38,000件でクリティカル
  targetActiveProducts: 25000,   // アクティブ商品の目標数
  cleanupBatchSize: 500,        // クリーンアップのバッチサイズ
  apiCallsPerMinute: 30,        // API制限（月2M = 約46/分だが余裕を持って）
};

// 画像品質設定
const IMAGE_QUALITY = {
  preferLarge: true,            // 大サイズ画像を優先
  fallbackToMedium: true,       // 大サイズがない場合は中サイズ
  minimumQuality: 'medium',     // 最低品質
  saveMultipleUrls: true,       // 複数サイズのURLを保存
};

async function checkDatabaseCapacity() {
  console.log('🔍 データベース容量チェック...');
  
  const { count: totalCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });
  
  const { count: activeCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  
  console.log(`  総商品数: ${totalCount?.toLocaleString() || 0}件`);
  console.log(`  アクティブ商品: ${activeCount?.toLocaleString() || 0}件`);
  console.log(`  無料枠上限: ${SUPABASE_FREE_TIER.maxDatabaseRows.toLocaleString()}件`);
  
  // 容量に基づいた判定
  if (totalCount >= SUPABASE_FREE_TIER.criticalThreshold) {
    console.error('❌ データベース容量がクリティカル！');
    return 'critical';
  } else if (totalCount >= SUPABASE_FREE_TIER.warningThreshold) {
    console.warn('⚠️ データベース容量が警告レベル');
    return 'warning';
  }
  
  return 'healthy';
}

async function optimizeForFreeTier() {
  console.log('♻️ 無料枠最適化処理...');
  
  // 1. 古い非アクティブ商品を削除
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: oldProducts } = await supabase
    .from('external_products')
    .select('product_id')
    .eq('is_active', false)
    .lt('last_synced', sevenDaysAgo.toISOString())
    .order('last_synced', { ascending: true })
    .limit(SUPABASE_FREE_TIER.cleanupBatchSize);
  
  if (oldProducts && oldProducts.length > 0) {
    const productIds = oldProducts.map(p => p.product_id);
    await supabase
      .from('external_products')
      .delete()
      .in('product_id', productIds);
    
    console.log(`  ${productIds.length}件の古い商品を削除`);
  }
  
  // 2. 低品質商品の削除（レビューが少なく、スコアが低い）
  const { data: lowQualityProducts } = await supabase
    .from('external_products')
    .select('product_id')
    .lt('recommendation_score', 20)
    .lt('review_count', 5)
    .limit(SUPABASE_FREE_TIER.cleanupBatchSize);
  
  if (lowQualityProducts && lowQualityProducts.length > 0) {
    const productIds = lowQualityProducts.map(p => p.product_id);
    await supabase
      .from('external_products')
      .delete()
      .in('product_id', productIds);
    
    console.log(`  ${productIds.length}件の低品質商品を削除`);
  }
}

async function fetchProductWithHighQualityImage(itemData) {
  const item = itemData.Item;
  
  // 最高画質の画像URLを取得
  let imageUrl = '';
  let allImageUrls = {};
  
  // 大サイズ画像を優先
  if (IMAGE_QUALITY.preferLarge && item.largeImageUrls && item.largeImageUrls.length > 0) {
    imageUrl = item.largeImageUrls[0].imageUrl;
    allImageUrls.large = item.largeImageUrls[0].imageUrl;
  }
  
  // 中サイズ画像をフォールバック
  if (!imageUrl && IMAGE_QUALITY.fallbackToMedium && item.mediumImageUrls && item.mediumImageUrls.length > 0) {
    imageUrl = item.mediumImageUrls[0].imageUrl;
  }
  
  // すべてのサイズを記録
  if (IMAGE_QUALITY.saveMultipleUrls) {
    if (item.smallImageUrls && item.smallImageUrls.length > 0) {
      allImageUrls.small = item.smallImageUrls[0].imageUrl;
    }
    if (item.mediumImageUrls && item.mediumImageUrls.length > 0) {
      allImageUrls.medium = item.mediumImageUrls[0].imageUrl;
    }
  }
  
  return {
    productId: `rakuten_${item.itemCode}`,
    title: item.itemName,
    price: item.itemPrice,
    imageUrl: imageUrl,
    imageUrls: allImageUrls,  // 全サイズのURL
    productUrl: item.itemUrl,
    shopName: item.shopName,
    shopCode: item.shopCode,
    catchCopy: item.catchcopy || '',
    reviewAverage: item.reviewAverage || 0,
    reviewCount: item.reviewCount || 0,
    // 追加の品質指標
    hasLargeImage: !!allImageUrls.large,
    imageQuality: allImageUrls.large ? 'high' : (allImageUrls.medium ? 'medium' : 'low')
  };
}

async function saveProductToDatabase(product) {
  try {
    // タグを最適化（無料枠のため最大10タグに制限）
    const optimizedTags = product.ml_tags ? product.ml_tags.slice(0, 10) : [];
    
    const { error } = await supabase
      .from('external_products')
      .upsert({
        product_id: product.productId,
        title: product.title,
        price: product.price,
        image_url: product.imageUrl,
        product_url: product.productUrl,
        source: 'rakuten',
        source_brand: product.source_brand,
        brand_priority: product.brand_priority,
        brand_category: product.brand_category,
        target_age: product.target_age,
        price_range: product.price_range,
        tags: optimizedTags,  // 最適化されたタグ
        seasonal_tags: product.seasonal_tags ? product.seasonal_tags.slice(0, 5) : [],
        recommendation_score: product.recommendation_score || 50,
        review_average: product.reviewAverage,
        review_count: product.reviewCount,
        is_active: product.is_active,
        last_synced: product.last_synced,
        // 画像品質情報
        has_large_image: product.hasLargeImage,
        image_quality: product.imageQuality
      }, {
        onConflict: 'product_id'
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('  DB保存エラー:', error.message);
    throw error;
  }
}

// API呼び出しレート制限
let apiCallCount = 0;
let lastResetTime = Date.now();

async function rateLimitedApiCall(apiFunction, ...args) {
  const now = Date.now();
  
  // 1分経過したらカウントリセット
  if (now - lastResetTime > 60000) {
    apiCallCount = 0;
    lastResetTime = now;
  }
  
  // レート制限チェック
  if (apiCallCount >= SUPABASE_FREE_TIER.apiCallsPerMinute) {
    const waitTime = 60000 - (now - lastResetTime);
    console.log(`  API制限: ${Math.ceil(waitTime / 1000)}秒待機...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    apiCallCount = 0;
    lastResetTime = Date.now();
  }
  
  apiCallCount++;
  return await apiFunction(...args);
}

// メイン同期関数（簡略版）
async function syncProductsOptimized(brand, targetCount) {
  console.log(`\n🏷️  ${brand.name} の同期開始（最適化版）...`);
  
  // 容量チェック
  const capacityStatus = await checkDatabaseCapacity();
  if (capacityStatus === 'critical') {
    console.log('  ⏭️  容量制限のためスキップ');
    return 0;
  }
  
  // 容量警告時は商品数を制限
  if (capacityStatus === 'warning') {
    targetCount = Math.floor(targetCount * 0.5);
    console.log(`  ⚠️ 容量警告: 商品数を${targetCount}件に制限`);
  }
  
  const productIds = new Set();
  let totalSynced = 0;
  
  const keywords = brand.keywords || [brand.name];
  
  for (const keyword of keywords) {
    if (totalSynced >= targetCount) break;
    
    try {
      const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706`;
      const params = {
        applicationId: rakutenAppId,
        affiliateId: rakutenAffiliateId,
        keyword: keyword,
        hits: 30,
        page: 1,
        sort: '-reviewCount',  // レビュー数順で品質の高い商品を優先
        genreId: '100371',
        imageFlag: 1  // 画像ありの商品のみ
      };
      
      const response = await rateLimitedApiCall(axios.get, url, { params });
      
      if (response.data.Items && response.data.Items.length > 0) {
        for (const item of response.data.Items) {
          if (totalSynced >= targetCount) break;
          
          const product = await fetchProductWithHighQualityImage(item);
          
          // 画像品質チェック
          if (!product.imageUrl) {
            console.log(`  ⏭️  画像なしのためスキップ: ${product.title}`);
            continue;
          }
          
          // 品質スコアが高い商品のみ保存
          if (product.reviewCount < 3 && product.reviewAverage < 3.5) {
            continue;
          }
          
          if (!productIds.has(product.productId)) {
            productIds.add(product.productId);
            
            // 商品データの拡張
            const enhancedProduct = {
              ...product,
              source_brand: brand.name,
              brand_priority: brand.priority,
              brand_category: brand.category,
              target_age: brand.targetAge,
              price_range: brand.priceRange,
              is_active: true,
              last_synced: new Date().toISOString(),
              ml_tags: generateOptimizedTags(product, brand),
              recommendation_score: calculateQualityScore(product, brand)
            };
            
            await saveProductToDatabase(enhancedProduct);
            totalSynced++;
          }
        }
      }
    } catch (error) {
      console.error(`  ⚠️ ${keyword}の取得失敗:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500)); // API制限対策
  }
  
  console.log(`  ✅ ${totalSynced}件の高品質商品を同期`);
  return totalSynced;
}

// 最適化されたタグ生成（最大10個）
function generateOptimizedTags(product, brand) {
  const tags = new Set();
  
  // ブランドタグ（最大3個）
  brand.tags.slice(0, 3).forEach(tag => tags.add(tag));
  
  // 商品タイプ（重要なもののみ）
  const importantTypes = ['ワンピース', 'スカート', 'パンツ', 'トップス', 'アウター'];
  importantTypes.forEach(type => {
    if (product.title.includes(type) && tags.size < 8) {
      tags.add(type);
    }
  });
  
  // 価格帯タグ（1個）
  if (product.price < 3000) tags.add('プチプラ');
  else if (product.price < 10000) tags.add('お手頃');
  else if (product.price < 30000) tags.add('ミドル');
  else tags.add('高級');
  
  // 品質タグ（高評価のみ）
  if (product.reviewAverage >= 4.5 && product.reviewCount >= 50) {
    tags.add('人気');
  }
  
  return Array.from(tags).slice(0, 10);
}

// 品質スコア計算（画像品質を重視）
function calculateQualityScore(product, brand) {
  let score = 50;
  
  // ブランド優先度
  score += (7 - brand.priority) * 3;
  
  // レビュー評価（重要）
  score += product.reviewAverage * 8;
  
  // レビュー数（人気度）
  score += Math.min(product.reviewCount / 5, 20);
  
  // 画像品質ボーナス
  if (product.hasLargeImage) {
    score += 15;  // 高画質画像ボーナス
  }
  
  // 価格適正度
  const priceMatch = isPriceInRange(product.price, brand.priceRange);
  if (priceMatch) score += 5;
  
  return Math.min(Math.max(score, 0), 100);
}

// 価格帯チェック
function isPriceInRange(price, range) {
  const ranges = {
    'low': [0, 5000],
    'low-middle': [3000, 10000],
    'middle': [8000, 20000],
    'middle-high': [15000, 40000],
    'high': [30000, Infinity]
  };
  
  const [min, max] = ranges[range] || [0, Infinity];
  return price >= min && price <= max;
}

// エクスポート
module.exports = {
  checkDatabaseCapacity,
  optimizeForFreeTier,
  syncProductsOptimized,
  SUPABASE_FREE_TIER,
  IMAGE_QUALITY
};
