const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 画像表示問題の診断スクリプト
 * 実際の商品データから画像URLの状態を確認
 */
async function diagnoseImageIssue() {
  console.log('🔍 画像表示問題の診断を開始します...\n');

  try {
    // 1. データベースから商品を取得
    console.log('📦 商品データを取得中...');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, image_url, brand, source')
      .limit(50);

    if (error) {
      console.error('❌ 商品取得エラー:', error);
      return;
    }

    console.log(`✅ ${products.length}件の商品を取得しました\n`);

    // 2. 画像URLの分析
    const urlStats = {
      total: products.length,
      hasImage: 0,
      noImage: 0,
      httpsUrls: 0,
      httpUrls: 0,
      thumbnailUrls: 0,
      lowResUrls: 0,
      validUrls: 0,
      invalidUrls: 0,
      rakutenUrls: 0,
      otherUrls: 0,
    };

    const problemProducts = [];
    const sampleUrls = [];

    products.forEach((product) => {
      const url = product.image_url;

      if (!url) {
        urlStats.noImage++;
        return;
      }

      urlStats.hasImage++;

      // HTTPS/HTTPチェック
      if (url.startsWith('https://')) {
        urlStats.httpsUrls++;
      } else if (url.startsWith('http://')) {
        urlStats.httpUrls++;
        problemProducts.push({
          id: product.id,
          title: product.title,
          issue: 'HTTPプロトコル',
          url
        });
      }

      // 楽天URLチェック
      if (url.includes('rakuten.co.jp')) {
        urlStats.rakutenUrls++;

        // サムネイルチェック
        if (url.includes('thumbnail.image.rakuten.co.jp')) {
          urlStats.thumbnailUrls++;
          problemProducts.push({
            id: product.id,
            title: product.title,
            issue: 'サムネイルURL',
            url
          });
        }

        // 低解像度チェック
        if (url.includes('128x128') || url.includes('64x64') || 
            url.includes('_ex=128x128') || url.includes('_ex=64x64')) {
          urlStats.lowResUrls++;
          if (!url.includes('thumbnail.image.rakuten.co.jp')) {
            problemProducts.push({
              id: product.id,
              title: product.title,
              issue: '低解像度指定',
              url
            });
          }
        }
      } else {
        urlStats.otherUrls++;
      }

      // URL形式の検証
      try {
        new URL(url);
        urlStats.validUrls++;
      } catch {
        urlStats.invalidUrls++;
        problemProducts.push({
          id: product.id,
          title: product.title,
          issue: '無効なURL形式',
          url
        });
      }

      // サンプルURLを収集（最初の5件）
      if (sampleUrls.length < 5 && url) {
        sampleUrls.push({
          brand: product.brand,
          url: url.substring(0, 100) + (url.length > 100 ? '...' : '')
        });
      }
    });

    // 3. 診断結果の表示
    console.log('📊 画像URL統計:');
    console.log('================');
    console.log(`総商品数: ${urlStats.total}`);
    console.log(`画像あり: ${urlStats.hasImage} (${(urlStats.hasImage / urlStats.total * 100).toFixed(1)}%)`);
    console.log(`画像なし: ${urlStats.noImage} (${(urlStats.noImage / urlStats.total * 100).toFixed(1)}%)`);
    console.log('');
    console.log('🔒 プロトコル:');
    console.log(`  HTTPS: ${urlStats.httpsUrls}`);
    console.log(`  HTTP: ${urlStats.httpUrls} ${urlStats.httpUrls > 0 ? '⚠️' : '✅'}`);
    console.log('');
    console.log('🏢 ソース:');
    console.log(`  楽天: ${urlStats.rakutenUrls}`);
    console.log(`  その他: ${urlStats.otherUrls}`);
    console.log('');
    console.log('⚠️ 問題のあるURL:');
    console.log(`  サムネイル: ${urlStats.thumbnailUrls}`);
    console.log(`  低解像度: ${urlStats.lowResUrls}`);
    console.log(`  無効な形式: ${urlStats.invalidUrls}`);
    console.log('');
    console.log('✅ 有効なURL形式: ' + urlStats.validUrls);

    // 4. 問題のある商品の詳細
    if (problemProducts.length > 0) {
      console.log('\n🚨 問題のある商品 (最初の10件):');
      console.log('================================');
      problemProducts.slice(0, 10).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   問題: ${product.issue}`);
        console.log(`   URL: ${product.url.substring(0, 80)}...`);
      });
    }

    // 5. サンプルURL
    console.log('\n📷 サンプルURL:');
    console.log('===============');
    sampleUrls.forEach((sample, index) => {
      console.log(`${index + 1}. ${sample.brand || 'ブランド不明'}`);
      console.log(`   ${sample.url}`);
    });

    // 6. 推奨事項
    console.log('\n💡 推奨事項:');
    console.log('============');
    
    if (urlStats.httpUrls > 0) {
      console.log('• HTTPのURLをHTTPSに変換する必要があります');
    }
    
    if (urlStats.thumbnailUrls > 0) {
      console.log('• サムネイルURLを高画質版に変換する必要があります');
    }
    
    if (urlStats.lowResUrls > 0) {
      console.log('• 低解像度指定を削除する必要があります');
    }
    
    if (urlStats.invalidUrls > 0) {
      console.log('• 無効なURL形式を修正する必要があります');
    }

    if (urlStats.httpUrls === 0 && urlStats.thumbnailUrls === 0 && 
        urlStats.lowResUrls === 0 && urlStats.invalidUrls === 0) {
      console.log('✨ すべての画像URLは正常です！');
    }

    // 7. CachedImageコンポーネントの状態
    console.log('\n🔧 CachedImageコンポーネントの推奨設定:');
    console.log('=====================================');
    console.log('• optimizeUrl: true（URL最適化を有効化）');
    console.log('• showLoadingIndicator: true（読み込み中の表示）');
    console.log('• showErrorFallback: true（エラー時のフォールバック）');
    console.log('• デフォルトでURL最適化を有効にすることを推奨');

  } catch (error) {
    console.error('❌ 診断中にエラーが発生しました:', error);
  }
}

// 実行
diagnoseImageIssue();
