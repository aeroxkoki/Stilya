#!/usr/bin/env node
/**
 * GitHub Actions専用: MVPブランド戦略に基づいた楽天商品同期
 * Phase 2対応: 優先度設定、季節性考慮、スコアリング準備
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// MVP優先ブランドリスト（Phase 2対応）
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
  },
  // Phase 2で追加するブランド
  { 
    name: 'BEAMS',
    keywords: ['BEAMS ビームス'],
    priority: 3,
    tags: ['セレクト', 'トレンド', 'ミックス'],
    maxProducts: 20
  },
  { 
    name: 'SHIPS',
    keywords: ['SHIPS シップス'],
    priority: 3,
    tags: ['トラッド', 'きれいめ', 'オフィス'],
    maxProducts: 20
  }
];

// 季節タグマッピング（Phase 2）
const SEASONAL_TAGS = {
  spring: ['春', '春夏', 'ライト', '薄手', 'パステル', 'シャツ', 'カーディガン'],
  summer: ['夏', '春夏', 'ノースリーブ', 'サンダル', 'UV', '半袖', 'ショート'],
  autumn: ['秋', '秋冬', 'ニット', 'カーディガン', 'ブーツ', 'ジャケット', 'チェック'],
  winter: ['冬', '秋冬', 'コート', 'ダウン', '厚手', 'ニット', 'マフラー', 'ブーツ']
};

// 現在の季節を取得
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// enhanced-tag-extractorモジュールの読み込み
let extractEnhancedTags;
try {
  const path = require('path');
  const tagExtractorPath = path.join(__dirname, 'enhanced-tag-extractor.js');
  const tagExtractor = require(tagExtractorPath);
  extractEnhancedTags = tagExtractor.extractEnhancedTags;
  console.log('✅ Phase 2対応: 高精度タグ抽出モジュールを読み込みました');
} catch (error) {
  console.warn('⚠️ 高精度タグ抽出モジュールが見つかりません。基本的なタグ抽出を使用します。');
  
  // フォールバック
  extractEnhancedTags = function(product) {
    const tags = ['ファッション'];
    const itemName = product.itemName || '';
    
    // 季節タグの追加
    const currentSeason = getCurrentSeason();
    const seasonalKeywords = SEASONAL_TAGS[currentSeason];
    seasonalKeywords.forEach(keyword => {
      if (itemName.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return [...new Set(tags)];
  };
}

// 環境変数から取得
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const rakutenAppId = process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;

console.log('=== MVP戦略商品同期 (Phase 2対応) ===');
console.log(`環境: ${process.env.NODE_ENV || 'production'}`);
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`使用キータイプ: ${process.env.SUPABASE_SERVICE_KEY ? 'Service Role' : 'Anon Key'}`);
console.log(`現在の季節: ${getCurrentSeason()}`);

if (!supabaseUrl || !supabaseKey || !rakutenAppId || !rakutenAffiliateId) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

// Supabaseクライアントの初期化
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    console.log(`🔍 ${brand.name} の商品を検索中... (page: ${page})`);
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⏳ レート制限に達しました。5秒待機します...');
      await sleep(5000);
      return fetchBrandProducts(brand, page);
    }
    console.error(`❌ ${brand.name} API エラー:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * 季節スコアを計算（Phase 2）
 */
function calculateSeasonalScore(tags) {
  const currentSeason = getCurrentSeason();
  const seasonalTags = SEASONAL_TAGS[currentSeason];
  
  const matchCount = tags.filter(tag => 
    seasonalTags.some(seasonTag => tag.includes(seasonTag))
  ).length;
  
  if (matchCount === 0) return 0.5; // 季節に関係ない商品
  if (matchCount === 1) return 0.75;
  return 1.0; // 複数マッチ
}

/**
 * 商品データを整形してSupabaseに保存（Phase 2対応）
 */
