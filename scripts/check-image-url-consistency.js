#!/usr/bin/env node
/**
 * 画像URL整合性チェックスクリプト
 * データベース内の画像URLサイズを確認
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImageUrlConsistency() {
  console.log('🔍 画像URL整合性チェックを開始します...\n');
  
  try {
    // 商品データをサンプリング（最新1000件）
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, image_url, source_brand, last_synced')
      .order('last_synced', { ascending: false })
      .limit(1000);
    
    if (error) {
      console.error('❌ データ取得エラー:', error);
      return;
    }
    
    console.log(`📊 チェック対象: ${products.length}件の商品\n`);
    
    // 画像URLサイズの分析
    const sizePatterns = {
      '800x800': 0,
      '400x400': 0,
      '300x300': 0,
      '128x128': 0,
      'サイズ指定なし': 0,
      '楽天以外': 0,
      'プレースホルダー': 0,
      '無効URL': 0
    };
    
    const brandStats = {};
    
    products.forEach(product => {
      const url = product.image_url;
      
      if (!url) {
        sizePatterns['無効URL']++;
        return;
      }
      
      // ブランド別統計の初期化
      if (!brandStats[product.source_brand]) {
        brandStats[product.source_brand] = {
          total: 0,
          '800x800': 0,
          '400x400': 0,
          other: 0
        };
      }
      brandStats[product.source_brand].total++;
      
      // プレースホルダーチェック
      if (url.includes('picsum.photos')) {
        sizePatterns['プレースホルダー']++;
        return;
      }
      
      // 楽天URLチェック
      if (url.includes('rakuten.co.jp')) {
        if (url.includes('_ex=800x800')) {
          sizePatterns['800x800']++;
          brandStats[product.source_brand]['800x800']++;
        } else if (url.includes('_ex=400x400')) {
          sizePatterns['400x400']++;
          brandStats[product.source_brand]['400x400']++;
        } else if (url.includes('_ex=300x300')) {
          sizePatterns['300x300']++;
          brandStats[product.source_brand].other++;
        } else if (url.includes('_ex=128x128')) {
          sizePatterns['128x128']++;
          brandStats[product.source_brand].other++;
        } else {
          sizePatterns['サイズ指定なし']++;
          brandStats[product.source_brand].other++;
        }
      } else {
        sizePatterns['楽天以外']++;
      }
    });
    
    // 結果の表示
    console.log('📈 画像URLサイズ分布:');
    console.log('='.repeat(50));
    Object.entries(sizePatterns).forEach(([pattern, count]) => {
      const percentage = ((count / products.length) * 100).toFixed(1);
      console.log(`${pattern.padEnd(20)}: ${count.toString().padStart(5)}件 (${percentage}%)`);
    });
    
    console.log('\n📊 ブランド別の800x800採用率（上位10ブランド）:');
    console.log('='.repeat(60));
    
    const brandList = Object.entries(brandStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);
    
    brandList.forEach(([brand, stats]) => {
      const rate800 = ((stats['800x800'] / stats.total) * 100).toFixed(1);
      const rate400 = ((stats['400x400'] / stats.total) * 100).toFixed(1);
      console.log(`${brand.padEnd(25)}: 800x800=${rate800}%, 400x400=${rate400}% (計${stats.total}件)`);
    });
    
    // 最新同期日時の分析
    console.log('\n📅 同期タイミング分析:');
    console.log('='.repeat(50));
    
    const now = new Date();
    const timeBuckets = {
      '1時間以内': 0,
      '24時間以内': 0,
      '7日以内': 0,
      '30日以内': 0,
      '30日以上前': 0
    };
    
    products.forEach(product => {
      const syncTime = new Date(product.last_synced);
      const diffHours = (now - syncTime) / (1000 * 60 * 60);
      
      if (diffHours < 1) timeBuckets['1時間以内']++;
      else if (diffHours < 24) timeBuckets['24時間以内']++;
      else if (diffHours < 24 * 7) timeBuckets['7日以内']++;
      else if (diffHours < 24 * 30) timeBuckets['30日以内']++;
      else timeBuckets['30日以上前']++;
    });
    
    Object.entries(timeBuckets).forEach(([bucket, count]) => {
      const percentage = ((count / products.length) * 100).toFixed(1);
      console.log(`${bucket.padEnd(15)}: ${count.toString().padStart(5)}件 (${percentage}%)`);
    });
    
    // 提案
    console.log('\n💡 提案:');
    console.log('='.repeat(50));
    
    const total800 = sizePatterns['800x800'];
    const totalOther = products.length - total800 - sizePatterns['プレースホルダー'] - sizePatterns['楽天以外'];
    
    if (totalOther > 0) {
      console.log(`⚠️  ${totalOther}件の商品が800x800以外のサイズを使用しています。`);
      console.log('   → 画像URL更新スクリプトの実行を推奨します。');
      console.log('   実行コマンド: npm run script:update-image-urls');
    } else {
      console.log('✅ すべての楽天商品画像が800x800サイズに最適化されています！');
    }
    
    // 画像URLのサンプル表示
    console.log('\n📸 画像URLサンプル（各サイズから1件ずつ）:');
    console.log('='.repeat(80));
    
    const samples = {
      '800x800': products.find(p => p.image_url?.includes('_ex=800x800')),
      '400x400': products.find(p => p.image_url?.includes('_ex=400x400')),
      'サイズ指定なし': products.find(p => p.image_url?.includes('rakuten') && !p.image_url?.includes('_ex='))
    };
    
    Object.entries(samples).forEach(([size, product]) => {
      if (product) {
        console.log(`\n[${size}]`);
        console.log(`ブランド: ${product.source_brand}`);
        console.log(`URL: ${product.image_url}`);
      }
    });
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
checkImageUrlConsistency();
