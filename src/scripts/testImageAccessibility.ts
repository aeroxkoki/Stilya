import { supabase } from '../services/supabase';

/**
 * データベース内の画像URLのアクセシビリティをテストする
 */
async function testImageAccessibility() {
  console.log('=== 画像URLアクセシビリティテスト ===');
  console.log('開始時刻:', new Date().toLocaleString());
  
  try {
    // ランダムに10件の商品を取得
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .order('random()')
      .limit(10);
    
    if (error) {
      console.error('データ取得エラー:', error);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('テスト対象の商品が見つかりません');
      return;
    }
    
    console.log(`\n${products.length}件の商品画像をテストします...\n`);
    
    const results = {
      success: 0,
      failed: 0,
      details: [] as any[]
    };
    
    // 各画像URLをテスト
    for (const product of products) {
      console.log(`テスト中: ${product.title.substring(0, 50)}...`);
      
      try {
        // HEADリクエストで画像の存在を確認
        const response = await fetch(product.image_url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Stilya/1.0)'
          }
        });
        
        const result = {
          id: product.id,
          title: product.title.substring(0, 50) + '...',
          url: product.image_url,
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        };
        
        results.details.push(result);
        
        if (response.ok) {
          results.success++;
          console.log(`  ✅ 成功 (${response.status})`);
          
          // 高画質URLかチェック
          if (product.image_url.includes('thumbnail.image.rakuten.co.jp')) {
            console.log('  ⚠️  警告: サムネイルURLが検出されました');
          }
        } else {
          results.failed++;
          console.log(`  ❌ 失敗 (${response.status})`);
        }
      } catch (error) {
        results.failed++;
        console.log(`  ❌ エラー:`, error.message);
        
        results.details.push({
          id: product.id,
          title: product.title.substring(0, 50) + '...',
          url: product.image_url,
          status: 0,
          ok: false,
          error: error.message
        });
      }
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 結果サマリー
    console.log('\n=== テスト結果 ===');
    console.log(`成功: ${results.success}件 (${(results.success / products.length * 100).toFixed(1)}%)`);
    console.log(`失敗: ${results.failed}件 (${(results.failed / products.length * 100).toFixed(1)}%)`);
    
    // 失敗した画像の詳細
    if (results.failed > 0) {
      console.log('\n=== 失敗した画像 ===');
      results.details
        .filter(r => !r.ok)
        .forEach(r => {
          console.log(`- ${r.title}`);
          console.log(`  URL: ${r.url}`);
          console.log(`  ステータス: ${r.status || 'エラー'}`);
          if (r.error) console.log(`  エラー: ${r.error}`);
        });
    }
    
    // 成功した画像の詳細（デバッグ用）
    if (results.success > 0) {
      console.log('\n=== 成功した画像（最初の3件）===');
      results.details
        .filter(r => r.ok)
        .slice(0, 3)
        .forEach(r => {
          console.log(`- ${r.title}`);
          console.log(`  URL: ${r.url}`);
          console.log(`  Content-Type: ${r.contentType}`);
          console.log(`  Size: ${r.contentLength ? `${(parseInt(r.contentLength) / 1024).toFixed(1)}KB` : '不明'}`);
        });
    }
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
  
  console.log('\n終了時刻:', new Date().toLocaleString());
  process.exit(0);
}

// スクリプトを実行
testImageAccessibility();
