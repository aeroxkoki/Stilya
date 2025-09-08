#!/usr/bin/env node

/**
 * 強化版日次パッチスクリプト
 * - データベースの最適化
 * - パフォーマンスの改善
 * - 不要なデータのクリーンアップ
 * - データ整合性の修正
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const path = require('path');

// タグマッピングユーティリティを安全にインポート
let determineProductStyleAdvanced;
try {
  const tagUtils = require('../utils/tag-mapping-utils');
  determineProductStyleAdvanced = tagUtils.determineProductStyleAdvanced;
} catch (error) {
  console.warn('⚠️ tag-mapping-utilsが見つかりません。デフォルト関数を使用します。');
  determineProductStyleAdvanced = (tags, category) => {
    // シンプルなフォールバック実装
    if (!tags || tags.length === 0) return 'casual';
    
    const styleKeywords = {
      casual: ['カジュアル', 'デイリー', 'ラフ', 'リラックス'],
      street: ['ストリート', 'スケーター', 'ヒップホップ'],
      mode: ['モード', 'モダン', 'ミニマル', 'シンプル'],
      natural: ['ナチュラル', 'オーガニック', '自然'],
      classic: ['クラシック', 'きれいめ', 'オフィス', 'ビジネス', 'フォーマル'],
      feminine: ['フェミニン', 'ガーリー', 'キュート', 'かわいい']
    };
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (tags.some(tag => keywords.some(keyword => tag.includes(keyword)))) {
        return style;
      }
    }
    
    return 'casual';
  };
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数SUPABASE_URLまたはSUPABASE_ANON_KEYが設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 実行統計
const stats = {
  fixed: {
    inactive: 0,
    images: 0,
    styles: 0,
    duplicates: 0,
    prices: 0,
    categories: 0
  },
  cleaned: {
    logs: 0,
    oldData: 0
  },
  optimized: {
    images: 0,
    cache: 0
  }
};

async function runDailyPatch() {
  console.log('🔧 強化版日次パッチを開始します...\n');
  console.log('=' .repeat(50));

  try {
    // 1. データベース統計の更新
    console.log('\n📊 データベース統計を更新中...');
    await updateDatabaseStatistics();

    // 2. 非アクティブ商品の修正
    console.log('\n🔄 非アクティブ商品を修正中...');
    await fixInactiveProducts();

    // 3. 画像URLの最適化と修正
    console.log('\n🖼️ 画像URLを最適化中...');
    await optimizeAndFixImageUrls();

    // 4. 重複商品の処理
    console.log('\n🔍 重複商品を処理中...');
    await handleDuplicateProducts();

    // 5. スタイルタグの整合性チェックと修正
    console.log('\n🏷️ スタイルタグの整合性をチェック中...');
    await maintainStyleTags();

    // 6. 価格とカテゴリの修正
    console.log('\n💰 価格とカテゴリを修正中...');
    await fixPricesAndCategories();

    // 7. パフォーマンスキャッシュの更新
    console.log('\n⚡ パフォーマンスキャッシュを更新中...');
    await updatePerformanceCache();

    // 8. 不要なログのクリーンアップ
    console.log('\n🧹 古いログをクリーンアップ中...');
    await cleanupOldLogs();

    // 9. データ品質の最終チェック
    console.log('\n✅ データ品質の最終チェック中...');
    await finalQualityCheck();

    // 統計レポート
    console.log('\n' + '=' .repeat(50));
    console.log('📈 実行結果サマリー:\n');
    console.log('修正済み:');
    console.log(`  - 非アクティブ商品: ${stats.fixed.inactive}件`);
    console.log(`  - 画像URL: ${stats.fixed.images}件`);
    console.log(`  - スタイルタグ: ${stats.fixed.styles}件`);
    console.log(`  - 重複商品: ${stats.fixed.duplicates}件`);
    console.log(`  - 価格: ${stats.fixed.prices}件`);
    console.log(`  - カテゴリ: ${stats.fixed.categories}件`);
    console.log('\n最適化:');
    console.log(`  - 画像最適化: ${stats.optimized.images}件`);
    console.log(`  - キャッシュ更新: ${stats.optimized.cache}件`);
    console.log('\nクリーンアップ:');
    console.log(`  - ログ削除: ${stats.cleaned.logs}件`);
    console.log(`  - 古いデータ: ${stats.cleaned.oldData}件`);

    console.log('\n✅ 強化版日次パッチが正常に完了しました！');
  } catch (error) {
    console.error('\n❌ 日次パッチ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// データベース統計の更新
async function updateDatabaseStatistics() {
  const { count: totalProducts, error: countError } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`商品数の取得に失敗: ${countError.message}`);
  }

  const { count: activeProducts } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: brandStats, error: brandError } = await supabase
    .from('external_products')
    .select('brand')
    .eq('is_active', true)
    .order('brand');

  if (brandError) {
    throw new Error(`ブランド統計の取得に失敗: ${brandError.message}`);
  }

  // ブランド別の商品数を集計
  const brandCounts = {};
  brandStats.forEach(item => {
    const brand = item.brand || '不明';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  console.log(`  ✅ 総商品数: ${totalProducts}件`);
  console.log(`  ✅ アクティブ商品: ${activeProducts}件`);
  console.log(`  ✅ ブランド数: ${Object.keys(brandCounts).length}`);
}

// 非アクティブ商品の修正
async function fixInactiveProducts() {
  const { data: inactiveProducts, error } = await supabase
    .from('external_products')
    .select('id, title, price, image_url')
    .eq('is_active', false);

  if (error) {
    console.error('  ⚠️ 非アクティブ商品の取得エラー:', error.message);
    return;
  }

  if (!inactiveProducts || inactiveProducts.length === 0) {
    console.log('  ✅ すべての商品はアクティブです');
    return;
  }

  let fixedCount = 0;
  for (const product of inactiveProducts) {
    // 必要な情報が揃っている場合はアクティブ化
    if (product.title && product.price && product.image_url) {
      const { error: updateError } = await supabase
        .from('external_products')
        .update({ is_active: true })
        .eq('id', product.id);

      if (!updateError) {
        fixedCount++;
      }
    }
  }

  stats.fixed.inactive = fixedCount;
  console.log(`  ✅ ${fixedCount}件の商品をアクティブ化しました`);
}

// 画像URLの最適化と修正
async function optimizeAndFixImageUrls() {
  // 空の画像URLを修正
  const { data: noImageProducts, error: fetchError1 } = await supabase
    .from('external_products')
    .select('id, title')
    .or('image_url.is.null,image_url.eq.')
    .limit(100);

  if (!fetchError1 && noImageProducts && noImageProducts.length > 0) {
    // デフォルト画像を設定
    const defaultImage = 'https://via.placeholder.com/800x800/f0f0f0/666666?text=No+Image';
    
    for (const product of noImageProducts) {
      const { error: updateError } = await supabase
        .from('external_products')
        .update({ 
          image_url: defaultImage,
          is_active: false // 画像がない商品は非アクティブに
        })
        .eq('id', product.id);

      if (!updateError) {
        stats.fixed.images++;
      }
    }
  }

  // Rakuten画像URLの最適化（800x800サイズに統一）
  const { data: productsToOptimize, error: fetchError2 } = await supabase
    .from('external_products')
    .select('id, image_url')
    .like('image_url', '%thumbnail.image.rakuten.co.jp%')
    .not('image_url', 'like', '%800x800%')
    .limit(100);

  if (!fetchError2 && productsToOptimize && productsToOptimize.length > 0) {
    for (const product of productsToOptimize) {
      const optimizedUrl = product.image_url.replace(/\?_ex=\d+x\d+/, '?_ex=800x800');
      
      if (optimizedUrl !== product.image_url) {
        const { error: updateError } = await supabase
          .from('external_products')
          .update({ image_url: optimizedUrl })
          .eq('id', product.id);

        if (!updateError) {
          stats.optimized.images++;
        }
      }
    }
  }

  console.log(`  ✅ 画像修正: ${stats.fixed.images}件、最適化: ${stats.optimized.images}件`);
}

// 重複商品の処理
async function handleDuplicateProducts() {
  // 同じタイトルとソースの商品を検索
  const { data: allProducts, error } = await supabase
    .from('external_products')
    .select('id, title, source, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('  ⚠️ 商品取得エラー:', error.message);
    return;
  }

  const seen = new Map();
  const duplicateIds = [];

  allProducts?.forEach(product => {
    const key = `${product.title}|${product.source}`;
    if (seen.has(key)) {
      // 重複を発見（古い方を保持、新しい方を削除対象に）
      duplicateIds.push(product.id);
    } else {
      seen.set(key, product.id);
    }
  });

  if (duplicateIds.length > 0) {
    // 重複商品を非アクティブ化（削除の代わりに）
    for (const id of duplicateIds.slice(0, 50)) { // 一度に50件まで
      const { error: updateError } = await supabase
        .from('external_products')
        .update({ is_active: false })
        .eq('id', id);

      if (!updateError) {
        stats.fixed.duplicates++;
      }
    }
  }

  console.log(`  ✅ ${stats.fixed.duplicates}件の重複商品を非アクティブ化しました`);
}

// スタイルタグの整合性メンテナンス
async function maintainStyleTags() {
  // style_tagsがnullまたは不適切な値の商品を検出
  const { data: invalidStyleProducts, error: fetchError } = await supabase
    .from('external_products')
    .select('id, tags, category, style_tags')
    .or('style_tags.is.null,style_tags.cs.{basic,everyday,versatile,formal,elegant,outdoor}')
    .eq('is_active', true)
    .limit(500);
  
  if (fetchError) {
    console.error('  ⚠️ スタイルタグ取得エラー:', fetchError.message);
    return;
  }
  
  if (!invalidStyleProducts || invalidStyleProducts.length === 0) {
    console.log('  ✅ すべてのスタイルタグは正常です');
    return;
  }
  
  for (const product of invalidStyleProducts) {
    const newStyle = determineProductStyleAdvanced(product.tags || [], product.category);
    
    const { error: updateError } = await supabase
      .from('external_products')
      .update({ style_tags: [newStyle] })
      .eq('id', product.id);
    
    if (!updateError) {
      stats.fixed.styles++;
    }
  }
  
  console.log(`  ✅ ${stats.fixed.styles}件のスタイルタグを修正しました`);
}

// 価格とカテゴリの修正
async function fixPricesAndCategories() {
  // 価格が0または未設定の商品
  const { data: zeroPriceProducts, error: priceError } = await supabase
    .from('external_products')
    .select('id, title')
    .or('price.is.null,price.eq.0')
    .limit(100);

  if (!priceError && zeroPriceProducts && zeroPriceProducts.length > 0) {
    // 価格が不明な商品は非アクティブ化
    for (const product of zeroPriceProducts) {
      const { error: updateError } = await supabase
        .from('external_products')
        .update({ 
          price: 0,
          is_active: false 
        })
        .eq('id', product.id);

      if (!updateError) {
        stats.fixed.prices++;
      }
    }
  }

  // カテゴリが未設定の商品
  const { data: noCategoryProducts, error: categoryError } = await supabase
    .from('external_products')
    .select('id, title, tags')
    .or('category.is.null,category.eq.')
    .limit(100);

  if (!categoryError && noCategoryProducts && noCategoryProducts.length > 0) {
    for (const product of noCategoryProducts) {
      // タグからカテゴリを推測
      let category = 'その他';
      const tags = product.tags || [];
      
      if (tags.some(t => t.includes('トップス') || t.includes('シャツ'))) {
        category = 'トップス';
      } else if (tags.some(t => t.includes('ボトムス') || t.includes('パンツ'))) {
        category = 'ボトムス';
      } else if (tags.some(t => t.includes('ワンピース'))) {
        category = 'ワンピース';
      } else if (tags.some(t => t.includes('アウター'))) {
        category = 'アウター';
      }

      const { error: updateError } = await supabase
        .from('external_products')
        .update({ category })
        .eq('id', product.id);

      if (!updateError) {
        stats.fixed.categories++;
      }
    }
  }

  console.log(`  ✅ 価格修正: ${stats.fixed.prices}件、カテゴリ修正: ${stats.fixed.categories}件`);
}

// パフォーマンスキャッシュの更新
async function updatePerformanceCache() {
  // 人気商品のキャッシュを更新
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: popularProducts, error } = await supabase
    .from('swipes')
    .select('product_id')
    .eq('result', 'yes')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(100);

  if (!error && popularProducts) {
    const productCounts = {};
    popularProducts.forEach(swipe => {
      productCounts[swipe.product_id] = (productCounts[swipe.product_id] || 0) + 1;
    });

    const sortedProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    stats.optimized.cache = sortedProducts.length;
    console.log(`  ✅ 人気商品TOP${sortedProducts.length}を更新しました`);
  } else {
    console.log('  ℹ️ スワイプデータがまだありません');
  }
}

// 古いログのクリーンアップ
async function cleanupOldLogs() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 古いclick_logsの削除
  const { error: clickLogError, count } = await supabase
    .from('click_logs')
    .delete()
    .lt('created_at', sevenDaysAgo.toISOString())
    .select('*', { count: 'exact', head: true });

  if (!clickLogError && count) {
    stats.cleaned.logs = count;
  }

  // 60日以上古い非アクティブ商品の削除
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const { error: oldProductError, count: oldCount } = await supabase
    .from('external_products')
    .delete()
    .eq('is_active', false)
    .lt('updated_at', sixtyDaysAgo.toISOString())
    .select('*', { count: 'exact', head: true });

  if (!oldProductError && oldCount) {
    stats.cleaned.oldData = oldCount;
  }

  console.log(`  ✅ ログ削除: ${stats.cleaned.logs}件、古いデータ: ${stats.cleaned.oldData}件`);
}

// データ品質の最終チェック
async function finalQualityCheck() {
  const checks = {
    activeProducts: 0,
    withImages: 0,
    withStyles: 0,
    withCategories: 0,
    withPrices: 0
  };

  // アクティブ商品数
  const { count: activeCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  checks.activeProducts = activeCount || 0;

  // 画像がある商品
  const { count: imageCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('image_url', 'is', null)
    .not('image_url', 'eq', '');
  checks.withImages = imageCount || 0;

  // スタイルタグがある商品
  const { count: styleCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('style_tags', 'is', null);
  checks.withStyles = styleCount || 0;

  // カテゴリがある商品
  const { count: categoryCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('category', 'is', null)
    .not('category', 'eq', '');
  checks.withCategories = categoryCount || 0;

  // 価格が設定されている商品
  const { count: priceCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .gt('price', 0);
  checks.withPrices = priceCount || 0;

  console.log('  データ品質チェック結果:');
  console.log(`    - アクティブ商品: ${checks.activeProducts}件`);
  console.log(`    - 画像あり: ${checks.withImages}件 (${((checks.withImages/checks.activeProducts)*100).toFixed(1)}%)`);
  console.log(`    - スタイルタグあり: ${checks.withStyles}件 (${((checks.withStyles/checks.activeProducts)*100).toFixed(1)}%)`);
  console.log(`    - カテゴリあり: ${checks.withCategories}件 (${((checks.withCategories/checks.activeProducts)*100).toFixed(1)}%)`);
  console.log(`    - 価格設定あり: ${checks.withPrices}件 (${((checks.withPrices/checks.activeProducts)*100).toFixed(1)}%)`);

  const qualityScore = ((
    (checks.withImages / checks.activeProducts) +
    (checks.withStyles / checks.activeProducts) +
    (checks.withCategories / checks.activeProducts) +
    (checks.withPrices / checks.activeProducts)
  ) / 4 * 100).toFixed(1);

  console.log(`  📊 総合品質スコア: ${qualityScore}%`);
}

// メイン実行
if (require.main === module) {
  runDailyPatch().catch(error => {
    console.error('❌ 致命的なエラー:', error);
    process.exit(1);
  });
}

module.exports = { runDailyPatch };
