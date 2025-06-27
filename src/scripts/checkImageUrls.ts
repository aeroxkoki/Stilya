import { supabase } from '../services/supabase';

/**
 * Supabase内の商品画像URLの状態を確認するスクリプト
 */
async function checkImageUrls() {
  console.log('=== 商品画像URLチェック開始 ===');
  
  try {
    // 商品データを取得（最初の100件）
    const { data: products, error, count } = await supabase
      .from('external_products')
      .select('id, title, image_url, source', { count: 'exact' })
      .eq('is_active', true)
      .limit(100);
    
    if (error) {
      console.error('エラー:', error);
      return;
    }
    
    console.log(`総商品数: ${count}`);
    console.log(`取得した商品数: ${products?.length || 0}`);
    
    if (!products || products.length === 0) {
      console.log('商品が見つかりません');
      return;
    }
    
    // 画像URLの状態を分析
    const analysis = {
      total: products.length,
      withImage: 0,
      withoutImage: 0,
      invalidUrls: [],
      thumbnailUrls: [],
      highQualityUrls: [],
      sources: {} as Record<string, number>
    };
    
    products.forEach((product: any) => {
      // ソース別の集計
      const source = product.source || 'unknown';
      analysis.sources[source] = (analysis.sources[source] || 0) + 1;
      
      if (!product.image_url || product.image_url.trim() === '') {
        analysis.withoutImage++;
        console.log(`❌ 画像URLなし: ${product.title.substring(0, 30)}...`);
      } else {
        analysis.withImage++;
        
        // URLのパターンを確認
        const url = product.image_url;
        
        // サムネイルURL（低画質）
        if (url.includes('thumbnail.image.rakuten.co.jp') || 
            url.includes('128x128') || 
            url.includes('64x64') ||
            url.includes('_ex=128x128') ||
            url.includes('_ex=64x64')) {
          analysis.thumbnailUrls.push({
            id: product.id,
            title: product.title.substring(0, 30) + '...',
            url: url
          });
        } 
        // 高画質URL
        else if (url.includes('image.rakuten.co.jp') && 
                 !url.includes('thumbnail') && 
                 !url.includes('128x128') && 
                 !url.includes('64x64')) {
          analysis.highQualityUrls.push({
            id: product.id,
            title: product.title.substring(0, 30) + '...',
            url: url
          });
        }
        
        // 無効なURLパターン
        if (url.includes('undefined') || 
            url.includes('null') || 
            url.includes('placeholder') ||
            url === 'https://' ||
            url === 'http://') {
          analysis.invalidUrls.push({
            id: product.id,
            title: product.title.substring(0, 30) + '...',
            url: url
          });
        }
      }
    });
    
    // 結果を表示
    console.log('\n=== 分析結果 ===');
    console.log(`画像URLあり: ${analysis.withImage} (${(analysis.withImage / analysis.total * 100).toFixed(1)}%)`);
    console.log(`画像URLなし: ${analysis.withoutImage} (${(analysis.withoutImage / analysis.total * 100).toFixed(1)}%)`);
    
    console.log('\n=== ソース別商品数 ===');
    Object.entries(analysis.sources).forEach(([source, count]) => {
      console.log(`${source}: ${count}`);
    });
    
    console.log('\n=== URLパターン分析 ===');
    console.log(`サムネイルURL（低画質）: ${analysis.thumbnailUrls.length}`);
    console.log(`高画質URL: ${analysis.highQualityUrls.length}`);
    console.log(`無効なURL: ${analysis.invalidUrls.length}`);
    
    if (analysis.thumbnailUrls.length > 0) {
      console.log('\n=== サムネイルURL例（最初の5件）===');
      analysis.thumbnailUrls.slice(0, 5).forEach(item => {
        console.log(`- ${item.title}`);
        console.log(`  URL: ${item.url}`);
      });
    }
    
    if (analysis.invalidUrls.length > 0) {
      console.log('\n=== 無効なURL例 ===');
      analysis.invalidUrls.forEach(item => {
        console.log(`- ${item.title}`);
        console.log(`  URL: ${item.url}`);
      });
    }
    
    // 修正が必要な商品数を表示
    const needsOptimization = analysis.thumbnailUrls.length;
    if (needsOptimization > 0) {
      console.log(`\n⚠️  ${needsOptimization}件の商品画像URLが最適化可能です`);
    }
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
  
  process.exit(0);
}

// スクリプトを実行
checkImageUrls();
