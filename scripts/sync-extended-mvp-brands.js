#!/usr/bin/env node
/**
 * 拡張MVPブランド戦略に基づいた楽天商品同期スクリプト
 * 30ブランド対応・段階的商品数増加・容量管理機能付き
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

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

// 同期履歴ファイルのパス
const SYNC_HISTORY_FILE = path.join(__dirname, '..', 'data', 'sync-history.json');

// 拡張MVPブランドリスト（30ブランド）
const EXTENDED_MVP_BRANDS = [
  // Priority 1: ベーシック・定番（最優先）
  { 
    name: 'UNIQLO',
    shopCode: 'uniqlo',
    priority: 1,
    tags: ['ベーシック', 'シンプル', '機能的'],
    category: 'basic',
    targetAge: '20-40',
    initialProducts: 30,
    maxProducts: 100
  },
  { 
    name: 'GU',
    shopCode: 'gu-official', 
    priority: 1,
    tags: ['トレンド', 'プチプラ', 'カジュアル'],
    category: 'basic',
    targetAge: '20-30',
    initialProducts: 30,
    maxProducts: 100
  },
  {
    name: '無印良品',
    keywords: ['無印良品', 'MUJI'],
    priority: 1,
    tags: ['シンプル', 'ナチュラル', 'ベーシック'],
    category: 'basic',
    targetAge: '25-40',
    initialProducts: 20,
    maxProducts: 60
  },
  
  // Priority 2: ECブランド・D2C系（コスパ重視）
  { 
    name: 'coca',
    keywords: ['coca コカ'],
    priority: 2,
    tags: ['ナチュラル', 'カジュアル', 'リラックス'],
    category: 'ec-brand',
    targetAge: '25-35',
    initialProducts: 20,
    maxProducts: 60
  },
  { 
    name: 'pierrot',
    keywords: ['pierrot ピエロ'],
    priority: 2,
    tags: ['大人カジュアル', 'きれいめ', 'オフィス'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 20,
    maxProducts: 60
  },
  {
    name: 'Re:EDIT',
    keywords: ['Re:EDIT リエディ'],
    priority: 2,
    tags: ['トレンド', 'モード', 'カジュアル'],
    category: 'ec-brand',
    targetAge: '20-35',
    initialProducts: 20,
    maxProducts: 60
  },
  {
    name: 'fifth',
    keywords: ['fifth フィフス'],
    priority: 2,
    tags: ['韓国系', 'トレンド', 'プチプラ'],
    category: 'ec-brand',
    targetAge: '20-30',
    initialProducts: 20,
    maxProducts: 60
  },
  {
    name: 'titivate',
    keywords: ['titivate ティティベイト'],
    priority: 2,
    tags: ['きれいめ', 'オフィス', '大人カジュアル'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 20,
    maxProducts: 60
  },
  
  // Priority 3: セレクトショップ系（品質重視）
  { 
    name: 'URBAN RESEARCH',
    keywords: ['URBAN RESEARCH アーバンリサーチ'],
    priority: 3,
    tags: ['都会的', 'セレクト', 'カジュアル'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 15,
    maxProducts: 50
  },
  {
    name: 'nano・universe',
    keywords: ['nano universe ナノユニバース'],
    priority: 3,
    tags: ['トレンド', 'きれいめ', 'モード'],
    category: 'select',
    targetAge: '20-35',
    initialProducts: 15,
    maxProducts: 50
  },
  {
    name: 'BEAMS',
    keywords: ['BEAMS ビームス'],
    priority: 3,
    tags: ['カジュアル', 'セレクト', 'トレンド'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 15,
    maxProducts: 50
  },
  {
    name: 'UNITED ARROWS',
    keywords: ['UNITED ARROWS ユナイテッドアローズ'],
    priority: 3,
    tags: ['きれいめ', '上品', 'オフィス'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 15,
    maxProducts: 50
  },
  {
    name: 'SHIPS',
    keywords: ['SHIPS シップス'],
    priority: 3,
    tags: ['トラッド', '上品', 'きれいめ'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 15,
    maxProducts: 50
  },
  
  // Priority 4: ライフスタイル系
  {
    name: 'studio CLIP',
    keywords: ['studio CLIP スタディオクリップ'],
    priority: 4,
    tags: ['ナチュラル', '雑貨', 'リラックス'],
    category: 'lifestyle',
    targetAge: '25-40',
    initialProducts: 15,
    maxProducts: 40
  },
  {
    name: 'SM2',
    keywords: ['SM2 サマンサモスモス'],
    priority: 4,
    tags: ['ナチュラル', 'ほっこり', 'カジュアル'],
    category: 'lifestyle',
    targetAge: '25-40',
    initialProducts: 15,
    maxProducts: 40
  },
  {
    name: 'earth music&ecology',
    keywords: ['earth music ecology アースミュージックエコロジー'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'エコ'],
    category: 'lifestyle',
    targetAge: '20-30',
    initialProducts: 15,
    maxProducts: 40
  },
  {
    name: 'LOWRYS FARM',
    keywords: ['LOWRYS FARM ローリーズファーム'],
    priority: 4,
    tags: ['ガーリー', 'カジュアル', 'フェミニン'],
    category: 'lifestyle',
    targetAge: '20-30',
    initialProducts: 15,
    maxProducts: 40
  },
  
  // Priority 5: 年齢層別特化ブランド
  {
    name: 'PLST',
    keywords: ['PLST プラステ'],
    priority: 5,
    tags: ['大人ベーシック', 'きれいめ', '上質'],
    category: 'age-specific',
    targetAge: '30-40',
    initialProducts: 10,
    maxProducts: 40
  },
  {
    name: 'vis',
    keywords: ['vis ビス'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'フェミニン'],
    category: 'age-specific',
    targetAge: '25-35',
    initialProducts: 10,
    maxProducts: 40
  },
  {
    name: 'ROPE',
    keywords: ['ROPE ロペ'],
    priority: 5,
    tags: ['エレガント', 'きれいめ', 'オフィス'],
    category: 'age-specific',
    targetAge: '25-40',
    initialProducts: 10,
    maxProducts: 40
  },
  {
    name: 'NATURAL BEAUTY BASIC',
    keywords: ['NATURAL BEAUTY BASIC ナチュラルビューティーベーシック'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'ベーシック'],
    category: 'age-specific',
    targetAge: '25-40',
    initialProducts: 10,
    maxProducts: 40
  },
  
  // Priority 6: トレンド・個性派
  {
    name: 'ZARA',
    keywords: ['ZARA ザラ'],
    priority: 6,
    tags: ['欧州トレンド', 'モード', 'ファスト'],
    category: 'trend',
    targetAge: '20-35',
    initialProducts: 10,
    maxProducts: 40
  },
  {
    name: 'H&M',
    keywords: ['H&M エイチアンドエム'],
    priority: 6,
    tags: ['北欧', 'トレンド', 'カジュアル'],
    category: 'trend',
    targetAge: '20-30',
    initialProducts: 10,
    maxProducts: 40
  },
  {
    name: 'SNIDEL',
    keywords: ['SNIDEL スナイデル'],
    priority: 6,
    tags: ['フェミニン', 'エレガント', 'トレンド'],
    category: 'trend',
    targetAge: '20-30',
    initialProducts: 10,
    maxProducts: 40
  },
  {
    name: 'FRAY I.D',
    keywords: ['FRAY ID フレイアイディー'],
    priority: 6,
    tags: ['エレガント', 'モード', 'フェミニン'],
    category: 'trend',
    targetAge: '25-35',
    initialProducts: 10,
    maxProducts: 40
  },
  
  // Priority 7: カジュアル・ストリート
  {
    name: 'WEGO',
    keywords: ['WEGO ウィゴー'],
    priority: 7,
    tags: ['ストリート', 'カジュアル', 'プチプラ'],
    category: 'casual',
    targetAge: '20-25',
    initialProducts: 10,
    maxProducts: 30
  },
  {
    name: 'GLOBAL WORK',
    keywords: ['GLOBAL WORK グローバルワーク'],
    priority: 7,
    tags: ['カジュアル', 'ファミリー', 'ベーシック'],
    category: 'casual',
    targetAge: '25-40',
    initialProducts: 10,
    maxProducts: 30
  },
  {
    name: 'niko and...',
    keywords: ['niko and ニコアンド'],
    priority: 7,
    tags: ['カジュアル', '雑貨', 'ライフスタイル'],
    category: 'casual',
    targetAge: '20-35',
    initialProducts: 10,
    maxProducts: 30
  },
  {
    name: 'coen',
    keywords: ['coen コーエン'],
    priority: 7,
    tags: ['カジュアル', 'アメカジ', 'ベーシック'],
    category: 'casual',
    targetAge: '20-35',
    initialProducts: 10,
    maxProducts: 30
  }
];

// レート制限対策
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 同期履歴の読み込み
async function loadSyncHistory() {
  try {
    await fs.mkdir(path.dirname(SYNC_HISTORY_FILE), { recursive: true });
    const data = await fs.readFile(SYNC_HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空のオブジェクトを返す
    return {};
  }
}

// 同期履歴の保存
async function saveSyncHistory(history) {
  await fs.mkdir(path.dirname(SYNC_HISTORY_FILE), { recursive: true });
  await fs.writeFile(SYNC_HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Supabaseの容量チェック
async function checkDatabaseCapacity() {
  try {
    // 現在の商品数を取得
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    // アクティブな商品数を取得
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\n📊 データベース容量状況:`);
    console.log(`  総商品数: ${totalCount}件`);
    console.log(`  アクティブ商品数: ${activeCount}件`);

    // 容量の警告閾値（Supabase無料プランの場合）
    const WARNING_THRESHOLD = 50000;  // 5万件で警告
    const CRITICAL_THRESHOLD = 90000; // 9万件で危険

    if (totalCount > CRITICAL_THRESHOLD) {
      console.error(`\n⚠️  警告: データベース容量が危険域です！(${totalCount}/${CRITICAL_THRESHOLD})`);
      return { canSync: false, totalCount, activeCount };
    } else if (totalCount > WARNING_THRESHOLD) {
      console.warn(`\n⚠️  注意: データベース容量が警告域です (${totalCount}/${WARNING_THRESHOLD})`);
    }

    return { canSync: true, totalCount, activeCount };
  } catch (error) {
    console.error('❌ データベース容量チェックエラー:', error);
    return { canSync: true, totalCount: 0, activeCount: 0 };
  }
}

// ブランドごとの同期商品数を計算
function calculateSyncCount(brand, syncHistory) {
  const brandHistory = syncHistory[brand.name] || {};
  const syncCount = brandHistory.syncCount || 0;
  const lastSync = brandHistory.lastSync ? new Date(brandHistory.lastSync) : null;
  
  // 初回同期の場合
  if (syncCount === 0) {
    return brand.initialProducts;
  }
  
  // 前回同期から7日以上経過している場合、商品数を増やす
  const daysSinceLastSync = lastSync ? 
    (new Date() - lastSync) / (1000 * 60 * 60 * 24) : 999;
  
  if (daysSinceLastSync >= 7) {
    // 現在の商品数の20%増加（最大値を超えない）
    const increase = Math.ceil(syncCount * 0.2);
    const newCount = Math.min(syncCount + increase, brand.maxProducts);
    return newCount;
  }
  
  // それ以外は現在の商品数を維持
  return syncCount;
}

/**
 * ブランド別に楽天APIから商品データを取得
 */
