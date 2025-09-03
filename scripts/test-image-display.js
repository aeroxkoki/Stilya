#!/usr/bin/env node
/**
 * 画像表示問題のデバッグスクリプト
 * 
 * このスクリプトは以下を確認します：
 * 1. データベースの商品データと画像URLの状態
 * 2. 画像URLへのアクセス可能性
 * 3. 画像表示の問題の根本原因を特定
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
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
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 画像URLを最適化
function optimizeImageUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }
  
  let optimizedUrl = url.trim();
  
  try {
    // HTTPをHTTPSに変換
    if (optimizedUrl.startsWith('http://')) {
      optimizedUrl = optimizedUrl.replace('http://', 'https://');
    }
    
    // 楽天の画像URLの場合の最適化
    if (optimizedUrl.includes('rakuten.co.jp')) {
      // thumbnail.image.rakuten.co.jp の場合
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
        if (!optimizedUrl.includes('?_ex=')) {
          if (optimizedUrl.includes('?')) {
            optimizedUrl = optimizedUrl + '&_ex=800x800';
          } else {
            optimizedUrl = optimizedUrl + '?_ex=800x800';
          }
        }
      }
    }
    
    return optimizedUrl;
  } catch (error) {
    return null;
  }
}

// 画像URLにアクセスできるか確認
async function checkImageAccess(url) {
  if (!url) return { accessible: false, error: 'URL is null or empty' };
  
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const contentType = response.headers['content-type'];
    const isImage = contentType && contentType.startsWith('image/');
    
    return {
      accessible: response.status === 200,
      status: response.status,
      contentType,
      isImage,
      size: response.headers['content-length']
    };
  } catch (error) {
    // GETリクエストで再試行（HEADが失敗した場合）
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Range': 'bytes=0-0' // 最初の1バイトだけ取得
        }
      });
      
      return {
        accessible: response.status === 200 || response.status === 206,
        status: response.status,
        error: null
      };
    } catch (retryError) {
      return {
        accessible: false,
        error: retryError.message,
        status: retryError.response?.status
      };
    }
  }
}

// メイン処理
async function main() {
  console.log(`${colors.bright}${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  画像表示問題デバッグスクリプト${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}======================================${colors.reset}\n`);
  
  try {
    // 1. データベースの商品データを確認
    console.log(`${colors.yellow}📊 データベースの商品データを確認中...${colors.reset}`);
    
    const { data: products, error: dbError } = await supabase
      .from('external_products')
      .select('id, title, image_url, brand, price')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .limit(20)
      .order('priority', { ascending: true })
      .order('last_synced', { ascending: false });
    
    if (dbError) {
      console.error(`${colors.red}❌ データベースエラー:${colors.reset}`, dbError.message);
      return;
    }
    
    if (!products || products.length === 0) {
      console.error(`${colors.red}❌ データベースに商品が見つかりません${colors.reset}`);
      return;
    }
    
    console.log(`${colors.green}✅ ${products.length}件の商品が見つかりました${colors.reset}\n`);
    
    // 2. 各商品の画像URLを検証
    console.log(`${colors.yellow}🔍 画像URLの検証中...${colors.reset}\n`);
    
    const results = {
      total: products.length,
      withImage: 0,
      noImage: 0,
      accessible: 0,
      notAccessible: 0,
      httpUrls: 0,
      httpsUrls: 0,
      rakutenUrls: 0,
      optimizedUrls: 0
    };
    
    for (const product of products) {
      console.log(`${colors.cyan}商品: ${product.title?.substring(0, 40)}...${colors.reset}`);
      console.log(`  ID: ${product.id}`);
      
      if (!product.image_url) {
        console.log(`  ${colors.red}❌ 画像URLなし${colors.reset}`);
        results.noImage++;
        continue;
      }
      
      results.withImage++;
      
      // URLの形式を確認
      const isHttp = product.image_url.startsWith('http://');
      const isHttps = product.image_url.startsWith('https://');
      const isRakuten = product.image_url.includes('rakuten.co.jp');
      
      if (isHttp) results.httpUrls++;
      if (isHttps) results.httpsUrls++;
      if (isRakuten) results.rakutenUrls++;
      
      console.log(`  元のURL: ${colors.dim}${product.image_url.substring(0, 80)}...${colors.reset}`);
      console.log(`  形式: ${isHttp ? 'HTTP' : isHttps ? 'HTTPS' : 'その他'} ${isRakuten ? '(楽天)' : ''}`);
      
      // URLを最適化
      const optimizedUrl = optimizeImageUrl(product.image_url);
      if (optimizedUrl !== product.image_url) {
        results.optimizedUrls++;
        console.log(`  ${colors.green}最適化後: ${optimizedUrl.substring(0, 80)}...${colors.reset}`);
      }
      
      // アクセス可能性を確認
      const accessCheck = await checkImageAccess(optimizedUrl || product.image_url);
      
      if (accessCheck.accessible) {
        results.accessible++;
        console.log(`  ${colors.green}✅ アクセス可能${colors.reset}`);
        if (accessCheck.isImage) {
          console.log(`  ${colors.green}   画像タイプ: ${accessCheck.contentType}${colors.reset}`);
        }
      } else {
        results.notAccessible++;
        console.log(`  ${colors.red}❌ アクセス不可: ${accessCheck.error || 'Unknown error'}${colors.reset}`);
        if (accessCheck.status) {
          console.log(`  ${colors.red}   HTTPステータス: ${accessCheck.status}${colors.reset}`);
        }
      }
      
      console.log('');
    }
    
    // 3. 結果サマリー
    console.log(`${colors.bright}${colors.yellow}======================================${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}  診断結果サマリー${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}======================================${colors.reset}\n`);
    
    console.log(`${colors.cyan}📊 統計:${colors.reset}`);
    console.log(`  総商品数: ${results.total}`);
    console.log(`  画像URLあり: ${results.withImage} (${Math.round(results.withImage / results.total * 100)}%)`);
    console.log(`  画像URLなし: ${results.noImage} (${Math.round(results.noImage / results.total * 100)}%)`);
    console.log('');
    
    console.log(`${colors.cyan}🔗 URL形式:${colors.reset}`);
    console.log(`  HTTP URL: ${results.httpUrls} (${Math.round(results.httpUrls / results.withImage * 100)}%)`);
    console.log(`  HTTPS URL: ${results.httpsUrls} (${Math.round(results.httpsUrls / results.withImage * 100)}%)`);
    console.log(`  楽天 URL: ${results.rakutenUrls} (${Math.round(results.rakutenUrls / results.withImage * 100)}%)`);
    console.log(`  最適化された URL: ${results.optimizedUrls} (${Math.round(results.optimizedUrls / results.withImage * 100)}%)`);
    console.log('');
    
    console.log(`${colors.cyan}🌐 アクセス可能性:${colors.reset}`);
    console.log(`  アクセス可能: ${colors.green}${results.accessible}${colors.reset} (${Math.round(results.accessible / results.withImage * 100)}%)`);
    console.log(`  アクセス不可: ${colors.red}${results.notAccessible}${colors.reset} (${Math.round(results.notAccessible / results.withImage * 100)}%)`);
    console.log('');
    
    // 問題の診断
    console.log(`${colors.bright}${colors.magenta}🔍 問題の診断:${colors.reset}`);
    
    if (results.noImage > results.withImage * 0.5) {
      console.log(`  ${colors.red}⚠️  多くの商品に画像URLが設定されていません${colors.reset}`);
      console.log(`     → データベースの商品同期を確認してください`);
    }
    
    if (results.httpUrls > 0) {
      console.log(`  ${colors.yellow}⚠️  HTTPのURLが${results.httpUrls}件あります${colors.reset}`);
      console.log(`     → HTTPSに変換する必要があります`);
    }
    
    if (results.notAccessible > results.accessible * 0.3) {
      console.log(`  ${colors.red}⚠️  多くの画像URLにアクセスできません${colors.reset}`);
      console.log(`     → 画像URLの有効性を確認してください`);
      console.log(`     → CORSの問題がある可能性があります`);
    }
    
    if (results.rakutenUrls > 0 && results.optimizedUrls < results.rakutenUrls) {
      console.log(`  ${colors.yellow}⚠️  楽天の画像URLが最適化されていない可能性があります${colors.reset}`);
      console.log(`     → _ex=800x800パラメータの追加を検討してください`);
    }
    
    console.log('');
    console.log(`${colors.green}✅ 診断完了${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ エラー:${colors.reset}`, error.message);
  }
}

// 実行
main().catch(console.error);
