import { RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID } from '../utils/env';

/**
 * 楽天APIの実際のレスポンスを確認するテストスクリプト
 * 画像URLの形式を詳しく調査する
 */
async function testRakutenApiResponse() {
  console.log('=== 楽天APIレスポンステスト ===');
  
  // APIキーの確認
  if (!RAKUTEN_APP_ID) {
    console.error('❌ RAKUTEN_APP_IDが設定されていません');
    return;
  }
  
  console.log('✅ APIキーが設定されています');
  
  try {
    // テスト用のAPIリクエスト（商品を3件だけ取得）
    const params = new URLSearchParams({
      format: 'json',
      keyword: 'ワンピース',
      genreId: '100371', // レディースファッション
      page: '1',
      hits: '3',
      applicationId: RAKUTEN_APP_ID,
      ...(RAKUTEN_AFFILIATE_ID ? { affiliateId: RAKUTEN_AFFILIATE_ID } : {}),
      sort: '+updateTimestamp',
      imageFlag: '1',
      elements: 'itemName,itemPrice,itemCode,itemUrl,shopName,shopUrl,affiliateUrl,mediumImageUrls,imageUrl,smallImageUrls',
    });
    
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params}`;
    
    console.log('\nAPIリクエスト送信中...');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data || !data.Items || data.Items.length === 0) {
      console.error('❌ 商品データが取得できませんでした');
      return;
    }
    
    console.log(`\n✅ ${data.Items.length}件の商品を取得しました`);
    
    // 各商品の画像URLを詳しく調査
    data.Items.forEach((item: any, index: number) => {
      const product = item.Item || item;
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`商品 ${index + 1}: ${product.itemName?.substring(0, 50)}...`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      // imageUrl（単一）
      if (product.imageUrl) {
        console.log('\n📷 imageUrl:');
        console.log(`  URL: ${product.imageUrl}`);
        analyzeImageUrl(product.imageUrl);
      }
      
      // mediumImageUrls（配列）
      if (product.mediumImageUrls && product.mediumImageUrls.length > 0) {
        console.log('\n📷 mediumImageUrls:');
        product.mediumImageUrls.forEach((url: any, i: number) => {
          const imageUrl = typeof url === 'string' ? url : url.imageUrl;
          console.log(`  [${i}] URL: ${imageUrl}`);
          if (i === 0) analyzeImageUrl(imageUrl);
        });
      }
      
      // smallImageUrls（配列）
      if (product.smallImageUrls && product.smallImageUrls.length > 0) {
        console.log('\n📷 smallImageUrls:');
        product.smallImageUrls.forEach((url: any, i: number) => {
          const imageUrl = typeof url === 'string' ? url : url.imageUrl;
          console.log(`  [${i}] URL: ${imageUrl}`);
          if (i === 0) analyzeImageUrl(imageUrl);
        });
      }
    });
    
    console.log('\n\n=== 分析結果サマリー ===');
    console.log('楽天APIは以下の形式で画像URLを返します：');
    console.log('1. imageUrl: 通常128x128のサムネイル画像');
    console.log('2. mediumImageUrls: 配列形式、最初の要素が商品のメイン画像');
    console.log('3. smallImageUrls: 配列形式、64x64のサムネイル画像');
    console.log('\n重要: mediumImageUrlsもthumbnailドメインを使用している場合があります');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

/**
 * 画像URLを分析する
 */
function analyzeImageUrl(url: string) {
  if (!url) return;
  
  const analysis = {
    domain: '',
    isThumbnail: false,
    hasSize: false,
    sizeParam: '',
  };
  
  // ドメインの抽出
  const domainMatch = url.match(/https?:\/\/([^\/]+)/);
  if (domainMatch) {
    analysis.domain = domainMatch[1];
  }
  
  // サムネイルドメインかチェック
  analysis.isThumbnail = url.includes('thumbnail.image.rakuten.co.jp');
  
  // サイズパラメータのチェック
  if (url.includes('128x128')) analysis.sizeParam = '128x128';
  else if (url.includes('64x64')) analysis.sizeParam = '64x64';
  else if (url.includes('_ex=')) {
    const sizeMatch = url.match(/_ex=(\d+x\d+)/);
    if (sizeMatch) analysis.sizeParam = sizeMatch[1];
  }
  
  analysis.hasSize = !!analysis.sizeParam;
  
  console.log('  分析結果:');
  console.log(`    - ドメイン: ${analysis.domain}`);
  console.log(`    - サムネイルドメイン: ${analysis.isThumbnail ? '⚠️ はい' : '✅ いいえ'}`);
  console.log(`    - サイズ指定: ${analysis.hasSize ? `あり (${analysis.sizeParam})` : 'なし'}`);
  
  // 最適化の提案
  if (analysis.isThumbnail) {
    const optimizedUrl = url
      .replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp')
      .replace('/128x128/', '/')
      .replace('/64x64/', '/')
      .replace('?_ex=128x128', '')
      .replace('?_ex=64x64', '');
    console.log(`    - 🔧 最適化後: ${optimizedUrl}`);
  }
}

// スクリプトを実行
testRakutenApiResponse();