async function fetchBrandProducts(brand, page = 1, maxHits = 30) {
  const url = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
  const params = {
    applicationId: rakutenAppId,
    affiliateId: rakutenAffiliateId,
    hits: Math.min(maxHits, 30), // APIの制限は30件
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
    console.log(`🔍 ${brand.name} の商品を検索中... (page: ${page})`);
    const response = await axios.get(url, { params, timeout: 10000 });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn(`⚠️  ${brand.name} APIレート制限に達しました。待機中...`);
      await sleep(5000); // 5秒待機
      return fetchBrandProducts(brand, page, maxHits); // リトライ
    }
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
  if (!products || products.length === 0) {
    console.log(`📦 ${brand.name} の保存する商品がありません`);
    return { new: 0, updated: 0 };
  }

  console.log(`📦 ${brand.name} の ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    
    // ブランド固有のタグを追加
    const extractedTags = extractEnhancedTags(product);
    const combinedTags = [...new Set([...extractedTags, ...brand.tags])];
    
    // 年齢層タグの追加
    if (brand.targetAge) {
      const ageRanges = brand.targetAge.split('-');
      if (ageRanges[0] <= 25) combinedTags.push('20代');
      if (ageRanges[0] <= 35 && ageRanges[1] >= 30) combinedTags.push('30代');
      if (ageRanges[1] >= 35) combinedTags.push('40代');
    }
    
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: product.mediumImageUrls[0]?.imageUrl || '',
      brand: brand.name,
      price: product.itemPrice,
      tags: combinedTags.slice(0, 20), // 最大20個
      category: brand.category || '100371',
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      source_brand: brand.name.toLowerCase().replace(/\s+/g, '_'),
      is_active: true,
      priority: brand.priority,
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

    let insertCount = 0;
    let updateCount = 0;

    // 新規商品を挿入（バッチ処理）
    if (newProducts.length > 0) {
      // 100件ずつバッチ挿入
      for (let i = 0; i < newProducts.length; i += 100) {
        const batch = newProducts.slice(i, i + 100);
        const { error: insertError } = await supabase
          .from('external_products')
          .insert(batch);

        if (insertError) {
          console.error(`❌ ${brand.name} 挿入エラー:`, insertError);
        } else {
          insertCount += batch.length;
        }
      }
      
      if (insertCount > 0) {
        console.log(`✅ ${brand.name}: ${insertCount}件の新規商品を追加`);
      }
    }

    // 既存商品を更新（バッチ処理）
    if (updateProducts.length > 0) {
      // 50件ずつバッチ更新
      for (let i = 0; i < updateProducts.length; i += 50) {
        const batch = updateProducts.slice(i, i + 50);
        const updatePromises = batch.map(product => 
          supabase
            .from('external_products')
            .update({
              title: product.title,
              price: product.price,
              tags: product.tags,
              priority: product.priority,
              is_active: true,
              last_synced: product.last_synced,
              shop_name: product.shop_name,
              review_count: product.review_count,
              review_average: product.review_average,
              item_update_timestamp: product.item_update_timestamp,
              is_seasonal: product.is_seasonal
            })
            .eq('id', product.id)
        );

        await Promise.all(updatePromises);
        updateCount += batch.length;
      }

      if (updateCount > 0) {
        console.log(`✅ ${brand.name}: ${updateCount}件の既存商品を更新`);
      }
    }

    return { new: insertCount, updated: updateCount };

  } catch (error) {
    console.error(`❌ ${brand.name} 保存エラー:`, error);
    return { new: 0, updated: 0 };
  }
}

/**
 * 古い商品データの無効化
 */
async function deactivateOldProducts(daysOld = 7) {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - daysOld);

  try {
    const { data, error } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .lt('last_synced', oldDate.toISOString())
      .eq('source', 'rakuten')
      .select('id');

    if (error) {
      console.error('❌ 古い商品の無効化エラー:', error);
    } else {
      console.log(`✅ ${daysOld}日以上更新されていない${data?.length || 0}件の商品を無効化しました`);
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

    console.log('\n📊 ブランド別商品数 (アクティブのみ):');
    
    // カテゴリ別に集計
    const categories = {
      'basic': { name: 'ベーシック・定番', brands: [] },
      'ec-brand': { name: 'ECブランド・D2C', brands: [] },
      'select': { name: 'セレクトショップ', brands: [] },
      'lifestyle': { name: 'ライフスタイル', brands: [] },
      'age-specific': { name: '年齢層特化', brands: [] },
      'trend': { name: 'トレンド・個性派', brands: [] },
      'casual': { name: 'カジュアル', brands: [] }
    };

    Object.entries(brandCounts).forEach(([brandKey, count]) => {
      const brand = EXTENDED_MVP_BRANDS.find(b => 
        b.name.toLowerCase().replace(/\s+/g, '_') === brandKey
      );
      if (brand && categories[brand.category]) {
        categories[brand.category].brands.push({ name: brand.name, count });
      }
    });

    // カテゴリ別に表示
    Object.entries(categories).forEach(([key, category]) => {
      if (category.brands.length > 0) {
        console.log(`\n【${category.name}】`);
        category.brands.forEach(({ name, count }) => {
          console.log(`   - ${name}: ${count}件`);
        });
      }
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
  console.log('\n🚀 拡張MVP戦略（30ブランド）に基づく楽天商品同期を開始します...\n');
  console.log(`📋 対象ブランド数: ${EXTENDED_MVP_BRANDS.length}ブランド`);
  console.log('📈 段階的商品数増加システム: 有効');
  console.log('💾 データベース容量管理: 有効\n');

  // データベース容量チェック
  const capacityCheck = await checkDatabaseCapacity();
  if (!capacityCheck.canSync) {
    console.error('\n❌ データベース容量が限界に達しているため、同期を中止します');
    console.log('💡 古い商品データの削除を検討してください');
    process.exit(1);
  }

  // 同期履歴の読み込み
  const syncHistory = await loadSyncHistory();

  const syncResults = {
    totalNew: 0,
    totalUpdated: 0,
    brandResults: [],
    skippedBrands: []
  };

  try {
    // 優先度順にブランドを処理
    const sortedBrands = EXTENDED_MVP_BRANDS.sort((a, b) => a.priority - b.priority);

    for (const brand of sortedBrands) {
      console.log(`\n🏷️  ${brand.name} (Priority: ${brand.priority}, Category: ${brand.category})`);
      
      // このブランドの同期商品数を計算
      const targetProductCount = calculateSyncCount(brand, syncHistory);
      console.log(`  📊 目標商品数: ${targetProductCount}件 (最大: ${brand.maxProducts}件)`);
      
      // 容量チェック（ブランドごと）
      if (capacityCheck.activeCount + targetProductCount > 95000) {
        console.warn(`  ⚠️  容量制限のため ${brand.name} をスキップします`);
        syncResults.skippedBrands.push(brand.name);
        continue;
      }
      
      let allProducts = [];
      const itemsPerPage = 30;
      const maxPages = Math.ceil(targetProductCount / itemsPerPage);
      
      // 複数ページから商品を取得
      for (let page = 1; page <= maxPages && allProducts.length < targetProductCount; page++) {
        const data = await fetchBrandProducts(brand, page);
        
        if (data?.Items && data.Items.length > 0) {
          allProducts = allProducts.concat(data.Items);
          console.log(`  📄 ページ ${page}: ${data.Items.length}件取得`);
          
          // レート制限対策
          if (page < maxPages) {
            await sleep(2000); // 2秒待機
          }
        } else {
          console.log(`  📝 ${brand.name} の商品が見つかりません（ページ ${page}）`);
          break;
        }
      }

      // 目標商品数に制限
      allProducts = allProducts.slice(0, targetProductCount);

      if (allProducts.length > 0) {
        const result = await saveProducts(allProducts, brand);
        syncResults.totalNew += result.new;
        syncResults.totalUpdated += result.updated;
        syncResults.brandResults.push({
          brand: brand.name,
          priority: brand.priority,
          category: brand.category,
          targetCount: targetProductCount,
          actualCount: allProducts.length,
          ...result
        });

        // 同期履歴を更新
        syncHistory[brand.name] = {
          syncCount: allProducts.length,
          lastSync: new Date().toISOString(),
          totalSynced: (syncHistory[brand.name]?.totalSynced || 0) + result.new
        };
      }

      // ブランド間の待機
      await sleep(2500);
      
      // 更新された容量を再計算
      capacityCheck.activeCount += allProducts.length;
    }

    // 同期履歴を保存
    await saveSyncHistory(syncHistory);

    // 古い商品の無効化（段階的に日数を調整）
    const inactiveDays = capacityCheck.activeCount > 70000 ? 5 : 7;
    await deactivateOldProducts(inactiveDays);

    // 結果サマリー
    console.log('\n📈 同期結果サマリー:');
    console.log(`  新規追加: ${syncResults.totalNew}件`);
    console.log(`  更新: ${syncResults.totalUpdated}件`);
    
    if (syncResults.skippedBrands.length > 0) {
      console.log(`  スキップ: ${syncResults.skippedBrands.join(', ')}`);
    }

    console.log('\n📊 カテゴリ別詳細:');
    const categoryResults = {};
    syncResults.brandResults.forEach(result => {
      if (!categoryResults[result.category]) {
        categoryResults[result.category] = {
          brands: 0,
          new: 0,
          updated: 0,
          total: 0
        };
      }
      categoryResults[result.category].brands++;
      categoryResults[result.category].new += result.new;
      categoryResults[result.category].updated += result.updated;
      categoryResults[result.category].total += result.actualCount;
    });

    Object.entries(categoryResults).forEach(([category, stats]) => {
      console.log(`  【${category}】: ${stats.brands}ブランド, 新規${stats.new}件, 更新${stats.updated}件`);
    });

    // 統計情報表示
    await showStatistics();

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main().then(() => {
  console.log('\n✨ すべての処理が完了しました');
  console.log('💡 次回同期では各ブランドの商品数が自動的に増加します');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ 予期しないエラー:', error);
  process.exit(1);
});