async function saveProducts(products, brand) {
  console.log(`📦 ${brand.name} の ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    
    // Phase 2: ブランド固有のタグと季節タグを追加
    const extractedTags = extractEnhancedTags(product);
    const combinedTags = [...new Set([...extractedTags, ...brand.tags])];
    
    // 季節スコアを計算
    const seasonalScore = calculateSeasonalScore(combinedTags);
    
    // 高画質画像を優先的に使用
    const imageUrl = product.largeImageUrls?.[0]?.imageUrl || 
                     product.mediumImageUrls?.[0]?.imageUrl || 
                     product.smallImageUrls?.[0]?.imageUrl || '';
    
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: imageUrl,
      brand: brand.name,
      price: product.itemPrice,
      tags: combinedTags.slice(0, 15), // 最大15個
      category: '100371',
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      source_brand: brand.name.toLowerCase().replace(/\s+/g, '_'), // Phase 2
      is_active: true,
      priority: brand.priority, // Phase 2: MVPブランドの優先度
      last_synced: new Date().toISOString(),
      // メタデータとして季節スコアを保存（将来の利用のため）
      metadata: {
        seasonal_score: seasonalScore,
        season: getCurrentSeason()
      }
    };
  });

  try {
    const isServiceRole = process.env.SUPABASE_SERVICE_KEY ? true : false;
    
    if (isServiceRole) {
      console.log('✅ Service Roleキーを使用してRLSをバイパス');
    } else {
      console.log('⚠️  Anon Keyを使用 - RLSポリシーに従います');
    }

    // バッチで挿入
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('external_products')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        errorCount += batch.length;
        console.error(`❌ ${brand.name} バッチ ${Math.floor(i/batchSize) + 1} エラー:`, error.message);
        if (error.message.includes('row-level security')) {
          console.error('⚠️  RLSポリシーエラー: SUPABASE_SERVICE_KEYが必要です');
          throw error;
        }
      } else {
        successCount += batch.length;
      }
    }
    
    console.log(`✅ ${brand.name}: 成功 ${successCount}件 / エラー ${errorCount}件`);
    return { success: successCount, error: errorCount };

  } catch (error) {
    console.error(`❌ ${brand.name} 保存エラー:`, error);
    return { success: 0, error: products.length };
  }
}

/**
 * 古い商品データの無効化とクリーンアップ（Phase 2）
 */
async function cleanupOldProducts() {
  try {
    // 3日以上更新されていない商品を無効化
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { error } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .lt('last_synced', threeDaysAgo.toISOString())
      .eq('source', 'rakuten');

    if (!error) {
      console.log('✅ 3日以上更新されていない商品を無効化しました');
    }

    // データベース容量管理（5万件を超えたら古い商品を削除）
    const { count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    if (count > 50000) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { error: deleteError } = await supabase
        .from('external_products')
        .delete()
        .lt('last_synced', thirtyDaysAgo.toISOString())
        .eq('is_active', false);
        
      if (!deleteError) {
        console.log('✅ 30日以上前の無効な商品を削除しました');
      }
    }

  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

/**
 * 統計情報の表示（Phase 2）
 */
async function showStatistics() {
  try {
    // ブランド別・優先度別の商品数を取得
    const { data: stats } = await supabase
      .from('external_products')
      .select('source_brand, priority')
      .eq('is_active', true);

    if (stats) {
      const brandStats = {};
      const priorityStats = { 1: 0, 2: 0, 3: 0, other: 0 };

      stats.forEach(item => {
        // ブランド別集計
        const brand = item.source_brand || 'unknown';
        brandStats[brand] = (brandStats[brand] || 0) + 1;
        
        // 優先度別集計
        const priority = item.priority || 999;
        if (priority <= 3) {
          priorityStats[priority]++;
        } else {
          priorityStats.other++;
        }
      });

      console.log('\n📊 ブランド別商品数:');
      Object.entries(brandStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([brand, count]) => {
          console.log(`   - ${brand}: ${count}件`);
        });

      console.log('\n📊 優先度別商品数:');
      console.log(`   - Priority 1 (最優先): ${priorityStats[1]}件`);
      console.log(`   - Priority 2 (優先): ${priorityStats[2]}件`);
      console.log(`   - Priority 3 (標準): ${priorityStats[3]}件`);
      console.log(`   - その他: ${priorityStats.other}件`);
    }

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
  console.log('\n🚀 MVP戦略に基づく楽天商品同期を開始します (Phase 2)...\n');
  console.log('📋 対象ブランド:', MVP_BRANDS.map(b => b.name).join(', '));
  console.log('🌸 現在の季節:', getCurrentSeason());
  console.log('');

  const syncResults = {
    totalSuccess: 0,
    totalError: 0,
    brandResults: []
  };

  try {
    // DRY RUNモードのチェック
    const isDryRun = process.env.DRY_RUN === 'true';
    if (isDryRun) {
      console.log('🔍 DRY RUNモード - データベースへの保存をスキップ\n');
    }

    // 時間帯とブランドの組み合わせで動的に選択
    const hour = new Date().getHours();
    const isBusinessHours = hour >= 9 && hour <= 18;
    
    // ビジネスアワーは優先度の高いブランド、それ以外は優先度の低いブランド
    const brandsToSync = MVP_BRANDS.filter(brand => 
      isBusinessHours ? brand.priority <= 2 : brand.priority >= 2
    );

    console.log(`⏰ 時間帯: ${isBusinessHours ? 'ビジネスアワー' : 'オフピーク'}`);
    console.log(`📦 同期対象: ${brandsToSync.map(b => b.name).join(', ')}\n`);

    // 優先度順にブランドを処理
    const sortedBrands = brandsToSync.sort((a, b) => a.priority - b.priority);

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
        if (isDryRun) {
          console.log(`  🔍 DRY RUN: ${allProducts.length}件の商品を取得`);
          console.log(`  例: ${allProducts[0].Item.itemName} - ¥${allProducts[0].Item.itemPrice}`);
        } else {
          const result = await saveProducts(allProducts, brand);
          syncResults.totalSuccess += result.success;
          syncResults.totalError += result.error;
          syncResults.brandResults.push({
            brand: brand.name,
            ...result
          });
        }
      } else {
        console.log(`  ⚠️ ${brand.name}: 商品が見つかりませんでした`);
      }

      // ブランド間の待機
      await sleep(2000);
    }

    if (!isDryRun) {
      // 古い商品の無効化とクリーンアップ
      await cleanupOldProducts();

      // 結果サマリー
      console.log('\n📈 同期結果サマリー:');
      console.log(`  成功: ${syncResults.totalSuccess}件`);
      console.log(`  エラー: ${syncResults.totalError}件`);
      console.log('\n📊 ブランド別詳細:');
      syncResults.brandResults.forEach(result => {
        console.log(`  ${result.brand}: 成功 ${result.success}件, エラー ${result.error}件`);
      });

      // 統計情報表示
      await showStatistics();
    }

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    
    // GitHub Actions用の詳細エラー出力
    console.error('\n=== エラー詳細 ===');
    console.error('エラータイプ:', error.constructor.name);
    console.error('エラーメッセージ:', error.message);
    if (error.response) {
      console.error('APIレスポンス:', error.response.data);
    }
    
    process.exit(1);
  }
}

// 実行
main().then(() => {
  console.log('\n✨ すべての処理が完了しました');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ 予期しないエラー:', error);
  process.exit(1);
});