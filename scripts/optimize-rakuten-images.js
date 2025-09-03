#!/usr/bin/env node
/**
 * 楽天画像URLの最適化スクリプト
 * 
 * 既存の楽天画像URLに最適なサイズパラメータを追加して、
 * 画像表示の問題を解決します
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase設定
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// カラーコード
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * 楽天の画像URLを最適化
 * _ex=800x800 パラメータを追加して高画質版にする
 */
function optimizeRakutenImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  let optimizedUrl = url.trim();
  
  // HTTPをHTTPSに変換
  if (optimizedUrl.startsWith('http://')) {
    optimizedUrl = optimizedUrl.replace('http://', 'https://');
  }
  
  // 楽天の画像URLの場合のみ処理
  if (!optimizedUrl.includes('rakuten.co.jp')) {
    return optimizedUrl;
  }
  
  // thumbnail.image.rakuten.co.jpの場合、_ex=800x800パラメータを追加
  if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
    // 既存の_exパラメータがあるか確認
    if (optimizedUrl.includes('_ex=')) {
      // 既に_exパラメータがある場合は、800x800に更新
      optimizedUrl = optimizedUrl.replace(/_ex=[^&]+/, '_ex=800x800');
    } else {
      // _exパラメータを追加
      if (optimizedUrl.includes('?')) {
        optimizedUrl = optimizedUrl + '&_ex=800x800';
      } else {
        optimizedUrl = optimizedUrl + '?_ex=800x800';
      }
    }
  }
  
  // shop.r10s.jpやimage.rakuten.co.jpの場合も同様に処理
  else if (optimizedUrl.includes('shop.r10s.jp') || optimizedUrl.includes('image.rakuten.co.jp')) {
    // サイズ指定のない画像URLの場合、より大きい画像を指定
    if (!optimizedUrl.includes('?')) {
      // 特に何もしない（元のURLをそのまま使用）
    }
  }
  
  // PC=パラメータを_ex=に変換（古い形式の場合）
  if (optimizedUrl.includes('PC=')) {
    optimizedUrl = optimizedUrl.replace(/PC=[^&]+/, '_ex=800x800');
  }
  
  return optimizedUrl;
}

async function updateImageUrls() {
  console.log(`${colors.bright}${colors.cyan}=====================================`);
  console.log(`  楽天画像URL最適化スクリプト`);
  console.log(`=====================================${colors.reset}\n`);

  try {
    // 1. まず対象となる商品を確認
    console.log(`${colors.yellow}📋 対象商品を確認中...${colors.reset}`);
    
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .ilike('image_url', '%rakuten.co.jp%')
      .is('is_active', true)
      .limit(1000); // 一度に処理する最大数
    
    if (error) {
      console.error(`${colors.red}❌ データ取得エラー:${colors.reset}`, error.message);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log(`${colors.green}✅ 更新が必要な楽天商品はありません${colors.reset}`);
      return;
    }
    
    console.log(`${colors.cyan}✅ ${products.length}件の楽天商品が見つかりました${colors.reset}\n`);
    
    // 2. 各商品の画像URLを最適化
    console.log(`${colors.yellow}🔄 画像URLを最適化中...${colors.reset}\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const updates = [];
    
    for (const product of products) {
      const originalUrl = product.image_url;
      const optimizedUrl = optimizeRakutenImageUrl(originalUrl);
      
      if (originalUrl !== optimizedUrl) {
        console.log(`${colors.cyan}📸 ${product.title?.substring(0, 40)}...${colors.reset}`);
        console.log(`  元のURL: ${colors.dim}${originalUrl?.substring(0, 60)}...${colors.reset}`);
        console.log(`  最適化: ${colors.green}${optimizedUrl?.substring(0, 60)}...${colors.reset}`);
        
        updates.push({
          id: product.id,
          image_url: optimizedUrl
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
    
    // 3. データベースを更新
    if (updates.length > 0) {
      console.log(`\n${colors.yellow}💾 データベースを更新中...${colors.reset}`);
      
      // バッチ更新（10件ずつ）
      const batchSize = 10;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        for (const update of batch) {
          const { error: updateError } = await supabase
            .from('external_products')
            .update({ image_url: update.image_url })
            .eq('id', update.id);
          
          if (updateError) {
            console.error(`${colors.red}❌ 更新エラー (${update.id}):${colors.reset}`, updateError.message);
            errorCount++;
          }
        }
        
        // 進捗表示
        const progress = Math.min(i + batchSize, updates.length);
        console.log(`  ${colors.green}進捗: ${progress}/${updates.length}${colors.reset}`);
      }
    }
    
    // 4. 結果サマリー
    console.log(`\n${colors.bright}${colors.magenta}=====================================`);
    console.log(`  更新結果`);
    console.log(`=====================================${colors.reset}\n`);
    
    console.log(`${colors.cyan}📊 処理結果:${colors.reset}`);
    console.log(`  処理対象: ${products.length}件`);
    console.log(`  ${colors.green}更新済み: ${updatedCount}件${colors.reset}`);
    console.log(`  スキップ: ${skippedCount}件（既に最適化済み）`);
    if (errorCount > 0) {
      console.log(`  ${colors.red}エラー: ${errorCount}件${colors.reset}`);
    }
    
    if (updatedCount > 0) {
      console.log(`\n${colors.green}✅ 画像URLの最適化が完了しました！${colors.reset}`);
      console.log(`${colors.yellow}📱 アプリを再起動して画像表示を確認してください${colors.reset}`);
    } else {
      console.log(`\n${colors.cyan}ℹ️  すべての画像URLは既に最適化されています${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ エラーが発生しました:${colors.reset}`, error.message);
  }
}

// 実行
updateImageUrls().catch(console.error);
