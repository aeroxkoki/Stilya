import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

/**
 * 画像URLの品質診断ツール
 */
export const diagnoseImageQuality = async () => {
  console.log('=== 画像品質診断開始 ===');
  
  try {
    // Supabaseから商品データを取得
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(10);
      
    if (error) {
      console.error('商品データ取得エラー:', error);
      return;
    }
    
    console.log(`\n取得した商品数: ${products?.length || 0}`);
    
    // 各商品の画像URLを分析
    products?.forEach((product: Product, index: number) => {
      console.log(`\n--- 商品 ${index + 1} ---`);
      console.log(`商品名: ${product.title}`);
      console.log(`画像URL: ${product.imageUrl}`);
      
      // URLパターンの分析
      const url = product.imageUrl;
      
      if (url.includes('rakuten.co.jp')) {
        console.log('楽天画像検出');
        
        // サムネイルか高画質版か判定
        if (url.includes('thumbnail.image.rakuten.co.jp')) {
          console.log('⚠️ サムネイル画像URL（低画質）');
        } else if (url.includes('image.rakuten.co.jp')) {
          console.log('✅ 高画質画像URL');
        }
        
        // サイズパラメータの確認
        const sizeMatches = url.match(/(_ex=|\\/)?(\\d+x\\d+)/g);
        if (sizeMatches) {
          console.log(`検出されたサイズ指定: ${sizeMatches.join(', ')}`);
          sizeMatches.forEach(size => {
            if (size.includes('128x128') || size.includes('64x64')) {
              console.log('⚠️ 低解像度サイズ検出');
            } else if (size.includes('600x600') || size.includes('640x640')) {
              console.log('✅ 高解像度サイズ検出');
            }
          });
        }
        
        // クエリパラメータの確認
        if (url.includes('?')) {
          const params = new URL(url).searchParams;
          console.log('クエリパラメータ:', Object.fromEntries(params));
        }
      }
    });
    
    console.log('\n=== 診断完了 ===');
    
  } catch (error) {
    console.error('診断エラー:', error);
  }
};

/**
 * 楽天画像URLの最適な高画質版を生成する
 */
export const generateOptimalRakutenImageUrl = (originalUrl: string): string => {
  if (!originalUrl || !originalUrl.includes('rakuten.co.jp')) {
    return originalUrl;
  }
  
  try {
    // URLオブジェクトとして解析
    const url = new URL(originalUrl);
    
    // thumbnail.image.rakuten.co.jp → image.rakuten.co.jp に変更
    if (url.hostname === 'thumbnail.image.rakuten.co.jp') {
      url.hostname = 'image.rakuten.co.jp';
    }
    
    // パスのサイズ指定を変更
    url.pathname = url.pathname
      .replace(/\\/128x128\\//, '/')
      .replace(/\\/64x64\\//, '/')
      .replace(/\\/pc\\//, '/')
      .replace(/\\/thumbnail\\//, '/');
    
    // クエリパラメータの最適化
    // _exパラメータを削除または高解像度に変更
    if (url.searchParams.has('_ex')) {
      url.searchParams.delete('_ex');
    }
    
    // キャッシュ無効化のためのタイムスタンプ追加（オプション）
    // url.searchParams.set('t', Date.now().toString());
    
    return url.toString();
    
  } catch (error) {
    console.error('楽天画像URL変換エラー:', error);
    return originalUrl;
  }
};

// デバッグ用：画像URL変換のテスト
export const testImageUrlConversion = () => {
  const testUrls = [
    'https://thumbnail.image.rakuten.co.jp/@0_mall/test/cabinet/128x128/item.jpg?_ex=128x128',
    'https://image.rakuten.co.jp/@0_mall/test/cabinet/item.jpg?_ex=640x640',
    'https://thumbnail.image.rakuten.co.jp/@0_mall/test/cabinet/pc/item.jpg',
  ];
  
  console.log('=== 画像URL変換テスト ===');
  testUrls.forEach(url => {
    console.log(`\n元URL: ${url}`);
    console.log(`変換後: ${generateOptimalRakutenImageUrl(url)}`);
  });
};
